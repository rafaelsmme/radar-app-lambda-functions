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
    const sorted = data.Items.sort(
      (taskA, taskB) =>
        new Date(taskA.next).getTime() - new Date(taskB.next).getTime()
    );
    body = JSON.stringify(sorted);
    statusCode = 200;
  } catch (err) {
    body = `Unable to get tasks: ${err}`;
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
