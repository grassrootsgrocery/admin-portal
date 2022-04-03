import React from 'react';
import "./EventButton.css";

function EventButton() {
  return (
    <div className="event-container">
      <div className="event-title">
        <button className="print-button" /*onClick={}*/>
          <h2 className="print-text">Print Event</h2>
        </button>
      </div>
    </div>
  )
}

export default EventButton;