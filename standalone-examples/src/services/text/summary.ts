import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

// Constant for the AWS region where the Bedrock services are hosted.
const AWS_REGION_BEDROCK = 'us-east-1';

// Initialize the Bedrock client with the specific AWS region.
const client = new BedrockRuntimeClient({ region: AWS_REGION_BEDROCK });

/**
 * AWS Lambda function handler to process API Gateway events.
 *
 * @param {APIGatewayProxyEvent} event - Contains data from the incoming request to the Lambda function.
 * @param {Context} context - Provides methods and properties that provide information about the invocation, function, and runtime environment.
 * @returns {Promise<APIGatewayProxyResult>} - Returns the HTTP response object.
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // Check if there's a body in the incoming request.
  if (event.body) {
    const parsedBody = JSON.parse(event.body); // Parse the JSON body of the incoming request.
    const numberOfPoints = event.queryStringParameters?.points; // Extract 'points' from query parameters.

    // Validate if necessary data is present.
    if (parsedBody.text && numberOfPoints) {
      const text = parsedBody.text; // Extract text to summarize.
      const titanConfig = getTitanConfig(text, numberOfPoints); // Get configuration for the Titan model.

      // Invoke the Bedrock model with the prepared configuration.
      const response = await client.send(
        new InvokeModelCommand({
          modelId: 'amazon.titan-text-express-v1',
          body: JSON.stringify(titanConfig),
          accept: 'application/json',
          contentType: 'application/json',
        })
      );
      const responseBody = JSON.parse(new TextDecoder().decode(response.body)); // Decode and parse the model response.
      const firstResult = responseBody.results[0]; // Assume the first result is the desired outcome.

      // Check if there's a valid output text in the results.
      if (firstResult && firstResult.outputText) {
        return {
          statusCode: 200,
          body: JSON.stringify({ summary: firstResult.outputText }),
        };
      }
    }
  }

  // Return a 400 Bad Request if the necessary inputs are not valid or missing.
  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Invalid request' }),
  };
}

/**
 * Constructs the configuration object for invoking the Bedrock model.
 *
 * @param {string} text - The text to summarize.
 * @param {string} points - The number of points to use for the summary.
 * @returns {Object} - The configuration for text generation.
 */
function getTitanConfig(text: string, points: string) {
  // Build the prompt for the model.
  const prompt = `Text: ${text}\\n
        From the text above, summarize the story in ${points} points.\\n
    `;

  // Configuration object specifying how the text should be generated.
  return {
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 4096, // Maximum number of tokens to generate.
      stopSequences: [], // Sequences that indicate the end of a text generation.
      temperature: 0, // Temperature controls randomness in text generation.
      topP: 1, // Top-p sampling parameter.
    },
  };
}
