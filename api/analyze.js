import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { security_guardrail, environmental_enricher } from "../src/utils/graphNodes.js";

const GraphState = Annotation.Root({
  description: Annotation(),
  weather: Annotation(),
  category: Annotation(),
  department: Annotation(),
  priority: Annotation(),
  formal_complaint: Annotation(),
  is_safe: Annotation(),
  error_message: Annotation(),
  execution_path: Annotation({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
});

async function complaint_classifier(state = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  const llm = new ChatGroq({
    apiKey,
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.1,
  });

  const schema = z.object({
    category: z.enum(["Pothole", "Streetlight", "Garbage", "Water Leak", "Other"]),
    department: z.enum(["Public Works", "Electrical Department", "Sanitation Dept", "Water & Sewage Board"]),
  });

  const llmWithStructuredOutput = llm.withStructuredOutput(schema, { name: "classification" });
  const systemPrompt = `You are an AI Civic Complaint Routing Agent. Analyze the user's issue description and map it to a specific category and department.`;
  
  const response = await llmWithStructuredOutput.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`User Issue Description: ${state?.description || ""}`)
  ]);

  return {
    category: response.category,
    department: response.department,
    priority: "Medium",
    execution_path: ["[Category Classified]"]
  };
}

async function document_generator(state = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  const llm = new ChatGroq({
    apiKey,
    modelName: "llama-3.3-70b-versatile",
    temperature: 0.1,
  });

  const prompt = `Draft a highly professional, structured formal complaint letter ready for city submission based on the following:
  Issue: ${state?.description || ""}
  Category: ${state?.category || ""}
  Department: ${state?.department || ""}
  Priority: ${state?.priority || ""}
  
  Output ONLY the formal letter text. Do not include introductory text.`;

  const response = await llm.invoke([new HumanMessage(prompt)]);

  return {
    formal_complaint: response.content,
    execution_path: ["[Letter Generated]"]
  };
}

async function error_handler(state = {}) {
  return {
    execution_path: [] // The security node already logs the error message
  };
}

function routeAfterSecurity(state = {}) {
  if (state?.is_safe === false) {
    return "error_handler";
  }
  return "complaint_classifier";
}

// Build Graph
const workflow = new StateGraph(GraphState)
  .addNode("security_guardrail", security_guardrail)
  .addNode("complaint_classifier", complaint_classifier)
  .addNode("environmental_enricher", environmental_enricher)
  .addNode("document_generator", document_generator)
  .addNode("error_handler", error_handler)
  
  .addEdge(START, "security_guardrail")
  .addConditionalEdges("security_guardrail", routeAfterSecurity, {
    error_handler: "error_handler",
    complaint_classifier: "complaint_classifier"
  })
  .addEdge("complaint_classifier", "environmental_enricher")
  .addEdge("environmental_enricher", "document_generator")
  .addEdge("document_generator", END)
  .addEdge("error_handler", END);

const app = workflow.compile();

/**
 * Vercel Serverless Function endpoint utilizing LangGraph.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: GROQ_API_KEY is missing.' });
    }

    let parsedBody = req.body || {};
    if (typeof req.body === 'string') {
      try {
        parsedBody = JSON.parse(req.body);
      } catch (e) {
        parsedBody = {};
      }
    }
    const { context, weather } = parsedBody;
    if (!context || typeof context !== 'string') {
      return res.status(400).json({ error: 'Invalid payload: context string is required.' });
    }

    const sanitizedContext = context.replace(/<[^>]*>?/gm, '').substring(0, 1000);

    const initialState = {
      description: sanitizedContext,
      weather: weather || "Clear",
      category: "",
      department: "",
      priority: "",
      formal_complaint: "",
      is_safe: true,
      error_message: null,
      execution_path: []
    };

    const finalState = await app.invoke(initialState);
    
    const resultJson = {
      category: finalState.category,
      department: finalState.department,
      priority: finalState.priority,
      formal_complaint: finalState.formal_complaint,
      is_safe: finalState.is_safe,
      error_message: finalState.error_message,
      execution_path: finalState.execution_path
    };

    return res.status(200).json(resultJson);

  } catch (error) {
    console.error("LangGraph Edge Error:", error);
    return res.status(500).json({ error: 'Failed to process AI request', details: error.message });
  }
}
