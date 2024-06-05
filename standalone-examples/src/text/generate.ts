import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * Initializes a client for the BedrockRuntime service.
 * The client is configured for the 'us-east-1' region.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Configuration for invoking the Titan model.
 * - `inputText`: Text input describing observations from the tank inspection.
 * - `textGenerationConfig`: Object specifying the generation parameters:
 *   - `maxTokenCount`: Maximum number of tokens (words and punctuation) to generate.
 *   - `stopSequences`: Array of sequences where generation should stop if encountered.
 *   - `temperature`: Controls randomness in generation. 0 means deterministic.
 *   - `topP`: Controls diversity. 1 means consider all possibilities equally.
 */
const titanConfig = {
  inputText:
    'Inspection observed slight discoloration and stress marks near the base of the tank.',
  textGenerationConfig: {
    maxTokenCount: 512,
    stopSequences: ['End of Report'],
    temperature: 0.5,
    topP: 0.85,
  },
};

const titanModelId = 'amazon.titan-text-express-v1';

/**
 * Configuration for invoking the LLaMA model.
 * - `prompt`: Text input describing initial observations for generating a quality assurance report.
 * - `max_gen_len`: Maximum length of the generated text.
 * - `temperature`: Controls randomness in generation. 0.5 allows for moderate variability.
 * - `top_p`: Controls diversity, with 0.85 allowing for balanced diversity.
 */
const llamaConfig = {
  prompt:
    'Generate a quality assurance report for a tank with observed discoloration and stress marks near the base.',
  max_gen_len: 512,
  temperature: 0.5,
  top_p: 0.85,
};

const llamaModelId = 'meta.llama2-13b-chat-v1';

/**
 * Asynchronously invokes a model on AWS Bedrock and logs the generated quality assurance report.
 * Uses the LLaMA model configuration and ID.
 */
async function invokeModel() {
  const response = await client.send(
    new InvokeModelCommand({
      body: JSON.stringify(llamaConfig),
      modelId: llamaModelId,
      contentType: 'application/json',
      accept: 'application/json',
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  // console.log(responseBody) // For debugging, logs the complete response body.
  console.log(responseBody.generation); // Logs the generated quality assurance report.
}

invokeModel();
