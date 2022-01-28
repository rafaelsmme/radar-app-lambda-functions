"use strickt";

const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "ap-southeast-2" });

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let body = "";
  let statusCode = 0;
  const sevenDays = 1000 * 60 * 60 * 24 * 7;

  const dbParams = {
    TableName: "radar-tasks",
  };

  const emailParams = {
    Destination: {
      ToAddresses: [process.env.RECIPIENT],
    },
    Message: {
      Body: {
        Text: { Data: "" },
      },

      Subject: { Data: "Tasks for the week" },
    },
    Source: "radar@rafaelsm.me",
  };

  try {
    const data = await documentClient.scan(dbParams).promise();
    const filtered = data.Items.filter((task) => {
      const nextWeek = Date.now() + sevenDays;
      const nextExec = new Date(task.next).getTime();
      return nextExec < nextWeek;
    }).sort(
      (taskA, taskB) =>
        new Date(taskA.next).getTime() - new Date(taskB.next).getTime()
    );
    body = JSON.stringify(filtered, null, 4);
    statusCode = 200;
  } catch (err) {
    body = `Unable to get tasks: ${err}`;
    statusCode = 403;
  }

  try {
    emailParams.Message.Body.Text.Data = body;
    ses.sendEmail(emailParams).promise();
  } catch (err) {
    body = `Unable to send notification email: ${err}`;
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
