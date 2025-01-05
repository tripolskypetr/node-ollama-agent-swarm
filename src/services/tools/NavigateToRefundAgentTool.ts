import { AgentToolSignature, IAgentTool } from "src/client/ClientAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";
import ConnectionPrivateService from "../private/ConnectionPrivateService";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";

const PARAMETER_SCHEMA = z.object({}).strict();

export class NavigateToRefundAgentTool implements IAgentTool {
  readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  readonly connectionPrivateService = inject<ConnectionPrivateService>(
    TYPES.connectionPrivateService
  );

  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    this.loggerService.logCtx("navigateToRefundAgentTool validate", { agentName, params });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName) => {
    this.loggerService.logCtx("navigateToRefundAgentTool call", { agentName });
    await this.connectionPrivateService.commitToolOutput("Navigation success", agentName);
    await this.rootSwarmService.setAgent("refunds-agent");
    this.connectionPrivateService.emit(
      "Hello. I am a refund agent. Please provide me with the necessary information to process your refund.",
      "refunds-agent"
    );
  };

  getToolSignature = () => ({
    implementation: this.call,
    validate: this.validate,
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
