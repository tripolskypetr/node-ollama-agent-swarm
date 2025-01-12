import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import ProductDbService from "../db/ProductDbService";

export class MigrationPrivateService {

    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);
    private readonly productDbService = inject<ProductDbService>(TYPES.productDbService);

    public createProduct = async (title: string, description: string) => {
        this.loggerService.logCtx("migrationPrivateService createProduct", {
            title,
            description,
        });
        return await this.productDbService.create({
            title,
            description,
        });
    };

    public findProduct = async (search: string) => {
        this.loggerService.logCtx("migrationPrivateService findProduct", {
            search,
        });
        return await this.productDbService.findByVector(search);
    };

}

export default MigrationPrivateService;
