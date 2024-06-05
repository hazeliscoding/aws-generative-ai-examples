import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { TextDecoder } from 'util';

/**
 * Initialize a client for the AWS Bedrock Runtime service.
 * Configured to interact with services in the 'us-east-1' region.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

// Initialize an array to store chat history.
let chatHistory: string[] = [];

/**
 * Generates a configuration object for invoking the Titan model using AWS Bedrock.
 * This configuration now includes chat history to provide context for the model.
 *
 * @param {string} prompt - The latest user input.
 * @returns {Object} Configuration object for the text generation with chat history.
 */
function getConfiguration(prompt: string) {
  let context = chatHistory.join(' '); // Combine the history into a single string.
  return {
    inputText: `${context} ${prompt}`,
    textGenerationConfig: {
      maxTokenCount: 4096,
      stopSequences: [],
      temperature: 0.5,
      topP: 0.85,
    },
  };
}

/**
 * Main function to handle real-time user input from the command line, invoke the model, and manage chat history.
 */
async function main() {
  console.log(
    'Quality Assurance Bot is ready. Type your observation to generate a report.'
  );
  process.stdin.addListener('data', async (input) => {
    const userInput = input.toString().trim();
    chatHistory.push(userInput); // Add the latest input to the chat history.

    const config = getConfiguration(
      `Generate a quality assurance report based on the following observation: ${userInput}`
    );
    const response = await client.send(
      new InvokeModelCommand({
        body: JSON.stringify(config),
        modelId: 'amazon.titan-text-express-v1',
        contentType: 'application/json',
        accept: 'application/json',
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log(responseBody.results[0].outputText);
    chatHistory.push(responseBody.results[0].outputText); // Add model's response to the chat history.
  });
}

main();
