import { AgentTool } from "src/common/BaseAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import ConnectionPrivateService from "../private/ConnectionPrivateService";

export class NavigateToRefundAgentTool {
  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly connectionPrivateService = inject<ConnectionPrivateService>(
    TYPES.connectionPrivateService
  );

  call = async () => {
    this.loggerService.logCtx("navigateToRefundAgentTool call");
    await this.rootSwarmService.setAgent("refunds-agent");
    this.connectionPrivateService.emit(
      "Hello. I am a refund agent. Please provide me with the necessary information to process your refund.",
      "refunds-agent"
    );
    return "done";
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
