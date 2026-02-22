import { GoogleGenAI, Type } from "@google/genai";
import { PentestWorkflow, ScanIntensity, PentestScope, Host } from '../types';

const getAI = () => {
  const manualKey = typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_GEMINI_API_KEY') : null;
  const apiKey = manualKey || process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export async function analyzeSecurity(
  target: string,
  headers: string,
  workflow: PentestWorkflow,
  intensity: ScanIntensity,
  scopes: PentestScope[]
) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform a tactical security audit on ${target}. 
    Workflow: ${workflow}
    Intensity: ${intensity}
    Scopes: ${scopes.join(', ')}
    Headers: ${headers}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                vulnerability: { type: Type.STRING },
                severity: { type: Type.STRING },
                description: { type: Type.STRING },
                impact: { type: Type.STRING },
                exploitPoC: { type: Type.STRING },
                cveId: { type: Type.STRING }
              }
            }
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                uri: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"results":[], "sources":[]}');
}

export async function generateNetworkIntel(range: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a simulated network map for the CIDR range: ${range}. 
    Include at least 5 diverse hosts with ports, services, and OS details.`,
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
          }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"hosts":[]}');
}

export async function generatePayload(category: string, target: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a tactical ${category} payload for target: ${target}. 
    Include name, code, and description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          code: { type: Type.STRING },
          desc: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"name":"Error", "code":"", "desc":""}');
}

export interface DeobfuscationResponse {
  deobfuscatedCode: string;
  explanation: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
}

export async function analyzeCode(code: string): Promise<DeobfuscationResponse> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Deobfuscate and analyze the following code for malicious intent:
    ${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          deobfuscatedCode: { type: Type.STRING },
          explanation: { type: Type.STRING },
          riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
          riskScore: { type: Type.NUMBER }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"deobfuscatedCode":"", "explanation":"Error", "riskLevel":"Low", "riskScore":0}');
}

export async function getCustomPayload(category: string, target: string) {
  return generatePayload(category, target);
}

export interface ToolAdviceResponse {
  advice: string;
  advancedUsage: string;
  riskLevel: string;
}

export async function getToolAdvice(toolName: string, context: string): Promise<ToolAdviceResponse> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide tactical advice for using the tool ${toolName} in the context of: ${context}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          advice: { type: Type.STRING },
          advancedUsage: { type: Type.STRING },
          riskLevel: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text || '{"advice":"Error", "advancedUsage":"", "riskLevel":"Low"}');
}
