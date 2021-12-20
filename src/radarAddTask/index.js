"use strickt";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let body = "";
  let statusCode = 0;

  const { id, label, last, next, period, startDate } = JSON.parse(event.body);

  const params = {
    TableName: "radar-tasks",
    Item: {
      id,
      label,
      last,
      next,
      period,
      startDate,
    },
  };

  try {
    const data = await documentClient.put(params).promise();
    body = JSON.stringify(data);
    statusCode = 201;
  } catch (err) {
    body = `unable to add task: ${err}`;
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
