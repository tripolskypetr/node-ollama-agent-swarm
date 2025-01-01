import { AgentTool } from "src/common/BaseAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";

export class NavigateToSalesAgentTool {
  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  call = async () => {
    this.loggerService.logCtx("navigateToSalesAgentTool call");
    await this.rootSwarmService.setAgent("sales-agent");
    return "done";
  };

  getToolSignature = (): AgentTool => ({
    implementation: this.call,
    type: "function",
    function: {
      name: "navigate_to_sales_agent_tool",
      description: "Navigate to sales intent",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  });
}

export default NavigateToSalesAgentTool;
