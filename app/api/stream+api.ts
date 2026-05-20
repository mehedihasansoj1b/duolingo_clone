import { lessons } from "../../data/lessons";
import { languages } from "../../data/languages";

async function signJwtHS256(payload: any, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const base64UrlEncode = (str: string) => {
    return btoa(str)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };
  const base64UrlEncodeUint8Array = (buf: Uint8Array) => {
    let binary = "";
    for (let i = 0; i < buf.byteLength; i++) {
      binary += String.fromCharCode(buf[i]);
    }
    return btoa(binary)
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(dataToSign));
  return `${dataToSign}.${base64UrlEncodeUint8Array(new Uint8Array(signature))}`;
}

export async function POST(request: Request) {
  try {
    const { lessonId, languageId, userId, userName, userImage } = await request.json();

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("Stream credentials missing on server");
      return Response.json(
        { error: "Stream credentials are not configured on the server." },
        { status: 500 }
      );
    }

    if (!userId) {
      return Response.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Sanitize IDs so they match Stream requirements (alphanumeric, -, _)
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const sanitizedLessonId = lessonId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const callId = `lesson_${sanitizedLessonId}_${sanitizedUserId}`;

    // Generate user token for client-side authentication
    const tokenPayload = {
      user_id: sanitizedUserId,
      name: userName || sanitizedUserId,
      image: userImage || "",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };
    const userToken = await signJwtHS256(tokenPayload, apiSecret);

    // Generate a short-lived server token for administrative REST API access
    const serverToken = await signJwtHS256(
      {
        server: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      },
      apiSecret
    );

    // 1. Upsert user in Stream Video database.
    // The users payload is a dictionary keyed by the user ID.
    const upsertResponse = await fetch(
      `https://video.stream-io-api.com/api/v2/users?api_key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": serverToken,
          "stream-auth-type": "jwt",
        },
        body: JSON.stringify({
          users: {
            [sanitizedUserId]: {
              id: sanitizedUserId,
              name: userName || sanitizedUserId,
              image: userImage || "",
              role: "user",
            },
            "agent-teacher": {
              id: "agent-teacher",
              name: "Sarah",
              image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop",
              role: "admin",
            },
          },
        }),
      }
    );

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text();
      console.error("Stream API error during user upsert:", errorText);
      return Response.json(
        { error: `Failed to upsert user on Stream: ${errorText}` },
        { status: upsertResponse.status }
      );
    }

    // 2. Create the call via Stream REST API (GetOrCreateCall pattern)
    // We add the user as a member so they are fully authorized to join.
    const response = await fetch(
      `https://video.stream-io-api.com/api/v2/video/call/default/${callId}?api_key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": serverToken,
          "stream-auth-type": "jwt",
        },
        body: JSON.stringify({
          data: {
            created_by_id: sanitizedUserId,
            members: [
              { user_id: sanitizedUserId, role: "host" },
              { user_id: "agent-teacher", role: "admin" }
            ],
            custom: {
              lessonId,
              languageId,
              userName: userName || sanitizedUserId,
              title: lessons.find((l) => l.id === lessonId)?.title || "",
              languageName: languages.find((lang) => lang.id === languageId)?.name || "Spanish",
              goals: lessons.find((l) => l.id === lessonId)?.goals || [],
              vocabulary: lessons.find((l) => l.id === lessonId)?.vocabulary || [],
              phrases: lessons.find((l) => l.id === lessonId)?.phrases || [],
              aiTeacherPrompt: lessons.find((l) => l.id === lessonId)?.aiTeacherPrompt || {},
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Stream API error during call creation:", errorText);
      return Response.json(
        { error: `Failed to create call on Stream: ${errorText}` },
        { status: response.status }
      );
    }

    const callData = await response.json();

    return Response.json({
      apiKey,
      token: userToken,
      callId,
      userId: sanitizedUserId,
      callData,
    });
  } catch (error: any) {
    console.error("Error in stream api route:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
