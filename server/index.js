const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 8000;
const mongooseIndex = require("./mongoose/index.ts");
const SHA256 = require("crypto-js/sha256");
const fs = require("fs");
const path = require('path');
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//serves the built front end to the client
app.use(express.static(path.join(__dirname, 'build'))); 

//TODO: serve different html files depending on the cohort type
//serves front end to the /participant endpoint 
app.get('/participant/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//serves front end to the /participant endpoint 
app.get('/family/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//initialise the sessionID counter, this resets on every server restart
let sessionIDIndex = 0;
//sessionID endpoint is called on page load. Generates custom session id by hashing the sessionIDIndex and the current time
app.get("/api/sessionID", (req, res) => {
  const date = new Date();
  const currentTime = date.getTime();

  res.status(200).send({
    statusCode: 200,
    sessionID: SHA256(
      currentTime.toString() + sessionIDIndex.toString()
    ).toString(),
  });

  sessionIDIndex++;
});

/*invite users endpoint takes a JSON object: 
  {
    "key":string,
    "users":[
      {
        "name":string,
        "number":string,
        "cohort":"0"|"1"
      },
      {

      }...
    ]
  }
*/
app.post("/api/inviteUsers", (req, res) => {
  // Check API key
  if (req.body.key != process.env.INVITE_USERS_API_KEY) {
    res.send({
      statusCode: 400,
      error: "Incorrect API key supplied.",
    });
    return;
  }
  //checks that there is a "users" object
  if (req.body.users) {
    //calls the inviteUsers function in /mongoose/index.js
    const succeeded = mongooseIndex.inviteUsers(req.body.users);

    // TODO: Check that req.body.users are supplied in correct format (i.e. each user has a name, NHS_ID, phoneNumber)

    if (succeeded) {
      res.send({
        statusCode: 200,
        data: "Successfully invited users",
      });
    } else {
      res.send({
        statusCode: 400,
        error: "Failed to invite users",
      });
    }
  } else {
    res.send({
      statusCode: 400,
      error: "Please, provide a list of users in the body",
    });
  }
});

//questions endpoint send the questions.json to the front end
app.get("/api/questions", async (req, res) => {
  fs.readFile("questions.json", "utf8", function (err, data) {
    if (err) {
      res.send({
        statusCode: 400,
        error: "Failed to get questions",
      });
    } else {
      res.send({
        statusCode: 200,
        questions: JSON.parse(data),
      });
    }
  });
});

//updateQuestions endpoint takes a json object to rewrite the questions.json file with (used for updating the question.json file without restarting the server)
app.post("/api/updateQuestions", async (req, res) => {
  if (!req.body.questions) {
    res.send({
      statusCode: 400,
      error: "Failed to update questions. Questions were not provided.",
    });
    return;
  }

  fs.writeFile("questions.json", req.body.questions, function (err) {
    if (err) {
      res.send({
        statusCode: 400,
        error: "Failed to update questions",
      });
    } else {
      res.send({
        statusCode: 200,
        questions: req.body.questions,
      });
    }
  });
});

//responses endpoint, this returns the responses from the database in an easy to read JSON object
app.get("/api/responses", async (req, res) => {
  const QResps = await mongooseIndex.getResponses();
  if (QResps === null) {
    res.send({
      statusCode: 400,
      error: "Failed to get question responses",
    });
  } else {
    fs.readFile("questions.json", "utf8", function (err, data) {
      if (err) {
        res.send({
          statusCode: 400,
          error: "Failed to get question responses",
        });
      } else {
        let respsByQ = getRespsByQuestion(QResps, JSON.parse(data).Qs);
        if (respsByQ === null) {
          res.send({
            statusCode: 400,
            error: "Failed to get question responses",
          });
        } else {
          res.send({
            statusCode: 200,
            data: respsByQ,
          });
        }
      }
    });
  }
});

//This function takes the database data and parses it in a more readable way, totalling all of the responses for each question
//Returns a json object
const getRespsByQuestion = (allResps, Qs) => {
  let respsByQ = [];
  let respsById = {};

  for (let i = 0; i < Qs.length; i++) {
    let optionsDict = [];
    for (let j = 0; j < Qs[i].options.length; j++) {
      optionsDict[j] = 0;
    }
    respsById[Qs[i].id] = optionsDict;
  }

  for (var i = 0; i < allResps.data.length; i++) {
    for (var j = 0; j < allResps.data[i].responses.length; j++) {
      respsById[allResps.data[i].responses[j].questionID][
        parseInt(allResps.data[i].responses[j].content)-1
      ]++;
    }
  }

  for (let i = 0; i < Qs.length; i++) {
    let optionsDict = [];
    for (let j = 0; j < Qs[i].options.length; j++) {
      optionsDict[j] =
        '{"' + Qs[i].options[j] + '":' + respsById[Qs[i].id][j] + "}";
    }
    respsByQ.push(
      JSON.parse(
        '{"' + Qs[i].text.toString() + '":[' + optionsDict.toString() + "]}"
      )
    );
  }
  return respsByQ;
};

//answer endpoint, creates/updates answers in the database by calling the updateUserAnswer function in /mongoose/index.js
app.post("/api/answer", async (req, res) => {
  const { sessionID, questionID, answer } = req.body;

  if (!sessionID || !questionID || !answer) {
    res.send({
      statusCode: 400,
      data: "Failed to update answer.",
    });
    return;
  }

  const succeeded = await mongooseIndex.updateUserAnswer(
    sessionID,
    questionID,
    answer
  );

  if (succeeded) {
    res.send({
      statusCode: 200,
      data: "Successfully updated answer.",
    });
  } else {
    res.send({
      statusCode: 400,
      data: "Failed to update answer.",
    });
  }
});


// I have created a server.cert and a server.key but these are not verified properly so it throws a load of warnings.
// var https = require('https')
// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
// .listen(port, function () {
//   console.log(`Listening at http://localhost:${port}`)
// })
app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
