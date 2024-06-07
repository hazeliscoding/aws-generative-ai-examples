import { BedrockEmbeddings } from '@langchain/community/embeddings/bedrock';
import { Bedrock } from '@langchain/community/llms/bedrock';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Constant for the AWS region where the Bedrock services are hosted.
const AWS_REGION = 'us-east-1';

// Initialize a Bedrock model instance configured with a specific model and region.
const model = new Bedrock({
  model: 'amazon.titan-text-express-v1',
  region: AWS_REGION,
});

// Data to be processed and used for retrieval.
const myData = [
  'The weather is nice today.',
  "Last night's game ended in a tie.",
  'Don likes to eat pizza.',
  'Don likes to eat pasta.',
];

// A sample query to be answered based on the data.
const question = "What are Don's favorite foods?";

/**
 * Main function that sets up a vector store with embeddings and retrieves relevant documents based on a query.
 */
async function main() {
  // Initialize a memory vector store with Bedrock embeddings.
  const vectorStore = new MemoryVectorStore(
    new BedrockEmbeddings({
      region: AWS_REGION,
    })
  );

  // Add documents to the vector store.
  await vectorStore.addDocuments(
    myData.map(
      (content) =>
        new Document({
          pageContent: content, // Each string in myData becomes a document.
        })
    )
  );

  // Set up a retriever from the vector store to fetch top 2 relevant documents.
  const retriever = vectorStore.asRetriever({
    k: 2, // Number of documents to retrieve.
  });

  // Retrieve documents relevant to the question.
  const results = await retriever.invoke(question);
  // Extract content from the retrieved documents.
  const resultList = results.map((result) => result.pageContent);

  // Build a chat prompt template with dynamic context and user input.
  const template = ChatPromptTemplate.fromMessages([
    [
      'system',
      'Answer the users question based on the following context: {context}',
    ],
    ['user', '{input}'],
  ]);

  // Chain the template with the Bedrock model for processing.
  const chain = template.pipe(model);

  // Invoke the chain with the question and the context derived from relevant documents.
  const response = await chain.invoke({
    input: question,
    context: resultList,
  });

  // Log the final response.
  console.log(response);
}

// Execute the main function to perform the operations.
main();
