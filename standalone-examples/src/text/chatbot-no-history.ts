import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { TextDecoder } from 'util';

/**
 * Initialize a client for the AWS Bedrock Runtime service.
 * The client is configured to interact with services in the 'us-east-1' region.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Generates a configuration object for invoking the Titan model using AWS Bedrock.
 * This configuration sets up the parameters for the text generation based on the given prompt.
 *
 * @param {string} prompt - The prompt describing the observation from the tank inspection.
 * @returns {Object} Configuration object tailored for text generation, specifying various parameters like token count and model behavior.
 */
function getConfiguration(prompt: string) {
  return {
    inputText: prompt, // Example: There are several hairline cracks visible on the upper surface near the inlet pipe, and a slight discoloration has appeared around the base.
    textGenerationConfig: {
      maxTokenCount: 4096, // The maximum number of tokens the model should generate.
      stopSequences: [], // Sequences that signal the model to stop generating text.
      temperature: 0.5, // A parameter controlling the randomness of the output. Higher values mean more random outputs.
      topP: 0.85, // A parameter controlling the diversity of the output. Closer to 1.0 allows more diverse outputs.
    },
  };
}

/**
 * Main function to handle real-time user input from the command line and invoke the Titan model to generate responses.
 * It listens for input from the standard input device (stdin), processes it to generate a report,
 * and outputs the result to the standard output device (stdout).
 */
async function main() {
  console.log(
    'Quality Assurance Bot is ready. Type your observation to generate a report.'
  );
  process.stdin.addListener('data', async (input) => {
    const userInput = input.toString().trim(); // Converts the input buffer to a string and trims any extra whitespace.
    const config = getConfiguration(
      `Generate a quality assurance report for the observed issue: ${userInput}`
    );
    const response = await client.send(
      new InvokeModelCommand({
        body: JSON.stringify(config), // Converts the configuration object into a JSON string for the API request.
        modelId: 'amazon.titan-text-express-v1', // Specifies which model to use for the generation.
        contentType: 'application/json', // Indicates that the body of the request is in JSON format.
        accept: 'application/json', // Indicates that the response should also be in JSON format.
      })
    );
    const responseBody = JSON.parse(new TextDecoder().decode(response.body)); // Decodes the response body from binary to string, then parses it from JSON.
    console.log(responseBody.results[0].outputText); // Logs the generated text to the console.
  });
}

main();
