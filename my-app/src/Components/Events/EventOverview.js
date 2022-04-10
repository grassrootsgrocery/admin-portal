import React from 'react';
import "./EventOverview.css";
import ProgressBar from 'react-bootstrap/ProgressBar';

function EventOverview() {
  // state variables

  return (
    <div className="event-container">
      <div className="event-title">
        <h1>Overview</h1>
      </div>
      <div className="overview">
        <div className="overview-info">
          <div className="info">
            Event Date<br/> 
            <b>Saturday, March 12th</b>
          </div>
          <div className="info">
            Group<br/> 
            <b>Hack4Impact</b>
          </div>
          <div className="info">
            Pickup Location<br/> 
            <b>Start Lighthouse</b>
          </div>
          <div className="info">
            Event Website Link<br/> 
            <b>www.motthavenfridge.com/event</b>
          </div>
        </div>
        <div className="graphic">
          Current Drivers <br/>
          <ProgressBar>
            <ProgressBar variant={"special"} label={15} now={60} key={1}/>
            <ProgressBar variant={"general"} label={5} now={20} key={2}/>
            <ProgressBar variant={"needed"} label={5} now={20} key={3}/>
          </ProgressBar>
        </div>
      </div>
    </div>
  )
}

export default EventOverview;