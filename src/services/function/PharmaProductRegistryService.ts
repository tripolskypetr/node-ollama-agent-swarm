import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { ToolRegistry } from "functools-kit";
import ListPharmaProductTool from "src/tools/product/ListPharmaProductTool";

export class PharmaProductRegistryService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry("pharmaProductRegistryService")
    .register("list_pharma_product", new ListPharmaProductTool());

  public useListPharmaProduct = () =>
    this.registry.get("list_pharma_product").getToolSignature();

  protected init = () => {
    this.registry.init();
  };
}

export default PharmaProductRegistryService;
