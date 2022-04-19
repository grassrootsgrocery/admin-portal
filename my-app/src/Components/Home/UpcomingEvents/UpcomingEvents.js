import React, { useState } from 'react';
import './upcomingEvents.css';
import { Link } from 'react-router-dom';

// Upcoming event has component like day, participants, drivers, volunteers, location, volunteer group, people needed
// Should make a stateful list of upcoming events that shows maybe the first 2-3 elements on the list
// Find a way to put a box around each event listing maybe just make a div arround it and find a way to format it
// See more button when pressed can be a function that just shows more of the state list
function Event(props) {
  return(
  <>
    <div class="eventInfo">
      <div class="upcomingDate"><p> <b>{props.date}</b></p></div>
      <div class = "primaryInfoDiv"> 
        <div class = "primaryInfoSection">  Volunteer Group <br/> <b>{props.group}</b></div>
        <div class = "primaryInfoSection"> Pickup Location <br/> <b>{props.location}</b></div>
        <div class = "primaryInfoSection"> Drivers Needed <br/> <b>{props.needed}</b></div>
      </div>
      <div className="upcomingAttributes">
        <div className="upcomingCount">
            <p className="upcomingCountText">Drivers</p>
            <p className="upcomingCountValue">{props.drivers}</p>
        </div>
        <div className="upcomingCount">
          <p className="upcomingCountText">Volunteers</p>
          <p className="upcomingCountValue">{props.volunteers}</p>
        </div>
      </div>
    </div>
    <br/>
  </>
  )
}
function UpcomingEvents() {
  const [events, setState] = useState([{date:"Wednesday, March 23rd", group:"Hack4Impact", location:"9 Million Reasons", needed:30, drivers:10, volunteers: 7},
{date:"Sunday, April 3rd", group:"Hack4Impact", location:"Rap 4 Bronx", needed:6, drivers:4, volunteers: 2}])
  return (
    <>
    <div id="upcomingEvents">
      <div class="upcomingEventsHeader"><p><b>Upcoming Events</b></p></div>

      {events.map(event => <Event date={event.date} group={event.group} location={event.location} 
      needed={event.needed} drivers={event.drivers} volunteers={event.volunteers} />)}
      <Link className="upcoming_see_more" to="/">See More</Link>
    </div>
    </>
  )
}

export default UpcomingEvents;
