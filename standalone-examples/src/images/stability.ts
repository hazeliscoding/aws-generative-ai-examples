// Importing necessary classes and functions from the Amazon Bedrock SDK and Node.js file system module.
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { writeFileSync } from 'fs';

/**
 * Initializes the Bedrock client with specific regional settings.
 * The region 'us-east-1' is where the client will interact with AWS services.
 */
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Configuration for generating an image using the Stability AI model.
 * Includes text prompts, dimensions of the image, the scaling factor for control of fidelity,
 * and the style preset to specify the artistic style of the image.
 */
const stabilityImageConfig = {
    text_prompts: [
        {
            text: 'a photo of a dragon', // Description of the desired output image.
        }
    ],
    height: 512, // Height of the generated image in pixels.
    width: 512, // Width of the generated image in pixels.
    cfg_scale: 10, // CFG scale that influences the level of detail and stability in generated images.
    style_preset: '3d-model', // Preset defining the style and method of image generation.
};

/**
 * Asynchronously invokes a machine learning model using the provided configuration.
 * This function handles the communication with the Bedrock API to request image generation.
 */
async function invokeModel() {
    // Sending the invoke command to the Bedrock runtime client with model details and configuration.
    const response = await client.send(new InvokeModelCommand({
        modelId: 'stability.stable-diffusion-xl-v1', // ID of the Stability AI model to be used.
        body: JSON.stringify(stabilityImageConfig), // Configuration converted to JSON string.
        accept: 'application/json', // Expected response format.
        contentType: 'application/json' // Format of the request content.
    }));
    // Decoding the received response to extract the image data.
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    // Saving the decoded image data to a file.
    saveImage(responseBody.artifacts[0].base64, 'dragonDiffusion.png');
}

/**
 * Saves the base64 encoded image data to a file.
 * 
 * @param {string} base64Data - The base64 encoded string of the image data.
 * @param {string} fileName - The name of the file where the image will be saved.
 */
function saveImage(base64Data: string, fileName: string) {
    // Converting base64 string to binary buffer.
    const imageBuffer = Buffer.from(base64Data, 'base64');
    // Writing the binary data to a file system to create an image file.
    writeFileSync(fileName, imageBuffer);
}

// Calling the function to invoke the model and process the image generation.
invokeModel();
