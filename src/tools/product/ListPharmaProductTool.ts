import { IAgentTool } from "src/client/ClientAgent";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";
import { ioc } from "src/services";

const PARAMETER_SCHEMA = z.object({}).strict();
const PRODUCTS_COUNT = 25;

export class ListPharmaProductTool implements IAgentTool {

  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("listPharmaProductTool validate", { agentName, params });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName) => {
    ioc.loggerService.logCtx("listPharmaProductTool call", { agentName });
    const products = await ioc.productDbService.findAll();
    const titleList = products.slice(0, PRODUCTS_COUNT).map(({ title }) => title);
    await ioc.connectionPrivateService.commitToolOutput(`There are the following pharma products in the database: ${titleList}`, agentName);
    await ioc.connectionPrivateService.complete([
      "Based on the tools output give user an answer",
    ]);
  };

  getToolSignature = () => ({
    implementation: this.call,
    validate: this.validate,
    type: "function",
    function: {
      name: "list_pharma_product_tool",
      description: "Get the last 25 pharma products from the database for promoting",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  });
}

export default ListPharmaProductTool;
