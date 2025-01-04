export const CC_OLLAMA_HOST = process.env.CC_OLLAMA_HOST || "http://127.0.0.1:11434";
export const CC_OLLAMA_MODEL = process.env.CC_OLLAMA_MODEL || "mistral:7b";
export const CC_OLLAMA_MESSAGES = 15;

export const CC_OPENAI_ENABLE = !!process.env.CC_OPENAI_ENABLE || false;
export const CC_OPENAI_API_KEY = process.env.CC_OPENAI_API_KEY || "";
export const CC_OPENAI_MODEL = process.env.CC_OLLAMA_MODEL || "mistral:7b";
