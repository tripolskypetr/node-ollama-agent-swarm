# 🔥 node-ollama-agent-swarm 

> [The OpenAI Agent Swarm](https://github.com/openai/swarm) pattern implementation for [OllamaJS](https://github.com/ollama/ollama-js)

![screenshot](./screenshot.png)

## Main concept

1. Several chat sessions called agents [execute tool calling](https://ollama.com/blog/tool-support)

2. The agent swarm navigate messages to the active chat session for each `WebSocket` by using `clientId` url parameter

3. The active chat session in the swarm could be changed [by executing function tool](https://platform.openai.com/docs/assistants/tools/function-calling) 

4. All chat sessions [share the same chat history](https://platform.openai.com/docs/api-reference/messages/getMessage) for each client

5. Each chat session has it's [unique system prompt](https://platform.openai.com/docs/api-reference/messages/createMessage#messages-createmessage-role)

**The result**

The model system prompt can be dynamically changed based on the user behaviour. The model interact with the external api based on the user requests

## Getting started

```bash
ollama run mistral:7b
npm install
npm start
```

The entry point of the backend application is [ConnectionPublicService.ts](src/services/public/ConnectionPublicService.ts)
