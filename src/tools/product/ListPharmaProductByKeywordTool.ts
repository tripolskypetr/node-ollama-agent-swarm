import { IAgentTool } from "src/client/ClientAgent";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";
import { ioc } from "src/services";
import { split, str } from "functools-kit";

const PARAMETER_SCHEMA = z
  .object({
    sentence_with_keywords: z
      .string()
      .min(1, "Keyword is required")
      .describe(
        "The keyword to search for in pharma product names or descriptions."
      ),
  })
  .strict();

type Params = z.infer<typeof PARAMETER_SCHEMA>;

export class ListPharmaProductByKeywordTool implements IAgentTool<Params> {
  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("listPharmaProductByKeywordTool validate", {
      agentName,
      params,
    });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName, { sentence_with_keywords }: Params) => {
    ioc.loggerService.logCtx("listPharmaProductByKeywordTool call", {
      agentName,
      sentence_with_keywords,
    });
    const products = await ioc.productDbService.findByKeywords(
      split(sentence_with_keywords)
    );
    if (products.length) {
      await ioc.connectionPrivateService.commitToolOutput(
        `The next pharma product found in database: ${JSON.stringify(
          products.map(({ id, title }) => ({ id, title }))
        )}`,
        agentName
      );
      await ioc.connectionPrivateService.complete([
        "Tell user the titles of products which was found in the previous tool output",
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
      name: "list_pharma_product_by_keyword",
      description:
        "Retrieve several pharma products from the database based on a keyword search.",
      parameters: {
        type: "object",
        properties: {
          sentence_with_keywords: {
            type: "string",
            description:
              "THE SEVERAL keywords in sentence for embedding vector search",
          },
        },
        required: ["sentence_with_keywords"],
      },
    },
  });
}

export default ListPharmaProductByKeywordTool;
