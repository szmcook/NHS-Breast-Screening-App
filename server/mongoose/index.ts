const responseObjectFile = require("../schema/responseObjectSchema.js");
const mongoose = require("mongoose");
const sendMessage = require("../notify.js").sendMessage;
const ResponseObject = mongoose.model("Responses", responseObjectFile, "Responses");
require("dotenv").config();

const MONGODB_LINK = process.env.MONGODB_URI;

//Defines connection with the database
const connector = mongoose.connect(MONGODB_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Creates a new response, stored with the sessionID
async function createResponse(sessionID) {
  return new ResponseObject({
    sessionID,
  }).save();
}

//Invites users given in the argument (JSON object as defined in index.js)
const inviteUsers = async (users) => {
  // Connect to database
  await connector.then(async () => {
    // Add new users to the database
    for (let i = 0; i < users.length; i++) {
      const { name, number, cohort } = users[i];
      //sends message using the function from notify.js
      sendMessage({ name, number, cohort }, "intro");
    }

    // Return that it has been a success
    return true;
  });

  // Return that it has been a failure
  return false;
};

//retrieves all response data from the database
const getResponses = async () => {
  const resps = await ResponseObject.find({ });
  return { succeeded: resps == null ? false : true, data: resps };
};

//updates the response in the database if the sessionID exists, otherwise, create new response in the database 
const updateUserAnswer = async (sessionID, questionID, content) => {
  let responseData = await ResponseObject.findOne({ sessionID });

  if (responseData == null) {
    responseData = await createResponse(sessionID);
  }

  const answerID = responseData.responses.findIndex(
    (answer) => answer.questionID == questionID
  );

  // If answer has already been given to a question of id questionID then update the answer
  if (answerID == -1) {
    await ResponseObject.updateOne(
      { sessionID },
      { $push: { responses: [{ questionID, content }] } }
    );
  }
  // else add an answer to a question of id questionID
  else {
    await ResponseObject.updateOne(
      { sessionID, "responses.questionID": questionID },
      { $set: { "responses.$.content": content } }
    );
  }

  return true;
};

exports.inviteUsers = inviteUsers;
exports.getResponses = getResponses;
exports.updateUserAnswer = updateUserAnswer;
