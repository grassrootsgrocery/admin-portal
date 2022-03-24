import React from 'react';
import './EventOptions.css';
import { Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import EventTurnout from './EventTurnout';

function EventOptions() {
  return (
    <div className="event-options">
      <button className="create">Create New Event</button>
      <button className="message">Message Volunteers</button>
      <Dropdown as={ButtonGroup}>
        <Button variant="success">Event Turnout</Button>

        <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <p className="options-event">for Hack4Impact, March 10th</p>
      <EventTurnout/>
      <p className="options-event">for Hack4Impact, March 10th</p>
    </div>
  )
}

export default EventOptions;