import React, { useState, useEffect } from "react";
import "./nhsukscss.css";
import "../node_modules/nhsuk-frontend/dist/nhsuk.min.js";
import WelcomeScreenParticipant from "./components/WelcomeScreenParticipant";
import WelcomeScreenFamily from "./components/WelcomeScreenFamily";
import QuestionScreen from "./components/QuestionScreen";
import FinishedScreen from "./components/FinishedScreen";
import Header from "./components/Header";
import Footer from "./components/Footer";
import InformationScreen from "./components/InformationScreen";
import ConnectionErrorScreen from "./components/ConnectionErrorScreen";
import ReactGA from 'react-ga';


// Typescript interfaces:
interface SessionIDResponse {
  sessionID: string;
} // Format of response to sessionID GET request


interface QuestionResponse {
  questions: QuestionsObject;
} // Format of response to question object GET request


interface QuestionItem {
  // Format of a single question
  id: string;
  text: string;
  options: Array<string>;
  nextQuestionIndex: Array<number>;
  longestPath: number;
  info: Array<string>;
  userResponse?: string; // Undefined until user answers, then present when stored in answeredQuestions array.
}


interface QuestionsObject {
  // JSON object containing all questions for the survey
  initialFamilyQ: number;
  initialParticipantQ: number;
  Qs: Array<QuestionItem>;
}


function App() {
  // Default questions object, replaced by server response to GET request on page load.
  // Must be in expected format - obeys the QuestionsObject interface defined above.
  let defaultQuestions: QuestionsObject = {
    initialFamilyQ: 0,
    initialParticipantQ: 0,
    Qs: [
      {
        id: "Error", // Important! This id is how we identify that questions request to server was unsuccessful.
        text: "",
        options: [""],
        nextQuestionIndex: [-1],
        longestPath: 0,
        info: ["", "", ""],
      },
    ],
  };


  // State (~global) variables:
  const [questions, setquestions] = useState<QuestionsObject>(defaultQuestions); // Updated to store a JSON object containing the set of questions for the survey.
  const [currentQuestion, setcurrentQuestion] = useState<QuestionItem>( // Stores a question object for the question that the user is currently interacting with
    questions.Qs[questions.initialFamilyQ]
  );
  const [answeredQuestions, setansweredQuestions] = useState< // Stores an array of question objects which have been answered by the user.
    Array<QuestionItem>
  >([]);

  const [questionOrInfo, setquestionOrInfo] = useState<Boolean>(true); // true = question displayed, false = information displayed
  const [startMiddleEnd, setstartMiddleEnd] = useState<string>("start"); // "start", "middle" or "end" - which page to display

  const [sessionID, setsessionID] = useState<string | undefined>(undefined); // Stores the user's session ID
  const [serverError, setserverError] = useState<Error | string | undefined>(
    undefined
  );


  // POST request to server after each question is answered.
  const sendAnswer = async (question: QuestionItem) => {
    let response;
    try {
      response = await fetch("/api/answer", { // Specifies the api endpoint for receiving questions
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionID,
          questionID: question.id,
          answer: question.userResponse,
          cohort: 0,
          // TODO cohort: get url parameter for cohort
        }),
      });
    } catch (err) {
      return setserverError(err);
    }
    if (!(response.ok && response.status >= 200 && response.status < 300)) {
      return setserverError(response.toString());
    }
  };


  // GET request to obtain a session ID string
  // Used to anonymously identify the answers from this particular session
  // Also used to facilitate updating answers if the user goes back to a previously-answered question.
  const getSessionId = async () => {
    let response;
    try {
      response = await fetch("/api/sessionID"); // Specifies the api endpoint for generating and returning a session ID
    } catch (err) {
      return setserverError(err);
    }
    if (!(response.ok && response.status >= 200 && response.status < 300)) {
      return setserverError(response.toString());
    }
    const body: SessionIDResponse = await response.json();
    setsessionID(body.sessionID);
  };


  // GET request to obtain JSON object containing questions.
  const getQuestionsObject = async () => {
    let response;
    try {
      response = await fetch("/api/questions"); // Specified the api endpoint for returning a questions object
    } catch (err) {
      return setserverError(err);
    }
    if (!(response.ok && response.status >= 200 && response.status < 300)) {
      return setserverError(response.toString());
    }
    const body: QuestionResponse = await response.json();
    setquestions(body.questions);
  };


  const sendGAPageUpdate = (path?:string) => {
    let fullPath = window.location.pathname;
    if (path){
      fullPath = window.location.pathname+"/"+path;
    }
    ReactGA.set({ page: fullPath });
    ReactGA.pageview(fullPath);
  };


  // ON PAGE LOAD:
  useEffect(() => {
    ReactGA.initialize('UA-191723436-1');
    getSessionId();
    if (sessionID){ ReactGA.set({ userId: sessionID }); };
    getQuestionsObject();
    sendGAPageUpdate();
  }, []);


  // Called when continue button is pressed on a question or information page.
  const continueButtonPressed = (ans: string) => {
    // Store answer to question:
    currentQuestion.userResponse = ans;
    if (questionOrInfo) {
      // Continue button on question page has been clicked
      // Send answer to server:
      sendAnswer(currentQuestion); // TO DO - ERROR HANDLING FOR HTTP

      var infoToShow = currentQuestion.info[parseInt(ans) - 1];
      if (infoToShow === "") {
        // The response does not require further information
        nextScreen(ans);
      } else {
        // The response does require further information
        setquestionOrInfo(false);
        sendGAPageUpdate(currentQuestion.id+"/info");
      }
    } else {
      // Continue button on information page has been clicked
      setquestionOrInfo(true);
      nextScreen(ans);
    }
  };


  // Progress to next question as indicated by the nextQuestionIndex entry corresponding to the given answer to the current question
  const nextScreen = (ans: string) => {
    // ans = index of selected response (+1)
    var nextID = currentQuestion.nextQuestionIndex[parseInt(ans) - 1];
    setansweredQuestions(answeredQuestions.concat(currentQuestion));
    if (nextID !== -1) {
      setcurrentQuestion(questions.Qs[nextID]);
      sendGAPageUpdate(questions.Qs[nextID].id);
    } else {
      // No more questions to ask, show end page
      setstartMiddleEnd("end");
      sendGAPageUpdate("finish");
    }
  };


  // Go back to the previous question, or previous page as appropriate
  const PreviousQuestion = () => {
    let originalQ = currentQuestion.id + " question";
    let newScreen;
    if (!questionOrInfo) {
      // From info page, go back to showing the corresponding question
      setquestionOrInfo(true);
      sendGAPageUpdate(currentQuestion.id);
      originalQ = currentQuestion.id + " info";
      newScreen = currentQuestion.id + " response selection";
    } else if (answeredQuestions.length === 0) {
      // If no questions answered, show welcome screen
      setstartMiddleEnd("start");
      sendGAPageUpdate(window.location.pathname);
      newScreen = "welcome screen";
    } else {
      
      sendGAPageUpdate(answeredQuestions[answeredQuestions.length - 1].id);
      setcurrentQuestion(answeredQuestions.pop()!);
      newScreen = currentQuestion.id;
    }
    ReactGA.event({
      category: "Back Button Click",
      action: "User clicked 'back' from " + originalQ + " to " + newScreen + ".",
    });
  };


  // Called when the user selects the appropriate journey for them (referred to in code as "participant" or "family")
  const selectUserRole = (roleIsFamily: boolean) => {
    let nextID: number = questions.initialParticipantQ;
    if (roleIsFamily) {
      nextID = questions.initialFamilyQ;
    }
    setcurrentQuestion(questions.Qs[nextID]);
    sendGAPageUpdate(questions.Qs[nextID].id);
    setstartMiddleEnd("middle");
  };


  // Displays the appropriate content page
  const screenToDisplay = () => {
    if (startMiddleEnd === "start") {
      if (window.location.pathname.includes("/family")){
        return (
          <WelcomeScreenFamily
            selectUserRole={() => selectUserRole(true)}
          />
        );
      }
      return (
        <WelcomeScreenParticipant
          selectUserRole={() => selectUserRole(false)}
        />
      );
    }

    if (startMiddleEnd === "middle") {
      // Show error page if unable to retrieve necessary data from server
      if (currentQuestion.id === "Error" || sessionID === undefined) {
        return <ConnectionErrorScreen />;
      }
      var progress =
        answeredQuestions.length /
        (answeredQuestions.length + currentQuestion.longestPath);
      if (questionOrInfo) {
        // Question screen currently displayed, with the information required passed as props
        return (
          <QuestionScreen
            progressPercentage={100 * progress}
            questionText={currentQuestion.text}
            questionResponses={currentQuestion.options}
            nextScreen={(ans) => continueButtonPressed(ans)}
            previousQuestion={() => PreviousQuestion()}
          />
        );
      } else {
        // Information screen currently displayed, with the information required passed as props
        progress =
          currentQuestion.nextQuestionIndex[
            parseInt(currentQuestion.userResponse!) - 1
          ] === -1
            ? 1
            : (answeredQuestions.length + 1) /
              (answeredQuestions.length + currentQuestion.longestPath);
        return (
          <InformationScreen
            progressPercentage={100 * progress}
            nextScreen={() =>
              continueButtonPressed(currentQuestion.userResponse!)
            }
            previousQuestion={() => PreviousQuestion()}
            informationText={
              currentQuestion.info[parseInt(currentQuestion.userResponse!) - 1]
            }
          />
        );
      }
    }

    if (startMiddleEnd === "end") {
      return <FinishedScreen />;
    }
  };


  // Container for all pages displayed, includes header, footer and relevant div container classes
  return (
    <div>
      <Header />
      <div className="nhsuk-width-container">
        <main className="nhsuk-main-wrapper" id="maincontent" role="main">
          {screenToDisplay()}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default App;
