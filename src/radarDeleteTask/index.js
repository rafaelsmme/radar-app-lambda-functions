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
    const data = await documentClient.delete(params).promise();
    body = JSON.stringify(data);
    statusCode = 204;
  } catch (err) {
    body = `Unable to delete task: ${err}`;
    statusCode = 403;
  }

  const response = {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };
  return response;
};
