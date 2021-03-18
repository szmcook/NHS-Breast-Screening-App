import ProgressBar from "./ProgressBar";
import MainButton from "./MainButton";
import GoBackButton from "./GoBackButton";
import ReactHtmlParser from 'react-html-parser';
import ReactGA from 'react-ga';


// Define the types of the necessary props (properties assigned to this component by its parent component):
interface InformationScreenProps {
  nextScreen(): void; // Function to call when "continue" button is clicked.
  previousQuestion(): void; // Function to call when "back" button is clicked.
  informationText: string; // The information to display. Can contain HTML (EG links) - will be parsed to display correctly.
  progressPercentage: number; // Percentage to show in the progress bar.
}


function InformationScreen(props: InformationScreenProps) {
  
  // Function to call when the information text has been clicked - sends an analysis hit for user interaction.
  const infoClicked = () => {
    ReactGA.event({ // Google Analytics event
      category: "Information Interaction",
      action: "User clicked within the information section, possibly following a link to further information.",
    });
  };


  return(
    <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">

      <GoBackButton onClick={()=>props.previousQuestion()} />

        <h1>
          NHS Breast Screening Awareness App
        </h1>

        <div className="nhsuk-lede-text" onClick={() => infoClicked()}>
          
          { ReactHtmlParser(props.informationText) }

        </div>

        <hr />

        <MainButton onClick={()=>{props.nextScreen()}} text="Continue"/>

        <hr />

        <ProgressBar percent={props.progressPercentage}/>
        
      </div>
  </div>
  );
}


export default InformationScreen;