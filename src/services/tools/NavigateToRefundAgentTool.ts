import { AgentTool } from "src/common/BaseAgent";
import { inject } from "src/core/di";
import RootSwarmService from "../logic/RootSwarmService";
import TYPES from "src/config/types";
import LoggerService from "../base/LoggerService";

export class NavigateToRefundAgentTool {

    readonly rootSwarmService = inject<RootSwarmService>(TYPES.rootSwarmService);
    readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    call = async () => {
        this.loggerService.logCtx("navigateToRefundAgentTool call");
        await this.rootSwarmService.setAgent("refunds-agent");
        return "done";
    };

    getToolSignature = (): AgentTool  => ({
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
        }
    });

}

export default NavigateToRefundAgentTool;
