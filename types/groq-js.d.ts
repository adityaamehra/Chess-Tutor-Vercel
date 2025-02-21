declare module "groq-js" {
    interface GroqClientOptions {
      apiKey: string;
    }
  
    interface ChatCompletionMessage {
      role: "system" | "user";
      content: string;
    }
  
    interface ChatCompletionRequest {
      messages: ChatCompletionMessage[];
      model: string;
    }
  
    interface ChatCompletionResponse {
      choices: { message: { content: string } }[];
    }
  
    class GroqClient {
      constructor(options: GroqClientOptions);
      chat: {
        completions: {
          create(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
        };
      };
    }
  
    export function createClient(options: GroqClientOptions): GroqClient;
  }