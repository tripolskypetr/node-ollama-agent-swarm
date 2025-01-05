import { singleshot } from "functools-kit";
import { createEmbedding, loadModel } from "gpt4all";
import { inject } from "src/core/di";
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { IContext } from "../base/ContextService";
import { CC_EMBEDDING_SIMILARITY_COEF } from "src/config/params";

const getEmbedder = singleshot(
  async () =>
    await loadModel("nomic-embed-text-v1.5.f16.gguf", { type: "embedding" })
);

type Embeddings = number[];

export class EmbeddingService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  public createEmbedding = async (
    context: IContext,
    text: string
  ): Promise<Embeddings> => {
    this.loggerService.log("embeddingService createEmbedding", {
      text,
      context,
    });
    const embedder = await getEmbedder();
    const { embeddings } = await createEmbedding(embedder, text);
    return Array.from(embeddings);
  };

  public compareEmbeddings = async (
    context: IContext,
    a: Embeddings,
    b: Embeddings
  ) => {
    this.loggerService.log("embeddingService compareEmbeddings", { context });
    return tidy(() => {
      const tensorA = tensor1d(a);
      const tensorB = tensor1d(b);
      const dotProduct = sum(mul(tensorA, tensorB));
      const normA = norm(tensorA);
      const normB = norm(tensorB);
      const cosineData = div(dotProduct, mul(normA, normB)).dataSync();
      const cosineSimilarity = cosineData[0];
      this.loggerService.debug(
        `embeddingService compareEmbeddings cosineSimilarity=${cosineSimilarity}`,
        { context }
      );
      return cosineSimilarity >= CC_EMBEDDING_SIMILARITY_COEF;
    });
  };
}

export default EmbeddingService;
