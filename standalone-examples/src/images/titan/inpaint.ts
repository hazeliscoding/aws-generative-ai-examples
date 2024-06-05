import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { writeFileSync, readFileSync } from 'fs';

/**
 * Creates a Bedrock client configured for the 'us-east-1' AWS region.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Generates configuration for an inpainting task using an existing image and specific instructions.
 *
 * @param {string} inputImage - The base64 encoded string of the input image for inpainting.
 * @returns {Object} The configuration object for the inpainting task.
 */
function getConfig(inputImage: string) {
  return {
    taskType: 'INPAINTING',
    inPaintingParams: {
      text: 'Make the cat black and blue', // Directives for the model on what to do.
      negativeText: 'bad quality, low res', // Directives on what to avoid in the output.
      image: inputImage, // The base64 encoded image to be modified.
      maskPrompt: 'cat', // Specifies the subject within the image to focus the inpainting on.
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      height: 512,
      width: 512,
      cfgScale: 8.0, // Control for the coherence and detail in the modified image.
    },
  };
}

/**
 * Asynchronously invokes a Bedrock model to perform image inpainting based on provided configurations.
 */
async function invokeModel() {
  const image = readImage('cat.png'); // Reading and encoding the source image.
  const config = getConfig(image); // Generating the config with the encoded image.
  // Sending the configuration to the Bedrock client and awaiting the modified image.
  const response = await client.send(
    new InvokeModelCommand({
      modelId: 'amazon.titan-image-generator-v1',
      body: JSON.stringify(config),
      accept: 'application/json',
      contentType: 'application/json',
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  saveImage(responseBody.images[0], 'catEdited.png'); // Saving the edited image.
}

/**
 * Reads an image file from the file system and encodes it in base64 format.
 *
 * @param {string} imagePath - Path to the image file to read.
 * @returns {string} The base64 encoded image data.
 */
function readImage(imagePath: string) {
  const data = readFileSync(imagePath); // Reading the image file synchronously.
  return data.toString('base64'); // Converting the image data to a base64 string.
}

/**
 * Saves a base64 encoded image data to a file.
 *
 * @param {string} base64Data - The base64 encoded string of the image data.
 * @param {string} fileName - The name of the file where the image will be saved.
 */
function saveImage(base64Data: string, fileName: string) {
  const imageBuffer = Buffer.from(base64Data, 'base64'); // Converting the base64 string to a buffer.
  writeFileSync(fileName, imageBuffer); // Writing the buffer to a file to create an image.
}

// Initiating the model invocation to inpaint and save the image.
invokeModel();
