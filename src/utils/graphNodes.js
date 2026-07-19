export async function security_guardrail(state = {}) {
  const text = state?.description || "";
  // Case-insensitive validation for prompt injection
  const injectionPatterns = [
    /ignore previous/i,
    /bypass/i,
    /system prompt/i,
    /drop table/i,
    /<script>/i,
    /you are now/i
  ];
  
  const isSafe = !injectionPatterns.some(pattern => pattern.test(text));
  
  return { 
    is_safe: isSafe,
    error_message: isSafe ? null : "Prompt injection or unsafe content detected.",
    execution_path: isSafe ? ["[Guardrail Checked]"] : ["[Security Alert: Processing Aborted]"]
  };
}

export async function environmental_enricher(state = {}) {
  let priority = state?.priority || "Medium";
  const cat = state?.category || "";
  const weather = state?.weather?.toLowerCase() || "";
  let logMessage = "[Priority Evaluated]";

  // Evaluates the category alongside active weather context.
  if (cat === "Water Leak" && (weather.includes("rain") || weather.includes("storm"))) {
    priority = "Critical";
    logMessage = "[Priority Evaluated (Escalated)]";
  } else if (cat === "Streetlight" && weather.includes("fog")) {
    priority = "High";
    logMessage = "[Priority Evaluated (Escalated)]";
  }

  return {
    priority: priority,
    execution_path: [logMessage]
  };
}
