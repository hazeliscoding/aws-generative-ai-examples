// Importing necessary classes from the Amazon Bedrock SDK and file system module from Node.js
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { writeFileSync } from 'fs';

/**
 * Initializes the Bedrock client with specific regional settings.
 * This setup specifies that the client should operate within the 'us-east-1' AWS region.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Configuration object for generating an image based on text description.
 * This includes the task type, text prompts, and various parameters specifying the image's properties.
 */
const titanImageConfig = {
  taskType: 'TEXT_IMAGE', // Defines the task as a text-to-image generation.
  textToImageParams: {
    text: 'cat on a mat on a country hillside', // Text description of the image to generate.
  },
  imageGenerationConfig: {
    numberOfImages: 1, // Specifies the number of images to generate.
    height: 512, // Height of the generated image in pixels.
    width: 512, // Width of the generated image in pixels.
    cfgScale: 8.0, // CFG scale affecting the detail and coherence of the image.
  },
};

/**
 * Asynchronously invokes a machine learning model using the provided configuration to generate an image.
 * This function manages the API call to Bedrock using the configured parameters.
 */
async function invokeModel() {
  // Sending the invoke command to the Bedrock runtime client with the model details and configuration.
  const response = await client.send(
    new InvokeModelCommand({
      modelId: 'amazon.titan-image-generator-v1', // Specifies the model to use for image generation.
      body: JSON.stringify(titanImageConfig), // Configuration converted to JSON string.
      accept: 'application/json', // Expected response format.
      contentType: 'application/json', // Format of the request content.
    })
  );
  // Parsing the response to extract the generated image data.
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  // Saving the first image from the response to a file.
  saveImage(responseBody.images[0], 'cat.png');
}

/**
 * Saves the base64 encoded image data to a file.
 *
 * @param {string} base64Data - The base64 encoded string of the image data.
 * @param {string} fileName - The name of the file where the image will be saved.
 */
function saveImage(base64Data: string, fileName: string) {
  // Converting base64 string to a binary buffer.
  const imageBuffer = Buffer.from(base64Data, 'base64');
  // Writing the binary data to a file to create an image file.
  writeFileSync(fileName, imageBuffer);
}

// Initiating the model invocation to generate and save the image.
invokeModel();
