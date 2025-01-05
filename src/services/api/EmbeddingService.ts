import { singleshot } from "functools-kit";
import { createEmbedding, loadModel } from "gpt4all";
import { inject } from "src/core/di";
import { tidy, mul, norm, sum, tensor1d, div } from "@tensorflow/tfjs-core";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { IContext } from "../base/ContextService";

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
    this.loggerService.log("embeddingService compareEmbeddings", {
      context,
      a: [...a.slice(5), "..."],
      b: [...b.slice(5), "..."],
    });
    return tidy(() => {
      const tensorA = tensor1d(a);
      const tensorB = tensor1d(b);
      const dotProduct = sum(mul(tensorA, tensorB));
      const normA = norm(tensorA);
      const normB = norm(tensorB);
      const cosineSimilarity = div(dotProduct, mul(normA, normB)).data()[0];
      return cosineSimilarity;
    });
  };
}

export default EmbeddingService;
