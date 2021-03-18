import ProgressBar from "./ProgressBar";

function FinishedScreen() {
  return(
    <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">

        <h1>
          NHS Breast Screening Awareness App
        </h1>

        <p className="nhsuk-lede-text">
          Thank you for taking the time to fill in this questionaire.
        </p>

        <hr />

        <p>
          Your answers have been saved and you can leave this page.
        </p>

        <ProgressBar percent={100}/>
        
      </div>
  </div>
  );
}

export default FinishedScreen;