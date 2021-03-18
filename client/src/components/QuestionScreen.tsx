import { useState, ChangeEvent } from "react";
import MainButton from "./MainButton";
import ProgressBar from "./ProgressBar";
import GoBackButton from "./GoBackButton";
import QuestionRadio from "./QuestionRadio";
import ReactGA from 'react-ga';


// Define the types of the necessary props (properties assigned to this component by its parent component):
interface QuestionScreenProps {

  nextScreen(ans:string): void; // Function to call to move to next question. Requires an "ans" string containg user's answer to this question
  
  previousQuestion(): void; // Function to call if back button is pressed
  
  questionText: string; // String containing question to be displayed.
  
  questionResponses: Array<string>; // Array containing the possible responses to the current question.
  
  progressPercentage: number; // Percentage to show in the progress bar.
}


function QuestionScreen(props: QuestionScreenProps) {

  // State (global) variable:
  const [selectedAnswer, setSelectedAnswer] = useState<string>("null");


  // Click handler for selecting response option
  const handleClick = (e: ChangeEvent<HTMLInputElement>) => {
    if (selectedAnswer !== "null"){ // If user has changed their initial response, send hit to analytics
      ReactGA.event({
        category: "Answer Changed",
        action: "User has selected a response that is different from their original selection.",
      });
    };
    setSelectedAnswer(e.currentTarget.value); // Update selected answer tracker
  }


  // Create radios (option selectors) for each response option for current question
  var i = 0;
  var radiosHTML:Array<JSX.Element> = props.questionResponses.map(function(item){
    i++;
    return (<QuestionRadio key={i.toString()} checked={selectedAnswer === i.toString() ? true:false} text={item} value={i.toString()} onChange={handleClick}/>);
  });


  return(
    <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">

        <GoBackButton onClick={()=>props.previousQuestion()} />

        <h1>
          NHS Breast Screening Awareness App
        </h1>

        <hr />

        <div className="nhsuk-form-group">

          <fieldset className="nhsuk-fieldset">

            <legend className="nhsuk-fieldset__legend nhsuk-fieldset__legend--l">
              <h1 className="nhsuk-fieldset__heading">
                {props.questionText}
              </h1>
            </legend>
        
            <div className="nhsuk-radios">
              {radiosHTML}
            </div>

          </fieldset>
        
        </div>

        <MainButton onClick={()=>{props.nextScreen(selectedAnswer); setSelectedAnswer("null")}} disabled={selectedAnswer === "null"} text="Continue"/>

        <hr />

        {<ProgressBar percent={props.progressPercentage}/>}

      </div>
    </div>
  );
}


export default QuestionScreen;
