import { singleshot } from "functools-kit";
import { createEmbedding, loadModel } from "gpt4all";
import { inject } from "src/core/di";
import LoggerService from "../base/LoggerService";
import TYPES from "src/config/types";
import { IContext } from "../base/ContextService";

const getEmbedder = singleshot(
  async () =>
    await loadModel("nomic-embed-text-v1.5.f16.gguf", { type: "embedding" })
);

export class EmbeddingService {
  readonly loggerService = inject<LoggerService>(TYPES.loggerService);

  public createEmbedding = async (
    context: IContext,
    text: string
  ): Promise<Float32Array<ArrayBufferLike>> => {
    this.loggerService.log("embeddingService createEmbedding", {
      text,
      context,
    });
    const embedder = await getEmbedder();
    const { embeddings } = await createEmbedding(embedder, text);
    return embeddings;
  };
}

export default EmbeddingService;
