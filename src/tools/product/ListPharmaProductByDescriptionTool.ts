import { IAgentTool } from "src/client/ClientAgent";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";
import { ioc } from "src/services";
import { str } from "functools-kit";
import serializeProduct from "src/utils/serializeProduct";

const PARAMETER_SCHEMA = z
  .object({
    description: z
      .string()
      .min(1, "Keyword is required")
      .describe(
        "The keyword to search for in pharma product names or descriptions."
      ),
  })
  .strict();

type Params = z.infer<typeof PARAMETER_SCHEMA>;

export class ListPharmaProductByDescriptionTool implements IAgentTool<Params> {
  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("listPharmaProductByDescriptionTool validate", {
      agentName,
      params,
    });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName, { description }: Params) => {
    ioc.loggerService.logCtx("listPharmaProductByDescriptionTool call", {
      agentName,
      description,
    });
    const products = await ioc.productDbService.findByDescription(description);
    if (products.length) {
      await ioc.connectionPrivateService.commitToolOutput(
        `The next pharma product found in database: ${products.map(serializeProduct)}`,
        agentName
      );
      await ioc.connectionPrivateService.complete([
        "Tell user the titles of product which was found in the previous tool output",
      ]);
      return;
    }
    await ioc.connectionPrivateService.commitToolOutput(
      `The products does not found in the database`,
      agentName
    );
    await ioc.connectionPrivateService.complete([
      "Tell user to specify search criteria for the pharma product",
    ]);
  };

  getToolSignature = () => ({
    implementation: this.call,
    validate: this.validate,
    type: "function",
    function: {
      name: "list_pharma_product_by_description",
      description: str(
        "Retrieve several pharma products from the database based on a user sentence.",
        "The sentence must require at lead 512 characters.",
        "DO NOT CALL THE TOOL IF YOU CAN'T FORMAT THE DESCRIPTION CONTENT AND LENGTH",
        "IF DESCRIPTION TOO SHORT USE KEYWORD SEARCH",
        "BETTER USE KEYWORD SEARCH"
      ),
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: str(
              "The description of a product. At least 128 characters are required. Write them from user request,",
              "ask for additional details if you can't reach the length"
            ),
          },
        },
        required: ["description"],
      },
    },
  });
}

export default ListPharmaProductByDescriptionTool;
