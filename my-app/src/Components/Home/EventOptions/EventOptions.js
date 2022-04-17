import React from 'react';
import './EventOptions.css';
import EventDropdown from './EventDropdown';

function EventOptions() {
  const turnoutOptions = ["red", "orange", "blue"]
  const participantOptions = ["one", "two", "three"]

  return (
    <div className="event-options">
      <button className="create">Create New Event</button>
      <EventDropdown title="Event Turnout" items={turnoutOptions}/>
      <p className="options-event">for Hack4Impact, March 10th</p>
    </div>
  )
}

export default EventOptions;