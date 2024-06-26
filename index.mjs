import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const region = "eu-west-2"; // Specify the AWS Region
const dynamo_db_client = DynamoDBDocumentClient.from(new DynamoDB({ region }));

export const handler = async (event) => {
    try {
        const { partner_user_ids, partner } = event.queryStringParameters;
        const partner_user_ids_array = partner_user_ids.split(',');

        // Object to cache user_ids for partner_user_ids to avoid repeated queries
        const user_id_cache = {};

        // Process each partner_user_id, skipping duplicates
        for (const partner_user_id of partner_user_ids_array) {
            if (!user_id_cache.hasOwnProperty(partner_user_id)) {
                // Define the parameters for querying the DynamoDB table
                const params = {
                    TableName: "partner_user_ids",
                    KeyConditionExpression: "partner_user_id = :partner_user_id and partner = :partner",
                    ExpressionAttributeValues: {
                        ":partner_user_id": partner_user_id,
                        ":partner": partner,
                    },
                };
                const data = await dynamo_db_client.send(new QueryCommand(params));

                if (data.Items && data.Items.length > 0) {
                    user_id_cache[partner_user_id] = data.Items[0].user_id;
                } else {
                    // Handle not found user_ids, possibly by setting them to null or a placeholder
                    user_id_cache[partner_user_id] = null;
                }
            }
        }

        // Construct the output string of user_ids, preserving order and handling duplicates
        const user_ids_string = partner_user_ids_array.map(partner_user_id => user_id_cache[partner_user_id]).join(',');

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_ids: user_ids_string }),
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};