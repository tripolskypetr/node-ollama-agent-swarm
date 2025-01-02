import { memoize } from "functools-kit";
import BaseAgent, { IAgent } from "src/common/BaseAgent";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import { TContextService } from "src/services/base/ContextService";
import LoggerService from "src/services/base/LoggerService";

const AGENT_PROMPT = `You are a refund agent that handles all actions related to refunds after a return has been processed.
You must ask for both the user ID and item ID to initiate a refund. Ask for both user_id and item_id in one message.
If the user asks you to notify them, you must ask them what their preferred method of notification is. For notifications, you must
ask them for user_id and method in one message
`;

export class RefundsAgentService implements IAgent {
  readonly contextService = inject<TContextService>(TYPES.contextService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private getClientAgent = memoize(
    ([clientId]) => clientId,
    (clientId: string) =>
      new (class extends BaseAgent({
        clientId,
        agentName: "refunds-agent",
        prompt: AGENT_PROMPT,
      }) {})()
  );

  public execute = async (input: string) => {
    this.loggerService.logCtx("refundsAgentService createCompletion", {
      input,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.execute(input);
  };

  public dispose = async () => {
    this.loggerService.logCtx("refundsAgentService dispose");
    const agent = this.getClientAgent(this.contextService.context.clientId);
    await agent.dispose();
    this.getClientAgent.clear(this.contextService.context.clientId);
  };
}

export default RefundsAgentService;
