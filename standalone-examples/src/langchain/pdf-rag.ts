import { BedrockEmbeddings } from '@langchain/community/embeddings/bedrock';
import { Bedrock } from '@langchain/community/llms/bedrock';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Constant for the AWS region where the Bedrock services are hosted.
const AWS_REGION = 'us-east-1';

// Initialize a Bedrock model instance configured with a specific model and region.
const model = new Bedrock({
  model: 'amazon.titan-text-express-v1',
  region: AWS_REGION,
});

// A sample query regarding the themes in "Gone with the Wind".
const question = 'What themes does Gone with the Wind explore?';

/**
 * Main function to demonstrate the entire process from loading PDFs to generating responses.
 */
async function main() {
  // Create a PDF loader for reading and loading a PDF file.
  const loader = new PDFLoader('assets/books.pdf', {
    splitPages: false, // Configuration to load the whole document as a single page.
  });
  const docs = await loader.load(); // Load the document from the specified path.

  // Initialize a text splitter for dividing the loaded document into manageable parts.
  const splitter = new RecursiveCharacterTextSplitter({
    separators: [`. \n`], // Define separators to split the text.
  });

  // Split the document into smaller sections for easier processing.
  const splittedDocs = await splitter.splitDocuments(docs);

  // Create a vector store and embed the documents using Bedrock embeddings.
  const vectorStore = new MemoryVectorStore(
    new BedrockEmbeddings({
      region: AWS_REGION,
    })
  );
  await vectorStore.addDocuments(splittedDocs); // Add the split documents to the vector store.

  // Retrieve the top 2 relevant documents based on the query using a retriever.
  const retriever = vectorStore.asRetriever({
    k: 2, // Number of documents to retrieve.
  });
  const results = await retriever.invoke(question);
  const resultDocs = results.map(
    (result) => result.pageContent // Extract page content from each result.
  );

  // Build a chat prompt template with system instructions and user input placeholders.
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
    context: resultDocs,
  });

  // Log the final response.
  console.log(response);
}

// Execute the main function to start the process.
main();
