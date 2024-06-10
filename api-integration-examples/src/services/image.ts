import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

// Constants for the AWS region and the S3 bucket name from environment variables.
const AWS_REGION_BEDROCK = 'us-east-1'; // Corrected typo in the region name.
const S3_BUCKET = process.env.BUCKET_NAME; // The S3 bucket where the images will be stored.

// Initialize the Bedrock client with the specified AWS region.
const client = new BedrockRuntimeClient({ region: AWS_REGION_BEDROCK });
// Initialize the S3 client.
const s3Client = new S3Client();

/**
 * Handler function for the AWS Lambda that processes the API Gateway event.
 *
 * @param {APIGatewayProxyEvent} event - The incoming request from the API Gateway.
 * @returns {Promise<APIGatewayProxyResult>} - The HTTP response object.
 */
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult = {} as any;
  // Check if the event has a body.
  console.log('Event:', event);
  if (event.body) {
    const parsedBody = JSON.parse(event.body);
    // Check if the description for the image is provided.
    if (parsedBody.description) {
      console.log('Description:', parsedBody.description);
      const description = parsedBody.description;
      const titanConfig = getTitanConfig(description);
      const response = await client.send(
        new InvokeModelCommand({
          modelId: 'amazon.titan-image-generator-v1',
          body: JSON.stringify(titanConfig),
          accept: 'application/json',
          contentType: 'application/json',
        })
      );
      console.log('Response:', response);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      if (responseBody.images) {
        console.log('Image:', responseBody.images[0]);
        const image = responseBody.images[0];
        const signedUrl = await saveImageToS3(image);
        return {
          statusCode: 200,
          body: JSON.stringify({ url: signedUrl }),
        };
      }
    }
  }
  // Return a 400 error if the request is invalid.
  response.statusCode = 400;
  response.body = JSON.stringify({ message: 'Invalid request' });
  return response;
}

/**
 * Saves an image to an S3 bucket and returns a signed URL for access.
 *
 * @param {string} image - Base64 encoded image data.
 * @returns {Promise<string>} - A promise that resolves to a signed URL of the saved image.
 */
async function saveImageToS3(image: string) {
  const imageFile = Buffer.from(image, 'base64'); // Convert the base64 image to a buffer.
  const now = Date.now(); // Current timestamp for unique file naming.
  const imageName = `${now}.jpg`; // Construct the image file name.
  // Command to upload the image file to the S3 bucket.
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: imageName,
    Body: imageFile,
  });
  await s3Client.send(command); // Send the command to upload the image.
  // Command to get the object for which we will create a signed URL.
  const getObjectCommand = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: imageName,
  });
  // Generate a signed URL that expires in one hour.
  const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 3600,
  });
  return signedUrl;
}

/**
 * Constructs the configuration object for invoking the Bedrock model to generate an image.
 *
 * @param {string} description - The description based on which the image will be generated.
 * @returns {Object} - The configuration for the image generation task.
 */
function getTitanConfig(description: string) {
  return {
    taskType: 'TEXT_IMAGE',
    textToImageParams: {
      text: description,
    },
    imageGenerationConfig: {
      numberOfImages: 1,
      height: 512,
      width: 512,
      cfgScale: 8.0,
    },
  };
}
