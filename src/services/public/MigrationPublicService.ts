import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import MigrationPrivateService from "../private/MigrationPrivateService";
import ContextService from "../base/ContextService";

interface IMigrationPrivateService extends MigrationPrivateService {}

type TMigrationPrivateService = {
  [key in keyof IMigrationPrivateService]: any;
};

export class MigrationPublicService implements TMigrationPrivateService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly migrationPrivateService = inject<MigrationPrivateService>(
    TYPES.migrationPrivateService
  );

  public listProduct = async () => {
    this.loggerService.log(`migrationPublicService listProduct`);
    return await ContextService.runInContext(async () => {
      return await this.migrationPrivateService.listProduct();
    }, {
      clientId: "migration-service",
    });
  };

  public createProduct = async (title: string, description: string, keywords: string[]) => {
    this.loggerService.log(`migrationPublicService createProduct`, {
      title,
      description,
      keywords,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.migrationPrivateService.createProduct(
          title,
          description,
          keywords,
        );
      },
      {
        clientId: "migration-service",
      }
    );
  };

  public findProductByDescription = async (search: string) => {
    this.loggerService.log(`migrationPublicService findProduct`, {
      search,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.migrationPrivateService.findProductByDescription(search);
      },
      {
        clientId: "migration-service",
      }
    );
  };

  public importProducts = async (path: string) => {
    this.loggerService.log(`migrationPublicService importProducts`, {
      path,
    });
    return await ContextService.runInContext(
      async () => {
        return await this.migrationPrivateService.importProducts(path);
      },
      {
        clientId: "migration-service",
      }
    );
  };
}

export default MigrationPublicService;
