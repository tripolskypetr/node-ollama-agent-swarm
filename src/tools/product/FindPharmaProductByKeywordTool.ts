import { IAgentTool } from "src/client/ClientAgent";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";
import { ioc } from "src/services";

const PARAMETER_SCHEMA = z
  .object({
    keyword: z
      .string()
      .min(1, "Keyword is required")
      .describe(
        "The keyword to search for in pharma product names or descriptions."
      ),
  })
  .strict();

type Params = z.infer<typeof PARAMETER_SCHEMA>;

export class FindPharmaProductByKeywordTool implements IAgentTool<Params> {
  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("findPharmaProductByKeywordTool validate", {
      agentName,
      params,
    });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName, { keyword }: Params) => {
    ioc.loggerService.logCtx("findPharmaProductByKeywordTool call", { agentName, keyword });
    const [product = null] = await ioc.productDbService.findByVector(keyword);
    if (product) {
      await ioc.connectionPrivateService.commitToolOutput(
        `The next pharma product found in database: ${JSON.stringify({ title: product.title, description: product.description })}`,
        agentName
      );
      await ioc.connectionPrivateService.complete([
        "Tell user the description of product which was found in the previous tool output",
      ]);
      return;
    }
    await ioc.connectionPrivateService.commitToolOutput(
      `The product does not found in the database`,
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
      name: "find_pharma_product_by_keyword",
      description:
        "Retrieve pharma products from the database based on a keyword search.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description:
              "The keyword to search for in pharma product names or descriptions.",
          },
        },
        required: ["keyword"],
      },
    },
  });
}

export default FindPharmaProductByKeywordTool;
