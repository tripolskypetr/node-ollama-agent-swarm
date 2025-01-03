import { AgentTool } from "src/common/BaseAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import { TContextService } from "../base/ContextService";
import ConnectionPrivateService from "../private/ConnectionPrivateService";
import { AgentName } from "src/utils/getAgentMap";

export class NavigateToSalesAgentTool {
  readonly contextService = inject<TContextService>(TYPES.contextService);

  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly connectionPrivateService = inject<ConnectionPrivateService>(
    TYPES.connectionPrivateService
  );

  call = async (agentName: AgentName) => {
    this.loggerService.logCtx("navigateToSalesAgentTool call", { agentName });
    await this.connectionPrivateService.commitToolOutput("Navigation success", agentName);
    await this.rootSwarmService.setAgent("sales-agent");
    this.connectionPrivateService.emit(
      "Hello. I am a sales agent. Please provide me with the necessary information to process your sale.",
      "sales-agent"
    );
  };

  getToolSignature = (): AgentTool => ({
    implementation: this.call,
    type: "function",
    function: {
      name: "navigate_to_sales_agent_tool",
      description: "Navigate to sales agent",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  });
}

export default NavigateToSalesAgentTool;
