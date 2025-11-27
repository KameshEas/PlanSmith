import { GoogleGenAI, Type, Schema, Content } from "@google/genai";
import { ProjectPlan, ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

// System instruction for the chat persona
const CHAT_SYSTEM_INSTRUCTION = `
You are an expert Project Manager and Consultant. 
Your goal is to help the user create a comprehensive "Basic Project Plan".
Start by asking clarifying questions about the project's purpose, goals, key features, target audience, timeline, and resources.
DO NOT ask all questions at once. Ask 1-2 relevant questions at a time to keep the conversation flowing naturally.
As the user provides details, acknowledge them and ask for the next missing piece of information.
Be concise, professional, and encouraging.
`;

// Schema for the structured Project Plan
const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the project" },
    overview: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["summary", "objectives", "successCriteria"],
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["category", "items"],
      },
    },
    scope: {
      type: Type.OBJECT,
      properties: {
        included: { type: Type.ARRAY, items: { type: Type.STRING } },
        excluded: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["included", "excluded"],
    },
    timeline: {
      type: Type.OBJECT,
      properties: {
        milestones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              deadline: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["name", "deadline", "description"],
          },
        },
      },
      required: ["milestones"],
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phase: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["phase", "items"],
      },
    },
    resources: {
      type: Type.OBJECT,
      properties: {
        tools: { type: Type.ARRAY, items: { type: Type.STRING } },
        people: { type: Type.ARRAY, items: { type: Type.STRING } },
        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["tools", "people", "materials"],
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING },
          mitigation: { type: Type.STRING },
        },
        required: ["risk", "mitigation"],
      },
    },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["title", "overview", "features", "scope", "timeline", "tasks", "resources", "risks", "nextSteps"],
};

let chatSession: any = null;

export const initializeChat = (history?: ChatMessage[]) => {
  const formattedHistory = history?.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  chatSession = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    },
    history: formattedHistory
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }
  
  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "I'm having trouble processing that response.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

/**
 * Generates a structured Project Plan JSON based on the conversation history.
 * We pass the entire history to a fresh generation call to extract the structure.
 */
export const generateStructuredPlan = async (history: ChatMessage[]): Promise<ProjectPlan | null> => {
  try {
    // Convert chat history to a format suitable for context
    const conversationText = history
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.text}`)
      .join("\n\n");

    const prompt = `
      Analyze the following conversation history between a User and a Project Manager.
      Based strictly on the information provided in the conversation, generate a structured Project Plan.
      If information is missing for a specific section, make reasonable assumptions based on context or leave it generic/empty, 
      but do NOT make up wild facts.
      
      CONVERSATION HISTORY:
      ${conversationText}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    return JSON.parse(jsonText) as ProjectPlan;
  } catch (error) {
    console.error("Error generating structured plan:", error);
    return null;
  }
};