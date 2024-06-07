import { Bedrock } from '@langchain/community/llms/bedrock';
import { ChatPromptTemplate } from '@langchain/core/prompts';

// Constant for the AWS region where the Bedrock model will be accessed.
const AWS_REGION = 'us-east-1';

/**
 * Initialize the Bedrock model with the specific model identifier and AWS region.
 * This instance will be used to invoke natural language understanding tasks.
 */
const model = new Bedrock({
  model: 'amazon.titan-text-express-v1', // Specifies the specific Amazon Bedrock model to use.
  region: AWS_REGION, // The AWS region where this model is deployed.
});

/**
 * Function to invoke the Bedrock model with a sample query.
 * This function demonstrates how to send a query and log the response.
 */
async function invokeModel() {
  // Invoking the model with a specific question.
  const response = await model.invoke(
    'What is the highest mountain in the world?'
  );
  // Logging the response to the console for review.
  console.log(response);
}

/**
 * Function to demonstrate the chaining of operations in LangChain with a Bedrock model.
 * This function sets up a conversational context and sends a specific request related to a product.
 */
async function firstChain() {
  // Create a chat prompt template from a series of messages setting up the context.
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      'Write a short description for the product provided by the user',
    ],
    ['human', '{product_name}'], // Placeholder to be filled by actual product name.
  ]);

  // Creating a chain that incorporates the model into the prompt flow.
  const chain = prompt.pipe(model);

  // Invoking the chain with specific data (product name) to generate a response.
  const response = await chain.invoke({
    product_name: 'bicycle', // Example product name to be used in the generated description.
  });
  // Logging the response to the console.
  console.log(response);
}

// Execute the firstChain function to demonstrate LangChain and Bedrock integration.
firstChain();
