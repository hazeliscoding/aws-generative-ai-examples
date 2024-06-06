import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { readFileSync } from 'fs';
import { cosineSimilarity } from './similarity'; // Assume this function calculates cosine similarity between two vectors.

// List of image file paths to process.
const images = ['images/1.png', 'images/2.png', 'images/3.png'];

// Initialize the Bedrock client configured for the 'us-east-1' AWS region.
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Retrieves an image embedding from the Amazon Bedrock service.
 *
 * @param {string} imagePath - The file path to the image to be processed.
 * @returns {Promise<number[]>} - A promise that resolves to an array of numbers representing the image embedding.
 */
async function getImageEmbedding(imagePath: string): Promise<number[]> {
  // Read the image file and convert it to a base64 encoded string.
  const base64Image = readFileSync(imagePath).toString('base64');

  // Send the image data to Bedrock for embedding generation.
  const response = await client.send(
    new InvokeModelCommand({
      body: JSON.stringify({ inputImage: base64Image }),
      modelId: 'amazon.titan-embed-image-v1',
      accept: 'application/json',
      contentType: 'application/json',
    })
  );

  // Parse the response to get the embedding.
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.embedding;
}

// Define a type for storing an image path with its corresponding embedding.
type ImageWithEmbedding = {
  path: string;
  embedding: number[];
};

/**
 * Main function to handle image embedding retrieval and similarity comparison.
 */
async function main() {
  const imagesWithEmbeddings: ImageWithEmbedding[] = [];

  // Retrieve embeddings for each image and store them with their paths.
  for (const imagePath of images) {
    const embedding = await getImageEmbedding(imagePath);
    imagesWithEmbeddings.push({ path: imagePath, embedding });
  }

  // Define a test image for comparison.
  const testImage = 'images/cat.png';
  // Retrieve the embedding for the test image.
  const testImageEmbedding = await getImageEmbedding(testImage);

  // Array to store similarity results.
  const similarities: {
    path: string;
    similarity: number;
  }[] = [];

  // Calculate and store the cosine similarity between the test image and each stored image.
  for (const imageWithEmbedding of imagesWithEmbeddings) {
    const similarity = cosineSimilarity(
      imageWithEmbedding.embedding,
      testImageEmbedding
    );
    similarities.push({ path: imageWithEmbedding.path, similarity });
  }

  // Log the similarity results, sorted by similarity score in descending order.
  console.log(`Similarity of ${testImage} with:`);
  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );
  sortedSimilarities.forEach((similarity) => {
    console.log(`${similarity.path}: ${similarity.similarity.toPrecision(2)}`);
  });
}

// Execute the main function.
main();
