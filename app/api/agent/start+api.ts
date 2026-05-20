export async function POST(request: Request) {
  try {
    const { callId, callType = "default" } = await request.json();

    if (!callId) {
      return Response.json({ error: "callId is required" }, { status: 400 });
    }

    const agentServerUrl = `http://localhost:8000/calls/${callId}/sessions`;
    console.log(`Proxying agent start to: ${agentServerUrl}`);

    const response = await fetch(agentServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        call_type: callType,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Agent server start error: ${errText}`);
      return Response.json(
        { error: `Agent server error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error starting agent session:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
