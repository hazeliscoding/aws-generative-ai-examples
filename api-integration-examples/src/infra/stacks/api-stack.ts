import { Construct } from 'constructs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

interface ApiStackProps extends StackProps {
  textSummarizationLambda: IFunction;
  imageGenerationLambda: IFunction;
}

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = this.createApi(props);
    this.output();
  }

  private createApi(props: ApiStackProps) {
    const api = new RestApi(this, 'API', {
      restApiName: 'Generative AI Examples API',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['*'],
        allowHeaders: ['*'],
      },
    });

    this.integrateTextSummarizationApi(props, api);
    this.integrateImageGenerationApi(props, api);

    return api;
  }

  private integrateTextSummarizationApi(props: ApiStackProps, api: RestApi) {
    const textSummarizationIntegration = new LambdaIntegration(
      props.textSummarizationLambda
    );

    const textSummarization = api.root.addResource('text-summarization');
    textSummarization.addMethod('POST', textSummarizationIntegration);
  }

  private integrateImageGenerationApi(props: ApiStackProps, api: RestApi) {
    const imageGenerationIntegration = new LambdaIntegration(
      props.imageGenerationLambda
    );

    const imageGeneration = api.root.addResource('image-generation');
    imageGeneration.addMethod('POST', imageGenerationIntegration);
  }

  private output() {
    new CfnOutput(this, 'APIGatewayURL', {
      value: this.api.url ?? 'Something went wrong with the deployment',
    });
  }
}
