import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, PentestWorkflow, ScanIntensity, PentestScope, Host } from "../types";

export const getApiKey = () => {
  const env = (import.meta as any).env || {};
  const manual = typeof window !== 'undefined' ? localStorage.getItem('AEGIS_GEMINI_API_KEY') : null;
  const isPublicMode = typeof window !== 'undefined' ? localStorage.getItem('AEGIS_PUBLIC_KEY_MODE') === 'true' : false;
  const viteKey = env.VITE_GEMINI_API_KEY;

  let processKey = "";
  try {
    if (typeof process !== 'undefined' && (process as any).env) {
      processKey = (process as any).env.GEMINI_API_KEY || (process as any).env.API_KEY;
    }
  } catch (e) { }

  if (isPublicMode) return processKey || viteKey;
  return manual || viteKey || processKey || "";
};

export interface SecurityAnalysisResponse {
  results: ScanResult[];
  sources: { title: string; uri: string }[];
}

export interface NetworkIntelResponse {
  hosts: Host[];
  topologyNotes: string;
}

export interface ToolAdviceResponse {
  text: string;
  sources: { title: string; uri: string }[];
}

export interface DeobfuscationResponse {
  deobfuscatedCode: string;
  analysis: string;
  riskScore: number;
  indicators: string[];
}

async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429;
    if (isRateLimit && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return executeWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

function parseGeminiJson(rawText: string | undefined): any {
  if (!rawText) return null;
  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
  }
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Artifact Parse Fault", e);
    return null;
  }
}

const DEFAULT_MODEL = 'gemini-1.5-flash';

export const analyzeCode = async (code: string): Promise<DeobfuscationResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() as string, apiVersion: "v1beta" });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: `[SYSTEM: CODE_RECONNAISSANCE]
    Analyze this code block. It may be obfuscated or malicious.
    1. De-obfuscate/Clean the code.
    2. Identify intent (Exfiltration, Persistence, Lateral movement).
    3. List technical indicators.
    Code: ${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          deobfuscatedCode: { type: Type.STRING },
          analysis: { type: Type.STRING },
          riskScore: { type: Type.NUMBER },
          indicators: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["deobfuscatedCode", "analysis", "riskScore", "indicators"]
      }
    }
  });

  return parseGeminiJson(response.text) || { deobfuscatedCode: "PARSE_ERR", analysis: "FAULT", riskScore: 0, indicators: [] };
};

export const getCustomPayload = async (prompt: string, category: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() as string, apiVersion: "v1beta" });
  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: `[SYSTEM: OFFENSIVE_SYNTHESIS]
    Requirement: ${prompt}
    Vector: ${category}
    Return ONLY the code. No explanation. Stealth optimized.`,
  });
  return response.text || "ERR_PAYLOAD_NULL";
};

export const generateNetworkIntel = async (range: string): Promise<NetworkIntelResponse> => {
  const scanTask = async (): Promise<NetworkIntelResponse> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() as string, apiVersion: "v1beta" });
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Simulate network recon for subnet: ${range}. Return JSON with hosts and topologyNotes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hosts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ip: { type: Type.STRING },
                  hostname: { type: Type.STRING },
                  status: { type: Type.STRING },
                  mac: { type: Type.STRING },
                  vendor: { type: Type.STRING },
                  os: { type: Type.STRING },
                  riskScore: { type: Type.NUMBER },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ports: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        port: { type: Type.NUMBER },
                        service: { type: Type.STRING },
                        version: { type: Type.STRING },
                        severity: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            topologyNotes: { type: Type.STRING }
          }
        }
      }
    });

    return parseGeminiJson(response.text) || { hosts: [], topologyNotes: "RECON_FAULT" };
  };

  return executeWithRetry(scanTask);
};

export const analyzeSecurity = async (
  url: string,
  headers: string,
  workflow: PentestWorkflow = 'THREAT_HUNTING'
): Promise<SecurityAnalysisResponse> => {
  const scanTask = async (): Promise<SecurityAnalysisResponse> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() as string, apiVersion: "v1beta" });
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: `[SYSTEM: 100%_WEB_PENTEST_ENGINE]
        Target: ${url}
        Context: ${headers}
        Directives: Perform a deep logical audit. Correlate with 2024-2025 CVEs using Search.
        Format: JSON array of ScanResult objects.`,
        config: {
          tools: [{ googleSearch: {} }] as any
        }
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || chunk.web?.uri,
        uri: chunk.web?.uri
      })).filter((s: any) => s.uri) || [];

      return {
        results: parseGeminiJson(response.text) || [],
        sources: sources
      };
    } catch (error) {
      const response = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: `[SYSTEM: 100%_WEB_PENTEST_ENGINE]
        Target: ${url}
        Context: ${headers}
        Directives: Perform a deep logical audit.
        Format: JSON array of ScanResult objects.`,
      });
      return {
        results: parseGeminiJson(response.text) || [],
        sources: []
      };
    }
  };

  return executeWithRetry(scanTask);
};

export const getToolAdvice = async (toolName: string, target: string): Promise<ToolAdviceResponse> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() as string, apiVersion: "v1beta" });
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `[OFFENSIVE_BRIEFING]
      Tool: ${toolName}
      Instruction: Explain the technical logic and IDS/WAF bypass for this tool on target: ${target}`,
      config: { tools: [{ googleSearch: {} }] as any }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || chunk.web?.uri,
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    return {
      text: response.text || "INTEL_FETCH_FAULT",
      sources
    };
  } catch (error) {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `[OFFENSIVE_BRIEFING]
      Tool: ${toolName}
      Instruction: Explain the technical logic and IDS/WAF bypass for this tool on target: ${target}`,
    });
    return {
      text: response.text || "INTEL_FETCH_FAULT",
      sources: []
    };
  }
};
