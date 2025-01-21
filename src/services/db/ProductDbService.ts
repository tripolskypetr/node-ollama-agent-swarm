import BaseCRUD from "src/common/BaseCRUD";
import {
  IProductDocument,
  IProductDto,
  IProductFilterData,
  IProductRow,
  ProductModel,
} from "src/schema/Product.schema";
import { SortedArray } from "functools-kit";
import LoggerService from "../base/LoggerService";
import { inject } from "src/core/di";
import TYPES from "src/config/types";
import ContextService, { TContextService } from "../base/ContextService";
import EmbeddingService from "../api/EmbeddingService";
import { CC_VECTOR_SEARCH_LIMIT, CC_VECTOR_SEARCH_SIMILARITY } from "src/config/params";

export class ProductDbService extends BaseCRUD(ProductModel) {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);
  readonly contextService = inject<TContextService>(TYPES.contextService);
  readonly embeddingService = inject<EmbeddingService>(TYPES.embeddingService);

  public create = async (dto: IProductDto): Promise<IProductRow> => {
    this.loggerService.logCtx(`productDbService create`, { dto });
    const payload: Partial<IProductDocument> = { ...dto };
    payload.createdAt = new Date();
    payload.updatedAt = new Date();
    return await super.create(payload);
  };

  public update = async (id: string, dto: IProductDto): Promise<any> => {
    this.loggerService.logCtx(`productDbService update`, { dto });
    const payload: Partial<IProductDocument> = { ...dto };
    payload.updatedAt = new Date();
    return await super.update(id, payload);
  };

  public remove = async (id: string): Promise<IProductRow> => {
    this.loggerService.logCtx(`productDbService remove`, { id });
    return await super.remove(id);
  };

  public findByFulltext = async (search: string): Promise<IProductRow[]> => {
    this.loggerService.logCtx(`productDbService findByFulltext`, { search });
    const embeddings = await this.embeddingService.createEmbedding(search);
    const items = new SortedArray();
    for await (const row of this.iterate()) {
      const descriptionEmbeddings = await this.embeddingService.createEmbedding(
        row.description,
      );
      const keywordsEmbeddings = await this.embeddingService.createEmbedding(
        row.keywords.join(" "),
      );
      const titleEmbeddings = await this.embeddingService.createEmbedding(
        row.title,
      );
      const rowScores = await Promise.all([
        this.embeddingService.calculateEmbeddings(
          titleEmbeddings,
          embeddings
        ),
        this.embeddingService.calculateEmbeddings(
          descriptionEmbeddings,
          embeddings
        ),
        this.embeddingService.calculateEmbeddings(
          keywordsEmbeddings,
          embeddings
        ),
      ]);
      items.push(row, Math.max(...rowScores));
    }
    return items.take(CC_VECTOR_SEARCH_LIMIT, CC_VECTOR_SEARCH_SIMILARITY);
  };

  public findAll = async (
    filterData: Partial<IProductFilterData> = {}
  ): Promise<IProductRow[]> => {
    this.loggerService.logCtx(`productDbService findAll`, { filterData });
    return await super.findAll(filterData, {
      updatedAt: -1,
    });
  };

  public findByFilter = async (
    filterData: Partial<IProductFilterData>
  ): Promise<IProductRow | null> => {
    this.loggerService.logCtx(`productDbService findByFilter`, { filterData });
    return await super.findByFilter(filterData, {
      updatedAt: -1,
    });
  };

  public findById = async (id: string): Promise<IProductRow> => {
    this.loggerService.logCtx(`productDbService findById`, { id });
    return await super.findById(id);
  };

  public iterate = (
    filterData: Partial<IProductFilterData> = {}
  ): AsyncGenerator<IProductRow, void, unknown> => {
    this.loggerService.logCtx(`productDbService iterate`, { filterData });
    return ContextService.runAsyncIterator(
      super.iterate(filterData, {
        updatedAt: -1,
      }),
      this.contextService.context
    );
  };

  public paginate = async (
    filterData: Partial<IProductFilterData>,
    pagination: { limit: number; offset: number }
  ): Promise<{ rows: any[]; total: number }> => {
    this.loggerService.logCtx(`productDbService paginate`, {
      filterData,
      pagination,
    });
    const query: Record<string, unknown> = {};
    if (filterData?.title) {
      query["title"] = filterData.title;
    }
    if (filterData?.description) {
      query["description"] = filterData.description;
    }
    return await super.paginate(query, pagination);
  };
}

export default ProductDbService;
