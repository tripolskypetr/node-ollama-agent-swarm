import { memoize } from "functools-kit";
import BaseAgent, { IAgent } from "src/common/BaseAgent";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import { TContextService } from "src/services/base/ContextService";
import LoggerService from "src/services/base/LoggerService";
import NavigateToRefundAgentTool from "src/services/tools/NavigateToRefundAgentTool";
import NavigateToSalesAgentTool from "src/services/tools/NavigateToSalesAgentTool";

/*
You are to triage a users request, and call a tool to transfer to the right intent.
Once you are ready to transfer to the right intent, call the tool to transfer to the right intent.
You dont need to know specifics, just the topic of the request.
If the user request is about making an order or purchasing an item, transfer to the Sales Agent.
If the user request is about getting a refund on an item or returning a product, transfer to the Refunds Agent.
When you need more information to triage the request to an agent, ask a direct question without explaining why you're asking it.
Do not share your thought process with the user! Do not make unreasonable assumptions on behalf of user
Until you sure about the intent, keep asking questions to get more information. If you are not sure, ask the user to rephrase the request.
*/

const AGENT_PROMPT = `Be nice and chat with user without executing any tools
`;

export class TriageAgentService implements IAgent {
  readonly contextService = inject<TContextService>(TYPES.contextService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly navigateToRefundAgentTool = inject<NavigateToRefundAgentTool>(
    TYPES.navigateToRefundAgentTool
  );
  readonly navigateToSalesAgentTool = inject<NavigateToSalesAgentTool>(
    TYPES.navigateToSalesAgentTool
  );

  private getClientAgent = memoize(
    ([clientId]) => clientId,
    (clientId: string) =>
      new (class extends BaseAgent({
        clientId,
        agentName: "triage-agent",
        prompt: AGENT_PROMPT,
        tools: [
          this.navigateToRefundAgentTool.getToolSignature(),
          this.navigateToSalesAgentTool.getToolSignature(),
        ],
      }) {})()
  );

  public createCompletion = async (input: string): Promise<string> => {
    this.loggerService.logCtx("triageAgentService createCompletion", {
      input,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.createCompletion(input);
  };

  public dispose = async () => {
    this.loggerService.logCtx("triageAgentService dispose");
    const agent = this.getClientAgent(this.contextService.context.clientId);
    await agent.dispose();
    this.getClientAgent.clear(this.contextService.context.clientId);
  };
}

export default TriageAgentService;
