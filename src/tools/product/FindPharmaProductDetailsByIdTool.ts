import { IAgentTool } from "src/client/ClientAgent";
import { AgentName } from "src/utils/getAgentMap";
import { z } from "zod";
import { ioc } from "src/services";
import { split, str } from "functools-kit";
import serializeProduct from "src/utils/serializeProduct";

const PARAMETER_SCHEMA = z
  .object({
    product_id: z
      .string()
      .min(1, "Product id is required")
  })
  .strict();

type Params = z.infer<typeof PARAMETER_SCHEMA>;

export class FindPharmaProductDetailsByIdTool implements IAgentTool<Params> {
  validate = async (agentName: AgentName, params: Record<string, unknown>) => {
    ioc.loggerService.logCtx("findPharmaProductDetailsByIdTool validate", {
      agentName,
      params,
    });
    const { success } = await PARAMETER_SCHEMA.spa(params);
    return success;
  };

  call = async (agentName: AgentName, { product_id }: Params) => {
    ioc.loggerService.logCtx("findPharmaProductDetailsByIdTool call", {
      agentName,
      product_id,
    });
    const product = await ioc.productDbService.findByFilter({
        _id: product_id,
    })
    if (product) {
      await ioc.connectionPrivateService.commitToolOutput(
        `The next pharma product found in database: ${serializeProduct(product)}`,
        agentName
      );
      await ioc.connectionPrivateService.complete([
        "Tell user the details about found product",
      ]);
      return;
    }
    await ioc.connectionPrivateService.commitToolOutput(
      `The products does not found in the database. Find the id by using the keywords`,
      agentName
    );
    await ioc.connectionPrivateService.complete([
      "Product not found. Find the product id by using keywords",
    ]);
  };

  getToolSignature = () => ({
    implementation: this.call,
    validate: this.validate,
    type: "function",
    function: {
      name: "find_pharma_product_details_by_id",
      description:
        "Retrieve product description by using product id",
      parameters: {
        type: "object",
        properties: {
            product_id: {
            type: "string",
            description:
              "The product id which you cat retrieve by using keywords",
          },
        },
        required: ["product_id"],
      },
    },
  });
}

export default FindPharmaProductDetailsByIdTool;
