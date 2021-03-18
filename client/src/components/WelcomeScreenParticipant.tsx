import MainButton from "./MainButton";


// Define the types of the necessary props (properties assigned to this component by its parent component):
interface welcomeProps {
  selectUserRole(): void; // Function to call when user selects the correct journey.
}


function WelcomeScreenParticipant(props:welcomeProps) {
  return(
    <div className="nhsuk-grid-row">
      <div className="nhsuk-grid-column-two-thirds">

        <h1>
          NHS Breast Screening Awareness App
        </h1>

        <p className="nhsuk-lede-text">
          This app aims to help you understand more about NHS breast screening and how it can help save lives from breast cancer.
        </p>

        <hr />

        <h2>
          Who can use this app?
        </h2>

        <p>To use this app, you need:</p>

        <p>- To have breasts</p>
        <p>- To be aged between 50 and 71</p>

        <MainButton text="Start the NHS Breast Screening App" onClick={()=>props.selectUserRole()}/>

        <hr />

      </div>
    </div>
  );
}

export default WelcomeScreenParticipant;