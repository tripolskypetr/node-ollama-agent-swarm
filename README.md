# 🔥 node-ollama-agent-swarm 

> [The OpenAI Agent Swarm](https://github.com/openai/swarm) pattern implementation for [OllamaJS](https://github.com/ollama/ollama-js). Includes TTS synthesis and speech recognition for simplified testing and interaction.

![screenshot](./screenshot.png)

## Main concept

![schema](./schema.png)

1. Several chatgpt sessions (agents) [execute tool calls](https://ollama.com/blog/tool-support). Each agent can use different model, for example, [mistral 7b](https://ollama.com/library/mistral) for small talk, [nemotron](https://ollama.com/library/nemotron) for business conversation

2. The agent swarm navigate messages to the active chatgpt session (agent) for each `WebSocket` channel [by using `clientId` url parameter](src/routes/session.ts#L5)

3. The active chatgpt session (agent) in the swarm could be changed [by executing function tool](https://platform.openai.com/docs/assistants/tools/function-calling) 

4. Each client sessions [share the same chat message history](https://platform.openai.com/docs/api-reference/messages/getMessage) for all agents. Each client chat history keep the last 25 messages with rotation. Only `assistant` and `user` messages are shared between chatgpt sessions (agents), the `system` and `tool` messages are agent-scoped so each agent knows only those tools related to It. As a result, each chatgpt session (agent) has it's [unique system prompt](https://platform.openai.com/docs/api-reference/messages/createMessage#messages-createmessage-role)

5. *[OPTIONAL]* The tools with common business logic are grouped into [functions](src/services/function)  using the [Registry Pattern](https://www.geeksforgeeks.org/registry-pattern/) . This approach enables the system to support plugins and extensions, making the developer code extendable and maintainable - an essential quality for prompt engineering. For example, [the original OpenAI sample](https://github.com/openai/swarm/blob/93ad26dcd9f94eada3291e88a154c25e1d14a861/examples/personal_shopper/main.py)  uses a single `main.py` file. Without tools registries, when scaled, will result in thousands of lines of code, making it harder to manage.

**The result**

The model system prompt can be dynamically changed based on the user behaviour. The model interact with the external api based on the user requests

## Getting started

```bash
cp .env.example .env
ollama pull nemotron-mini:4b
ollama pull granite-embedding:278m
# cd docker/mongodb && docker-compose up
# cd docker/redis && docker-compose up
npm install
npm start
```

The entry point of the backend application is [ConnectionPublicService.ts](src/services/public/ConnectionPublicService.ts). The agent swarm with system prompts is placed in the [logic](src/services/logic) folder. The ai functions are places in the [tools](src/tools) folder 

## What's Inside

 - **MongoDb Community `$vectorSearch` implementation**

    By using [gpt4all embedding](https://www.npmjs.com/package/gpt4all#embedding) generation and [tfjs](https://www.tensorflow.org/text/guide/word_embeddings) for cosine similarity

 - **[REPL](https://en.wikipedia.org/wiki/Read–eval–print_loop) for product creation**

    For automatic embedding indexing, you should use `npm run repl`. The product creation command is `ioc.migrationPublicService.createProduct("title", "description")`. The embeddings will be generated automatically

 - **Vendor-proved LLM models**

    This tool using the commercial-ready products: NVidia [nemotron-mini](https://ollama.com/library/nemotron-mini) for chat and IBM [granite-embedding](https://ollama.com/library/granite-embedding) for database vector indexing. Both of them are the most production-ready cause the reputation of big tech companies

 - **Microservice ready**

    The client chat history implementation is designed to store messages in in-memory storage (e.g., Redis, Tarantool). The tool execution registry is prepared for horizontal scaling [using gRPC remote hosts](https://github.com/tripolskypetr/node-grpc-monorepo) .

 - **Integrated environment**

    Includes a lot of dev tools like TTS synthesis and speech recognition, REPL javascript interpretation, REST API, WS API, console chat interface
