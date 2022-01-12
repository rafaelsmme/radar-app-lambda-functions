"use strickt";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let body = "";
  let statusCode = 0;

  const { id } = event.pathParameters;

  const params = {
    TableName: "radar-tasks",
    Key: {
      id,
    },
  };

  try {
    const data = await documentClient.get(params).promise();
    body = JSON.stringify(data.Item);
    statusCode = 200;
  } catch (err) {
    body = `Unable to load task: ${err}`;
    statusCode = 403;
  }

  const response = {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "access-control-allow-origin": "*",
    },
    body,
  };
  return response;
};
