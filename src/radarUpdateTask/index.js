"use strickt";

const AWS = require("aws-sdk");

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let body = "";
  let statusCode = 0;

  const { id, label, last, next, period } = JSON.parse(event.body);

  const params = {
    TableName: "radar-tasks",
    Key: {
      id,
    },
    UpdateExpression: "set #lb = :lb, #la = :la, #n = :n, #p = :p",
    ExpressionAttributeNames: {
      "#lb": "label",
      "#la": "last",
      "#n": "next",
      "#p": "period",
    },
    ExpressionAttributeValues: {
      ":lb": label,
      ":la": last,
      ":n": next,
      ":p": period,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const data = await documentClient.update(params).promise();
    body = JSON.stringify(data);
    statusCode = 204;
  } catch (err) {
    body = `unable to update task: ${err}`;
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
