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
      .min(1, "Fulltext is required")
  })
  .strict();

type Params = z.infer<typeof PARAMETER_SCHEMA>;

export class SearchPharmaProductTool implements IAgentTool<Params> {
  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("searchPharmaProductTool validate", {
      agentName,
      params,
    });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName, { description }: Params) => {
    ioc.loggerService.logCtx("searchPharmaProductTool call", {
      agentName,
      description,
    });
    const products = await ioc.productDbService.findByFulltext(
      description,
    );
    if (products.length) {
      await ioc.connectionPrivateService.commitToolOutput(
        str.newline(
          `The next pharma product found in database: ${products.map(serializeProduct)}`,
        ),
        agentName
      );
      await ioc.connectionPrivateService.complete([
        "Tell user the products found in the database"
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
      name: "search_pharma_product",
      description:
        "Retrieve several pharma products from the database based on description",
      parameters: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description:
              "REQUIRED! Minimum one word. The product description. Must include several sentences with description and keywords to find a product",
          },
        },
        required: ["description"],
      },
    },
  });
}

export default SearchPharmaProductTool;
