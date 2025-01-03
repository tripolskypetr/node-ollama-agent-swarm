import { AgentTool } from "src/common/BaseAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import ConnectionPrivateService from "../private/ConnectionPrivateService";
import { AgentName } from "src/utils/getAgentMap";

export class NavigateToRefundAgentTool {
  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly connectionPrivateService = inject<ConnectionPrivateService>(
    TYPES.connectionPrivateService
  );

  call = async (agentName: AgentName) => {
    this.loggerService.logCtx("navigateToRefundAgentTool call", { agentName });
    await this.connectionPrivateService.commitToolOutput("Navigation success", agentName);
    await this.rootSwarmService.setAgent("refunds-agent");
    this.connectionPrivateService.emit(
      "Hello. I am a refund agent. Please provide me with the necessary information to process your refund.",
      "refunds-agent"
    );
  };

  getToolSignature = (): AgentTool => ({
    implementation: this.call,
    type: "function",
    function: {
      name: "navigate_to_refund_agent_tool",
      description: "Navigate to refund agent",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  });
}

export default NavigateToRefundAgentTool;
