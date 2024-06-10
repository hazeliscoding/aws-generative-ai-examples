import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

// Path module is required to resolve paths to Lambda function code.
import path = require('path');
import { Bucket } from 'aws-cdk-lib/aws-s3';

/**
 * Defines a new CDK stack for hosting AWS Lambda functions.
 */
export class ComputeStack extends Stack {
  // Publicly accessible reference to the text summarization Lambda function.
  public readonly textSummarizationLambda: NodejsFunction;
  public readonly imageGenerationLambda: NodejsFunction;

  /**
   * Constructs a new instance of the ComputeStack class.
   * @param {Construct} scope - The scope in which this stack is defined, typically an App or a Stage.
   * @param {string} id - A user-provided identifier for the stack.
   * @param {StackProps} props - Additional properties that can be passed to the Stack.
   */
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Initialize the Lambda function for text summarization and assign it to a class variable.
    this.textSummarizationLambda = this.createTextSummarizationLambda();

    // Initialize the Lambda function for image generation and assign it to a class variable.
    this.imageGenerationLambda = this.createImageGenerationLambda();
  }

  /**
   * Creates a Lambda function for text summarization.
   * @returns {NodejsFunction} - The configured Node.js Lambda function.
   */
  private createTextSummarizationLambda() {
    // Create a new Node.js-based Lambda function.
    const lambdaFunc = new NodejsFunction(this, 'TextSummaryLambda', {
      runtime: Runtime.NODEJS_20_X, // Specifies the runtime environment for the Lambda function.
      handler: 'handler', // The name of the function (within your code) that Lambda calls to start execution.
      entry: path.join(__dirname, '../../services/summary.ts'), // The path to the entry file containing the Lambda handler function.
      memorySize: 1024, // The amount of memory allocated to the function.
      timeout: Duration.seconds(120), // The maximum amount of time that the function can run before it is terminated.
      functionName: 'createTextSummaryLambda', // The name of the Lambda function.
    });

    // Attach a policy to the Lambda function's role allowing it to invoke the Bedrock model.
    lambdaFunc.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW, // Specifies that the statement results in an allow (vs. deny).
        actions: ['bedrock:InvokeModel'], // The action permitted by the policy.
        resources: ['*'], // The resources upon which the action can be performed.
      })
    );

    // Return the configured Lambda function.
    return lambdaFunc;
  }

  /**
   * Creates a Lambda function for image generation.
   * @returns {NodejsFunction} - The configured Node.js Lambda function.
   */
  private createImageGenerationLambda() {
    // Create an S3 bucket to store the generated images.
    const imagesBucket = new Bucket(this, 'GeneratedImagesBucket')

    // Create a new Node.js-based Lambda function.
    const lambdaFunc = new NodejsFunction(this, 'ImageGenerationLambda', {
      runtime: Runtime.NODEJS_20_X, // Specifies the runtime environment for the Lambda function.
      handler: 'handler', // The name of the function (within your code) that Lambda calls to start execution.
      entry: path.join(__dirname, '../../services/image.ts'), // The path to the entry file containing the Lambda handler function.
      memorySize: 1024, // The amount of memory allocated to the function.
      timeout: Duration.seconds(120), // The maximum amount of time that the function can run before it is terminated.
      functionName: 'createGeneratedImageLambda', // The name of the Lambda function.
      environment: {
        BUCKET_NAME: imagesBucket.bucketName
      }
    });

    // Grant the Lambda function read and write access to the S3 bucket.
    imagesBucket.grantReadWrite(lambdaFunc)

    // Attach a policy to the Lambda function's role allowing it to invoke the Bedrock model.
    lambdaFunc.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      resources: ['*'],
      actions: ['bedrock:InvokeModel']
    }))

    // Return the configured Lambda function.
    return lambdaFunc;
  }
}
