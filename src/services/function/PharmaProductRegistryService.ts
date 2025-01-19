import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { ToolRegistry } from "functools-kit";
import ListPharmaProductByKeywordTool from "src/tools/product/ListPharmaProductByKeywordTool";
import ListPharmaProductByDescriptionTool from "src/tools/product/ListPharmaProductByDescriptionTool";

export class PharmaProductRegistryService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry("pharmaProductRegistryService")
    .register("list_pharma_product_by_keyword", new ListPharmaProductByKeywordTool())
    .register("list_pharma_product_by_description", new ListPharmaProductByDescriptionTool())

  public useListPharmaProductByKeywordTool = () =>
    this.registry.get("list_pharma_product_by_keyword").getToolSignature();

  public useListPharmaProductByDescriptionTool = () =>
    this.registry.get("list_pharma_product_by_description").getToolSignature();

  protected init = () => {
    this.registry.init();
  };
}

export default PharmaProductRegistryService;
