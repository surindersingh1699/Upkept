export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.DD_ENV !== "development") {
    const { default: tracer } = await import("dd-trace");

    tracer.init({
      service: "upkept",
      env: process.env.DD_ENV || "development",
      version: process.env.DD_VERSION || "0.1.0",
      logInjection: true,
    });

    tracer.llmobs.enable({
      mlApp: "upkept",
      agentlessEnabled: true,
    });
  }
}
