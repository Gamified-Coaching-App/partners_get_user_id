import { handler } from '../index.mjs';

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const sendMock = jest.fn(); // Define send as a mock function at the top level
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: sendMock
      }))
    },
    QueryCommand: jest.fn(),
    sendMock // Expose sendMock for easy access and manipulation in tests
  };
});

// Access the sendMock directly from the mocked module for clarity
const { sendMock } = require('@aws-sdk/lib-dynamodb');
describe('handler function tests', () => {
  beforeEach(() => {
    sendMock.mockReset(); // Reset the mock to its default state before each test
  });

  it('successfully fetches Garmin OAuth token and returns redirect URL', async () => {
    sendMock.mockResolvedValue({
      Items: [{ user_id: 'user123' }] // Mocked success response
    });

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
    expect(responseBody.user_ids).toContain('user123');
  });

  it('returns error when queryStringParameters are missing', async () => {
    const event = {}; // Simulating an event without queryStringParameters

    const response = await handler(event);

    expect(response.statusCode).toEqual(500);
  });
});
