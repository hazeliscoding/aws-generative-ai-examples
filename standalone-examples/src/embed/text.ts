import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { cosineSimilarity } from './similarity'; // Import a custom function to calculate cosine similarity.

// Array of known facts, to be used for comparison.
const facts = [
  'The first computer was invented in the 1940s.',
  'John F. Kennedy was the 35th President of the United States.',
  'The first moon landing was in 1969.',
  'The capital of France is Paris.',
  'Earth is the third planet from the sun.',
];

// A new fact/question for which we need to find the most relevant existing fact.
const newFact = 'Who is the president of USA?';

// Initializing the Bedrock client with the AWS region 'us-east-1'.
const client = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * Fetches the text embedding for a given input string using the Amazon Bedrock API.
 *
 * @param {string} input The text input for which to retrieve the embedding.
 * @returns {Promise<number[]>} A promise that resolves to an array of numbers representing the text embedding.
 */
async function getEmbedding(input: string): Promise<number[]> {
  const response = await client.send(
    new InvokeModelCommand({
      body: JSON.stringify({ inputText: input }), // Body of the request with input text.
      modelId: 'amazon.titan-embed-text-v1', // The model used to generate embeddings.
      contentType: 'application/json', // The content type of the request.
      accept: 'application/json', // Expected response format.
    })
  );
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.embedding; // Return the embedding from the response.
}

// A type definition for a fact and its corresponding embedding.
type FactWithEmbedding = {
  fact: string;
  embedding: number[];
};

/**
 * The main function that evaluates the similarity between a new fact and a set of existing facts.
 */
async function main() {
  const factsWithEmbeddings: FactWithEmbedding[] = []; // Array to store facts with their embeddings.

  // Loop through each fact, get its embedding, and store it.
  for (const fact of facts) {
    const embedding = await getEmbedding(fact);
    factsWithEmbeddings.push({ fact, embedding });
  }

  // Get the embedding for the new fact.
  const newFactEmbedding = await getEmbedding(newFact);

  // Array to store the similarity scores between the new fact and each existing fact.
  const similarities: {
    input: string;
    similarity: number;
  }[] = [];

  // Calculate cosine similarities between the new fact and each existing fact's embedding.
  for (const factWithEmbedding of factsWithEmbeddings) {
    const similarity = cosineSimilarity(
      factWithEmbedding.embedding,
      newFactEmbedding
    );
    similarities.push({ input: factWithEmbedding.fact, similarity });
  }

  // Log the results, sorting them by similarity score in descending order.
  console.log(`Similarity of ${newFact} with:`);
  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );
  sortedSimilarities.forEach((similarity) => {
    console.log(`${similarity.input}: ${similarity.similarity.toPrecision(2)}`);
  });
}

// Execute the main function to perform the operations.
main();
