import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { ToolRegistry } from "functools-kit";
import ListPharmaProductTool from "src/tools/product/ListPharmaProductTool";
import FindPharmaProductByKeywordTool from "src/tools/product/FindPharmaProductByKeywordTool";

export class PharmaProductRegistryService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry("pharmaProductRegistryService")
    .register("list_pharma_product", new ListPharmaProductTool())
    .register("find_pharma_product_by_keyword", new FindPharmaProductByKeywordTool())

  public useListPharmaProduct = () =>
    this.registry.get("list_pharma_product").getToolSignature();

  public useFindPharmaProductByKeyword = () =>
    this.registry.get("find_pharma_product_by_keyword").getToolSignature();

  protected init = () => {
    this.registry.init();
  };
}

export default PharmaProductRegistryService;
