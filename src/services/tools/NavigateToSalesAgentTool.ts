import { IAgentTool } from "src/common/BaseAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import { TContextService } from "../base/ContextService";
import ConnectionPrivateService from "../private/ConnectionPrivateService";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";

const PARAMETER_SCHEMA = z.object({}).strict();

export class NavigateToSalesAgentTool implements IAgentTool {
  readonly contextService = inject<TContextService>(TYPES.contextService);

  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly connectionPrivateService = inject<ConnectionPrivateService>(
    TYPES.connectionPrivateService
  );

  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    this.loggerService.logCtx("navigateToSalesAgentTool validate", { agentName, params });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName) => {
    this.loggerService.logCtx("navigateToSalesAgentTool call", { agentName });
    await this.connectionPrivateService.commitToolOutput("Navigation success", agentName);
    await this.rootSwarmService.setAgent("sales-agent");
    this.connectionPrivateService.emit(
      "Hello. I am a sales agent. Please provide me with the necessary information to process your sale.",
      "sales-agent"
    );
  };

  getToolSignature = () => ({
    validate: this.validate,
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
