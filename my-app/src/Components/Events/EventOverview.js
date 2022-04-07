import React from 'react';
import "./EventOverview.css";

function EventOverview() {
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
        <div className="graphic">Graphic</div>
      </div>
    </div>
  )
}

export default EventOverview;