//Script to send messages to all users
// const fs = require("fs").promises;
// const parse = require("csv-parse/lib/sync");
require("dotenv").config();

//govnotify api
const NotifyClient = require("notifications-node-client").NotifyClient;
const notifyClient = new NotifyClient(process.env.API_KEY);

// used constants to avoid the use of magic numbers
const FAMILY_COHORT = 0;
const PARTICIPANT_COHORT = 1;

const sendMessage = (userdata, type) => {
  data = userdata;

  let messageType = "";

  // personalisation details are always the same
  // in our system as of now

  // Create survey_link based on cohort
  let survey_link = "https://nhs-breast-screening-survey.herokuapp.com/";
  if (data.cohort == 0) {
    survey_link += "family";
  } else {
    survey_link += "participant";
  }

  const personalisation = {
    first_name: data.name,
    survey_link,
  };

  // used to determine what message to send

  if (type == "intro") {
    switch (parseInt(data.cohort)) {
      case FAMILY_COHORT:
        messageType = process.env.INTRO_COHORT_1;
        break;
      case PARTICIPANT_COHORT:
        messageType = process.env.INTRO_COHORT_2;
        break;
      default:
        return; // could raise an exception here
    }
  } else if (type == "reminder") {
    switch (parseInt(data.cohort)) {
      case FAMILY_COHORT:
        messageType = process.env.REMINDER_COHORT_1;
        break;
      case PARTICIPANT_COHORT:
        messageType = process.env.REMINDER_COHORT_2;
        break;
      default:
        return;
    }
  } else {
    console.log(
      `Please enter 'intro' or 'reminder' as the second argument, type ${type} not found`
    );
    return;
  }

  notifyClient
    .sendSms(messageType, data.number, {
      personalisation: personalisation,
      reference: "",
    })
    // .then((res) => {console.log("message sent"})})
    .catch((err) => {
      if (err.response.data.status_code == 400) {
        console.log(
          err.response.data.errors[0].error +
            ": " +
            err.response.data.errors[0].message
        );
      }
    });

};

exports.sendMessage = sendMessage;
