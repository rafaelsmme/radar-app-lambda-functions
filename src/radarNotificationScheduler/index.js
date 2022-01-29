"use strickt";

const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "ap-southeast-2" });

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let body = "";
  let statusCode = 0;
  let filtered = [];
  const sevenDays = 1000 * 60 * 60 * 24 * 7;

  const dbParams = {
    TableName: "radar-tasks",
  };

  const emailParams = {
    Destination: {
      ToAddresses: [process.env.RECIPIENT],
    },
    Source: "radar@rafaelsm.me",
    Template: "radarTasks",
    TemplateData: "",
  };

  try {
    const data = await documentClient.scan(dbParams).promise();
    filtered = data.Items.filter((task) => {
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
    const formattedTasks = filtered.map((task) => {
      const nextFormattedDate = new Date(task.next).toLocaleDateString(
        "en-AU",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
        }
      );
      return `${task.label} - ${nextFormattedDate}`;
    });
    const tasksString = formattedTasks
      .map((task) => `<li>${task}</li>`)
      .join("");
    const tasksRawString = formattedTasks.map((task) => `/n${task}`).join("");
    body = tasksString + "/n" + tasksRawString;
    emailParams.TemplateData = `{"tasks":"${tasksString}", "tasksRaw":"${tasksRawString}", "date":"${new Date().toLocaleDateString(
      "en-AU",
      { month: "numeric", day: "numeric", year: "numeric" }
    )}"}`;
    await ses.sendTemplatedEmail(emailParams).promise();
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
