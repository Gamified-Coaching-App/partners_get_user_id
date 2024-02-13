import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const region = "eu-west-2"; // Specify the AWS Region
const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDB({ region }));

export const handler = async (event) => {
    try {
        const { partner_user_id, partner } = event.queryStringParameters;

        // Define the parameters for querying the DynamoDB table
        const params = {
            TableName: "partner_user_ids", 
            KeyConditionExpression: "partner_user_id = :partner_user_id and partner = :partner",
            ExpressionAttributeValues: {
                ":partner_user_id": partner_user_id,
                ":partner": partner,
            },
        };

        // Execute the query
        const data = await dynamoDBClient.send(new QueryCommand(params));

        // Assuming there's at least one match and returning the first item's user_id
        if (data.Items && data.Items.length > 0) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: data.Items[0].user_id }),
            };
        } else {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "No matching partner_user_id and partner found." }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
