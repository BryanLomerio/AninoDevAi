
export const loadVapiSDK = async (apiKey: string) => {
  try {
    const vapiModule = await import('@vapi-ai/web');
    if (typeof vapiModule.createVAPI === 'function') {
      return vapiModule.createVAPI(apiKey);
    }
    throw new Error("createVAPI function not found in Vapi module");
  } catch (err: any) {
    throw new Error("Failed to load Vapi SDK: " + err.message);
  }
};

export const createVapiCall = async (vapi: any, text: string) => {
  try {
    const call = vapi.createCall({
      recipient: { name: "User" },
      assistant: {
        voice: {
          provider: "11labs",
          voiceId: "daniel",
        },
      },
    });

    await call.connect();
    call.send({ text });
    return true;
  } catch (err) {
    console.error("Vapi speech error:", err);
    return false;
  }
};
