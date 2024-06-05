import json
import boto3

# Initialize a Bedrock client using Boto3 to interact with Amazon Bedrock service
client_bedrock = boto3.client('bedrock-runtime')

def handler(event, context):
    """
    Lambda handler function that interacts with the Amazon Bedrock service to generate AI-based text.

    Args:
        event (dict): Lambda function input event, must contain a 'prompt' key with the text prompt.
        context: Lambda execution context object (not used in this function).

    Returns:
        dict: Response object with statusCode and the generated text in the body.
    """

    # Retrieve the input prompt from the Lambda event object
    input_prompt = event['prompt']

    # Send a request to the Amazon Bedrock service to invoke a generative AI model
    # The request includes:
    # - contentType: The media type of the resource, here application/json.
    # - accept: The media type(s) that is/are acceptable for the response, here application/json.
    # - modelId: Identifier for the model to be invoked, e.g., 'cohere.command-light-text-v14'.
    # - body: JSON payload containing parameters like prompt, temperature, etc.
    client_bedrock_request = client_bedrock.invoke_model(
        contentType='application/json',
        accept='application/json',
        modelId='cohere.command-light-text-v14',
        body=json.dumps({
            "prompt": input_prompt,
            "temperature": 0.9,    # Temperature controls randomness in the output
            "p": 0.75,             # p (nucleus sampling) parameter controlling the scope of token probability
            "k": 0,                # Top-k sampling parameter
            "max_tokens": 100      # Maximum number of tokens to generate
        }))

    # Read the response body from the Amazon Bedrock service
    client_bedrock_byte = client_bedrock_request['body'].read()

    # Convert the byte response to a string using JSON loads
    client_bedrock_string = json.loads(client_bedrock_byte)

    # Extract the generated text from the response
    client_final_response = client_bedrock_string['generations'][0]['text']
    print(client_final_response)

    # Return a JSON response containing the generated text
    return {
        'statusCode': 200,
        'body': json.dumps(client_final_response)
    }
