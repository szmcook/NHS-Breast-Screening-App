
function ConnectionErrorScreen() {
    return(
      <div className="nhsuk-grid-row">
        <div className="nhsuk-grid-column-two-thirds">
  
          <h1>
            NHS Breast Screening Awareness App
          </h1>
  
          <p className="nhsuk-lede-text">
            We're afraid an error has ocurred.
          </p>
  
          <hr />
  
          <p>
            We weren't able to connect to the question server.
          </p>
  
          <p>
            Please try refreshing the page, or try again later if the problem persists.
          </p>
          
        </div>
    </div>
    );
  }
  
  export default ConnectionErrorScreen;