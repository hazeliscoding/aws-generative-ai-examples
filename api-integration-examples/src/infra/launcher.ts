#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from './stacks/compute-stack';
import { ApiStack } from './stacks/api-stack';

const app = new cdk.App();
const computeStack = new ComputeStack(app, 'GenAI-Examples-ComputeStack');
const apiStack = new ApiStack(app, 'GenAI-Examples-ApiStack', {
  textSummarizationLambda: computeStack.textSummarizationLambda,
  imageGenerationLambda: computeStack.imageGenerationLambda,
});