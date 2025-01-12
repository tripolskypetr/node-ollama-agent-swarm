export const CC_MONGO_CONNECTION_STRING = process.env.CC_MONGO_CONNECTION_STRING || "mongodb://localhost:27017/node-ollama-agent-swarm?wtimeoutMS=15000";

export const CC_OLLAMA_HOST = process.env.CC_OLLAMA_HOST || "http://127.0.0.1:11434";
export const CC_OLLAMA_MODEL = process.env.CC_OLLAMA_MODEL || "nemotron-mini:4b";
export const CC_OLLAMA_MESSAGES = 15;

export const CC_OLLAMA_EMIT_TOOL_PROTOCOL = !!process.env.CC_OLLAMA_EMIT_TOOL_PROTOCOL || false;

export const CC_OPENAI_ENABLE = !!process.env.CC_OPENAI_ENABLE || false;
export const CC_OPENAI_API_KEY = process.env.CC_OPENAI_API_KEY || "";
export const CC_OPENAI_MODEL = process.env.CC_OLLAMA_MODEL || "gpt-4o-mini-2024-07-18";

export const CC_REDIS_HOST = process.env.CC_REDIS_HOST || "127.0.0.1";
export const CC_REDIS_PORT = parseInt(process.env.CC_REDIS_PORT) || 6379;
export const CC_REDIS_PASSWORD = process.env.CC_REDIS_PASSWORD || "";

export const CC_EMBEDDING_SIMILARITY_COEF = parseFloat(process.env.CC_EMBEDDING_SIMILARITY_COEF) || 0.8;

export const CC_CLIENT_SESSION_EXPIRE_SECONDS = 7 * 24 * 60 * 60; // 1 week

export const CC_VECTOR_SEARCH_LIMIT = parseInt(process.env.CC_VECTOR_SEARCH_LIMIT) || 5;

export const CC_REDIS_FLUSHALL = !!process.env.CC_REDIS_FLUSHALL || false;
