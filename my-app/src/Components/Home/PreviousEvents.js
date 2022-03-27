import React from 'react';
import "./Prev.css";

function PreviousEvents() {
  function addEvent(){

  }
  return (
    <div className="container"> 
      <div className="title">
        <h1>Previous Events</h1>
      </div>
      <div className="event_one">
        <div className="left_col">
          <div className="date">
            <p>March 10th, 2022</p>
          </div>
          <div className="group">
            <p>Volunteer Group</p>
            <h3>Hack4Impact</h3>
          </div>
          <div className="pickup">
            <p>Pickup Location</p>
            <h3>Start Lighthouse</h3>
          </div>
        </div>
        <div className="right_col">
          <div className="turnout">
            <p>Participant Turnout</p>
          </div>
          <div className="group_drivers">
            <p>8 Hack4Impact Drivers</p>
          </div>
          <div className="general_drivers">
            <p>17 General Drivers</p>
          </div>
          <div className="total_drivers">
            <p>25 Total of 25 Needed</p>
          </div>
        </div>
      </div>
      <div className="event_one">
        <div className="left_col">
          <div className="date">
            <p>February 24th, 2022</p>
          </div>
          <div className="group">
            <p>Volunteer Group</p>
            <h3>Hack4Impact</h3>
          </div>
          <div className="pickup">
            <p>Pickup Location</p>
            <h3>Start Lighthouse</h3>
          </div>
        </div>
        <div className="right_col">
          <div className="turnout">
            <p>Participant Turnout</p>
          </div>
          <div className="group_drivers">
            <p>8 Hack4Impact Drivers</p>
          </div>
          <div className="general_drivers">
            <p>17 General Drivers</p>
          </div>
          <div className="total_drivers">
            <p>25 Total of 25 Needed</p>
          </div>
        </div>
      </div>
      <button className="see_more">See More</button>
    </div>
  )
}

export default PreviousEvents;