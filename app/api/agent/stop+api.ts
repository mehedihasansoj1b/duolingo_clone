export async function POST(request: Request) {
  try {
    const { callId, sessionId } = await request.json();

    if (!callId || !sessionId) {
      return Response.json({ error: "callId and sessionId are required" }, { status: 400 });
    }

    const agentServerUrl = `http://localhost:8000/calls/${callId}/sessions/${sessionId}`;
    console.log(`Proxying agent stop to: ${agentServerUrl}`);

    const response = await fetch(agentServerUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Agent server stop error: ${errText}`);
      return Response.json(
        { error: `Agent server error: ${errText}` },
        { status: response.status }
      );
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error stopping agent session:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
