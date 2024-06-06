import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

/**
 * Initialize the Bedrock client for the AWS region 'us-east-1'.
 * This client will communicate with Amazon Bedrock services to perform machine learning tasks.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

// Define the text input for the model. Here we're using a historical fact.
const fact = 'The first moon landing was in 1969.';
// An unused variable 'animal' which could be part of a different task or future use.
const animal = 'cat';

/**
 * The main function that handles invoking a Bedrock machine learning model to get an embedding for a text.
 */
async function main() {
  // Sending a request to the Bedrock API to embed a piece of text using a specific model.
  const response = await client.send(
    new InvokeModelCommand({
      // Stringifying the input text to JSON format as the API expects a JSON payload.
      body: JSON.stringify({ inputText: fact }),

      // The identifier for the model we're using, here it's 'amazon.titan-embed-text-v1'.
      modelId: 'amazon.titan-embed-text-v1',
      // Specifying that the request content is in JSON format.
      contentType: 'application/json',
      // Specifying that we accept response in JSON format.
      accept: 'application/json',
    })
  );

  // Parsing the response body to get a usable format and extracting the embedding.
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  // Outputting the resulting embedding to the console.
  console.log(responseBody.embedding);
}

// Calling the main function to execute the embedding task.
main();
