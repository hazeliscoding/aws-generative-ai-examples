import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { execSync } from 'child_process';

import path = require('path');

export class ComputeStack extends Stack {
  public readonly textSummarizationLambda: Function;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.createTextSummarizationLambda(props);
  }

  createTextSummarizationLambda(props?: StackProps) {
    const lambdaFunc = new Function(this, 'TextSummarizationFunc', {
      runtime: Runtime.PYTHON_3_12,
      handler: 'index.handler',
      code: Code.fromAsset(
        path.join(__dirname, '../../services/text-summarization'),
        {
          bundling: {
            image: Runtime.PYTHON_3_12.bundlingImage,
            command: [],
            local: {
              tryBundle(outputDir: string) {
                try {
                  execSync('pip3 --version');
                } catch {
                  return false;
                }
                const commands = [
                  `cd src/services/text-summarization`,
                  `pip3 install -r requirements.txt -t ${outputDir}`,
                  `cp -a . ${outputDir}`,
                ];
                execSync(commands.join(' && '));
                return true;
              },
            },
          },
        }
      ),
      memorySize: 1024,
      functionName: 'demoTextSummarization',
      timeout: Duration.seconds(10),
      description:
        'Text Summarization for Manufacturing Industry using API Gateway, S3 and Cohere Foundation Model',
    });

    return lambdaFunc;
  }
}
