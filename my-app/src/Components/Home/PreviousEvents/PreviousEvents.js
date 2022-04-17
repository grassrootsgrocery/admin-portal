import React, { useState } from "react";
import "./Prev.css";
import { Link } from 'react-router-dom';

function Event(props) {
  return (
    <div className="event">
      <div className="left_col">
        <div className="date">
          <p> {props.date} </p>
        </div>
        <div className="group">
          <p>Volunteer Group</p>
          <p>
            <span className="group_name">{props.group}</span>
          </p>
        </div>
        <div className="pickup">
          <p>Pickup Location</p>
          <p>
            <span className="pickup_name">{props.pickup}</span>
          </p>
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
            <span className="needed_background"><span className="driver_amount">{props.total_drivers}</span> Total of {props.needed_drivers} Needed</span>
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
        <p>Previous Events</p>
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
      <Link className="see_more" to="/">See more</Link>
    </div>
  );
}

export default PreviousEvents;
