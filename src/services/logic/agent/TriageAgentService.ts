import { memoize } from "functools-kit";
import BaseAgent, { IAgent } from "src/common/BaseAgent";
import TYPES from "src/config/types";
import { inject } from "src/core/di";
import { TContextService } from "src/services/base/ContextService";
import LoggerService from "src/services/base/LoggerService";
import NavigateToRefundAgentTool from "src/services/tools/NavigateToRefundAgentTool";
import NavigateToSalesAgentTool from "src/services/tools/NavigateToSalesAgentTool";

const AGENT_PROMPT = `You are to triage a users request, and call a tool to transfer to the right agent.
There are two agents you can transfer to: navigate_to_refund_agent_tool and navigate_to_sales_agent_tool.
Untill calling any function, you must ask the user for their agent.
Before navigation make sure you choose well. Do not spam function executions
Navigate immideatly without asking additional questions specific to the target agent topic
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

  public execute = async (input: string[]) => {
    this.loggerService.logCtx("triageAgentService execute", {
      input,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.execute(input);
  };

  public beginChat = async () => {
    this.loggerService.logCtx("triageAgentService beginChat");
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.beginChat();
  };

  commitSystemMessage = async (message: string) => {
    this.loggerService.logCtx("triageAgentService commitSystemMessage", {
      message,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.commitSystemMessage(message);
  };

  commitToolOutput = async (content: string) => {
    this.loggerService.logCtx("triageAgentService commitToolOutput", {
      content,
    });
    const agent = this.getClientAgent(this.contextService.context.clientId);
    return await agent.commitToolOutput(content);
  };

  public dispose = async () => {
    this.loggerService.logCtx("triageAgentService dispose");
    const agent = this.getClientAgent(this.contextService.context.clientId);
    await agent.dispose();
    this.getClientAgent.clear(this.contextService.context.clientId);
  };
}

export default TriageAgentService;
