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

  public createEmbedding = async (text: string): Promise<Embeddings> => {
    this.loggerService.logCtx("embeddingService createEmbedding", {
      text,
    });
    const embedder = await getEmbedder();
    const { embeddings } = await createEmbedding(embedder, text);
    return Array.from(embeddings);
  };

  public compareEmbeddings = async (a: Embeddings, b: Embeddings) => {
    this.loggerService.logCtx("embeddingService compareEmbeddings");
    return tidy(() => {
      const tensorA = tensor1d(a);
      const tensorB = tensor1d(b);
      const dotProduct = sum(mul(tensorA, tensorB));
      const normA = norm(tensorA);
      const normB = norm(tensorB);
      const cosineData = div(dotProduct, mul(normA, normB)).dataSync();
      const cosineSimilarity = cosineData[0];
      this.loggerService.debugCtx(
        `embeddingService compareEmbeddings cosineSimilarity=${cosineSimilarity}`
      );
      console.log(cosineSimilarity)
      return cosineSimilarity >= CC_EMBEDDING_SIMILARITY_COEF;
    });
  };
}

export default EmbeddingService;
