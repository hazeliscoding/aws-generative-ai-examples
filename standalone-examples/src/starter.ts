import {
  BedrockClient,
  GetFoundationModelCommand,
  ListFoundationModelsCommand,
} from '@aws-sdk/client-bedrock';

const client = new BedrockClient({ region: 'us-east-1' });

async function listFoundationModels() {
  const response = await client.send(new ListFoundationModelsCommand({}));
  console.log(response);
}

async function getModelInfo(modelName: string) {
  const response = await client.send(
    new GetFoundationModelCommand({
      modelIdentifier: modelName,
    })
  );
  console.log(response);
}

getModelInfo('anthropic.claude-v2');
