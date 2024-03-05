// Importing the necessary modules for the test
import { handler } from '../index.mjs';

// Mocking AWS SDK for JavaScript v3
jest.mock('@aws-sdk/lib-dynamodb', () => ({
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn().mockResolvedValue({
          Items: [{ user_id: 'user123' }] // Mocked success response
        }),
      })),
    },
    QueryCommand: jest.fn()
  }));
  

describe('handler function tests', () => {
  it('successfully fetches Garmin OAuth token and returns redirect URL', async () => {
    const event = {
      queryStringParameters: {
        partner_user_ids: 'partner1',
        partner: 'examplePartner'
      }
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody).toHaveProperty('user_ids');
    expect(responseBody.user_ids).toContain('user123'); // Expecting 'user123' to be part of the response
  });
  it('returns error when queryStringParameters are missing', async () => {
    const event = {}; // Simulating an event without queryStringParameters

    const response = await handler(event);

    expect(response.statusCode).toEqual(500); 
  });
});
