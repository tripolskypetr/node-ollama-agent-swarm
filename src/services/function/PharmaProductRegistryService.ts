import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { ToolRegistry } from "functools-kit";
import SearchPharmaProductTool from "src/tools/product/SearchPharmaProductTool";

export class PharmaProductRegistryService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry("pharmaProductRegistryService")
    .register("search_pharma_product_tool", new SearchPharmaProductTool())

  public useSearchPharmaProductTool = () =>
    this.registry.get("search_pharma_product_tool").getToolSignature();

  protected init = () => {
    this.registry.init();
  };
}

export default PharmaProductRegistryService;
