import Groq from 'groq-sdk';

/**
 * Dual-Mode Client Service for Groq API
 * 
 * Supports Local Development Mode via client-side VITE_GROQ_API_KEY injection
 * AND secure Production Mode via Vercel serverless proxy (/api/analyze) which uses LangGraph.
 */

const SYSTEM_PROMPT = `You are an AI Civic Complaint Routing Agent. Analyze the user's issue context and map it to a specific category, department, and priority. Also draft a professional formal complaint description based on their raw context.
          
You MUST output strictly in JSON format using this exact schema:
{
  "category": "Pothole" | "Streetlight" | "Garbage" | "Water Leak" | "Other",
  "department": "Public Works" | "Electrical Department" | "Sanitation Dept" | "Water & Sewage Board",
  "priority": "Low" | "Medium" | "High" | "Critical",
  "formal_complaint": "A professionally formatted complaint letter based on the user's context..."
}`;

export const analyzeIssue = async (contextText, weather = 'Clear') => {
  try {
    const localKey = import.meta.env.VITE_GROQ_API_KEY;

    // LOCAL DEVELOPMENT MODE (Lightning fast, direct client SDK)
    if (localKey && localKey.length > 5) {
      console.log("Groq Service: Running in Local Development Mode (Client SDK)");
      
      const groq = new Groq({ 
        apiKey: localKey,
        dangerouslyAllowBrowser: true 
      });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `User Issue Context: ${contextText}` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const resultStr = completion.choices[0]?.message?.content;
      return { ...JSON.parse(resultStr), execution_path: ["[Local Fallback Completed]"] };
    } 
    
    // PRODUCTION MODE (Secure Vercel Serverless Function)
    else {
      console.log("Groq Service: Running in Production Mode (Vercel Proxy LangGraph)");
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: contextText, weather }),
      });

      if (!response.ok) {
        throw new Error(`Serverless Proxy Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    }

  } catch (error) {
    console.error("Groq Service Error:", error);
    // Graceful Fallback: Return null to signal the UI to use the mock engine
    return null;
  }
};
