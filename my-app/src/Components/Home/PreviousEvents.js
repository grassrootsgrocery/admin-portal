import React, { useState } from "react";
import "./Prev.css";

function Event(props) {
  return (
    <div className="event">
      <div className="left_col">
        <div className="date">
          <p> {props.date} </p>
        </div>
        <div className="group">
          <p>Volunteer Group</p>
          <h3>{props.group}</h3>
        </div>
        <div className="pickup">
          <p>Pickup Location</p>
          <h3>{props.pickup}</h3>
        </div>
      </div>
      <div className="right_col">
        <div className="turnout">
          <p>Participant Turnout</p>
        </div>
        <div className="group_drivers">
          <p>
            <span className="driver_amount">{props.group_drivers}</span> {props.group} Drivers
          </p>
        </div>
        <div className="general_drivers">
          <p>
            <span className="driver_amount">{props.general_drivers}</span> General Drivers
          </p>
        </div>
        <div className="total_drivers">
          <p>
            <span className="driver_amount">{props.total_drivers}</span> Total of {props.needed_drivers} Needed
          </p>
        </div>
      </div>
    </div>
  );
}
function PreviousEvents() {
  const [events, setState] = useState([
    {
      date: "March 10th, 2022",
      group: "Hack4Impact",
      pickup: "Start Lighthouse",
      group_drivers: 8,
      general_drivers: 17,
      total_drivers: 25,
      needed_drivers: 25
    },
    {
      date: "February 24th, 2022",
      group: "Hack4Impact",
      pickup: "Start Lighthouse",
      group_drivers: 8,
      general_drivers: 17,
      total_drivers: 25,
      needed_drivers: 25
    },
  ]);
  return (
    <div className="container">
      <div className="title">
        <h1>Previous Events</h1>
      </div>
      {events.map(e => (
        <Event
          date={e.date}
          group={e.group}
          pickup={e.pickup}
          group_drivers={e.group_drivers}
          general_drivers={e.general_drivers}
          total_drivers={e.total_drivers}
          needed_drivers={e.needed_drivers}
        />
      ))}
      <button className="see_more">See More</button>
    </div>
  );
}

export default PreviousEvents;
