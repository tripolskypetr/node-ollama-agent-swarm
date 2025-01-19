import { IAgentTool } from "src/client/ClientAgent";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";
import { ioc } from "src/services";
import { obsolete } from "functools-kit";

const PARAMETER_SCHEMA = z.object({}).strict();

const AFTER_NAVIGATION_PROMPT = `
If previous conversation messages contains the request for pharma products, execute necessary tool before respond
Else ask user to provide you with the necessary information to process their sale.
`;

export class NavigateToSalesTool implements IAgentTool {

  protected staticReply = obsolete(async () => {
    await ioc.connectionPrivateService.emit(
      "Hello. I am a sales agent. Please provide me with the necessary information to process your sale.",
      "sales-agent"
    );
  })

  public validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("navigateToSalesTool validate", { agentName, params });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  public call = async (agentName: AgentName) => {
    ioc.loggerService.logCtx("navigateToSalesTool call", { agentName });
    await ioc.connectionPrivateService.commitToolOutput("Navigation success", agentName);
    await ioc.rootSwarmService.setAgent("sales-agent");
    await ioc.connectionPrivateService.complete([
      AFTER_NAVIGATION_PROMPT,
    ]);
  };

  public getToolSignature = () => ({
    validate: this.validate,
    implementation: this.call,
    type: "function",
    function: {
      name: "navigate_to_sales_tool",
      description: "Navigate to sales agent",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  });
}

export default NavigateToSalesTool;
