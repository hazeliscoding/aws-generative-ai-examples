import { Construct } from 'constructs';
import {
  ContentHandling,
  IntegrationResponse,
  LambdaIntegration,
  MethodResponse,
  Model,
  PassthroughBehavior,
  RestApi,
  UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';

import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { IFunction } from 'aws-cdk-lib/aws-lambda';

interface ApiStackProps extends StackProps {
  textSummarizationLambda: IFunction;
}

export class ApiStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = this.createApi(props);
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

    const methodResponse: MethodResponse = {
      statusCode: '200',
      responseModels: { 'application/json': Model.EMPTY_MODEL },
    };

    const integrationResponse: IntegrationResponse = {
      statusCode: '200',
      contentHandling: ContentHandling.CONVERT_TO_TEXT,
    };

    const requestTemplate = {
      prompt: "$input.path('$.prompt')",
    };

    const textSummarizationIntegration = new LambdaIntegration(
      props.textSummarizationLambda,
      {
        allowTestInvoke: true,
        proxy: false,
        integrationResponses: [integrationResponse],
        passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestTemplates: {
          'application/json': JSON.stringify(requestTemplate),
        },
      }
    );

    const textSummarization = api.root.addResource('text-summarization');
    textSummarization.addMethod('POST', textSummarizationIntegration, {
      methodResponses: [methodResponse],
    });

    return api;
  }

  private output() {
    new CfnOutput(this, 'APIGatewayURL', {
      value: this.api.url ?? 'Something went wrong with the deployment',
    });
  }
}
