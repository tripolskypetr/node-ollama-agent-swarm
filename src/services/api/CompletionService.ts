import { singleshot, trycatch } from "functools-kit";
import { Message, Ollama, Tool } from "ollama";
import OpenAI from "openai";
import {
  CC_OLLAMA_HOST,
  CC_OLLAMA_MODEL,
  CC_OPENAI_API_KEY,
  CC_OPENAI_ENABLE,
} from "src/config/params";
import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { AgentName } from "src/utils/getAgentMap";
import { IContext } from "../base/ContextService";

const getOllama = singleshot(() => new Ollama({ host: CC_OLLAMA_HOST }));
const getOpenAI = singleshot(() => new OpenAI({ apiKey: CC_OPENAI_API_KEY }));

const getOpenAiCompletion = async (messages: any[], tools?: any[]) => {
  const { choices } = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    store: false,
    messages,
    tools,
  });
  const [{ message }] = choices;
  return {
    message: {
      ...message,
      tool_calls: message?.tool_calls.map((tool) => ({
        ...tool,
        function: {
          ...tool.function,
          arguments: trycatch(() => JSON.parse(tool.function.arguments), {
            defaultValue: {},
          }),
        },
      })),
    },
  };
};

export class CompletionService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  public getCompletion = async (
    context: IContext,
    messages: Message[],
    tools?: Tool[],
  ): Promise<{ message: Message }> => {
    this.loggerService.log(
      `completionService getCompletion`,
      {
        context,
        useOpenAi: CC_OPENAI_ENABLE,
        messages,
        tools,
      }
    );
    if (CC_OPENAI_ENABLE) {
      return await getOpenAiCompletion(messages, tools);
    }
    return await getOllama().chat({
      model: CC_OLLAMA_MODEL,
      keep_alive: "1h",
      messages,
      tools,
    });
  };
}

export default CompletionService;
