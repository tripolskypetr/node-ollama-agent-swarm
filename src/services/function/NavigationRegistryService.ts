import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { ToolRegistry } from "functools-kit";
import NavigateToRefundTool from "src/tools/NavigateToRefundTool";
import NavigateToSalesTool from "src/tools/NavigateToSalesTool";

export class NavigationRegistryService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  private registry = new ToolRegistry("navigationRegistryService")
    .register("navigate_to_refund", new NavigateToRefundTool())
    .register("navigate_to_sales", new NavigateToSalesTool());

  public useNavigateToRefund = () =>
    this.registry.get("navigate_to_refund").getToolSignature();
  public useNavigateToSales = () =>
    this.registry.get("navigate_to_sales").getToolSignature();

  protected init = () => {
    this.registry.init();
  };
}

export default NavigationRegistryService;
