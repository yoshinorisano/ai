import {
  EmbeddingModelV1,
} from '@ai-sdk/provider';
import {
  BedrockEmbeddingModelId,
  BedrockEmbeddingSettings,
} from './bedrock-embedding-settings';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

type BedrockEmbeddingConfig = {
  provider: string;
  client: BedrockRuntimeClient;
};

export class BedrockEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly modelId: BedrockEmbeddingModelId;

  readonly maxEmbeddingsPerCall = 96; // TODO
  readonly supportsParallelCalls = false; // TODO

  private readonly config: BedrockEmbeddingConfig;
  private readonly settings: BedrockEmbeddingSettings;

  constructor(
    modelId: BedrockEmbeddingModelId,
    settings: BedrockEmbeddingSettings,
    config: BedrockEmbeddingConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  get provider(): string {
    return this.config.provider;
  }

  private getArgs({values}: any) {
    return {
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: values[0], // TODO
        dimensions: 1024,
        normalize: true
      })
    };
  }

  async doEmbed({
    values,
    headers, // TODO
    abortSignal, // TODO
  }: Parameters<EmbeddingModelV1<string>['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV1<string>['doEmbed']>>
  > {
    try {
      const args = this.getArgs({values});
      const response = await this.config.client.send(new InvokeModelCommand(args));
      const jsonString = new TextDecoder().decode(response.body);
      const result = JSON.parse(jsonString);
      return {
        embeddings: [result.embedding], // TODO
        usage: { tokens: 0 }, // TODO
        // rawResponse: { headers: response.headers }, // TODO
      };
    } catch (error) {
      console.error("Error getting embeddings:", error);
      throw error;
    }
  }
}
