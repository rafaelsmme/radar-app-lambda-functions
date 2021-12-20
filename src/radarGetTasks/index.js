"use strickt";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let body = "";
  let statusCode = 0;

  const params = {
    TableName: "radar-tasks",
  };

  try {
    const data = await documentClient.scan(params).promise();
    body = JSON.stringify(data.Items);
    statusCode = 200;
  } catch (err) {
    body = `Unable to get tasks: ${err}`;
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
