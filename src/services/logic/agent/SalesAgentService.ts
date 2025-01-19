import { memoize } from "functools-kit";
import ClientAgent, { IAgent } from "src/client/ClientAgent";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import { TContextService } from "src/services/base/ContextService";
import LoggerService from "src/services/base/LoggerService";
import NavigationRegistryService from "src/services/function/NavigationRegistryService";
import PharmaProductRegistryService from "src/services/function/PharmaProductRegistryService";

const AGENT_PROMPT = `You are a sales agent that handles all actions related to placing the order to purchase an item.
If user do not to buy navigate him back to triage agent
Tell the users all details about products in the database by using necessary tool calls
When promoting product list choose diffrent products for promotion from message to message
`;

export class SalesAgentService implements IAgent {
  readonly contextService = inject<TContextService>(TYPES.contextService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly navigationRegistryService = inject<NavigationRegistryService>(TYPES.navigationRegistryService);
  readonly pharmaProductRegistryService = inject<PharmaProductRegistryService>(TYPES.pharmaProductRegistryService);

  private getClientAgent = memoize(
    ([clientId]) => clientId,
    (clientId: string) =>
      new ClientAgent({
        clientId,
        agentName: "sales-agent",
        prompt: AGENT_PROMPT,
        tools: [
          this.navigationRegistryService.useNavigateToTriage(),
          this.pharmaProductRegistryService.useListPharmaProduct(),
        ]
      })
  );

  public execute = async (input: string[]) => {
    this.loggerService.logCtx("salesAgentService execute", {
      input,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.execute(input);
  };

  public beginChat = async () => {
    this.loggerService.logCtx("salesAgentService beginChat");
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.beginChat();
  };

  commitSystemMessage = async (message: string) => {
    this.loggerService.logCtx("salesAgentService commitSystemMessage", {
      message,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.commitSystemMessage(message);
  };

  commitToolOutput = async (content: string) => {
    this.loggerService.logCtx("salesAgentService commitToolOutput", {
      content,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.commitToolOutput(content);
  };

  public dispose = async () => {
    this.loggerService.logCtx("salesAgentService dispose");
    const agent = this.getClientAgent(this.contextService.context.clientId);
    await agent.dispose();
    this.getClientAgent.clear(this.contextService.context.clientId);
  };
}

export default SalesAgentService;
