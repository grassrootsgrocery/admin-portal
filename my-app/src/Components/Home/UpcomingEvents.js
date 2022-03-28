import React, { useState } from 'react';
import '../../upcomingEvents.css';

// Upcoming event has component like day, participants, drivers, volunteers, location, volunteer group, people needed
// Should make a stateful list of upcoming events that shows maybe the first 2-3 elements on the list
// Find a way to put a box around each event listing maybe just make a div arround it and find a way to format it
// See more button when pressed can be a function that just shows more of the state list
function Event(props) {
  return(
  <>
  <div class="eventInfo">
    <h2> {props.date}</h2>
      <div class = "primaryInfoSection">  <b>Volunteer Group</b> <br/> {props.group}</div>
      <div class = "primaryInfoSection"> <b>Pickup Location</b> <br/> {props.location}</div>
      <div class = "primaryInfoSection"> <b>Drivers Needed</b> <br/> {props.needed}</div>
      <div >Participants:</div>
      <div class="participantInfo">Drivers: {props.drivers} </div>
      <div class="participantInfo">Volunteers: {props.volunteers}</div>
  </div>
  </>
  )
}

function UpcomingEvents() {
  const [events, setState] = useState([{date:"Wednsday, March 23", group:"Hack4Impact", location:"Stamp", needed:30, drivers:10, volunteers: 5},
{date:"Wednsday, March 26", group:"UMD", location:"ESJ", needed:6, drivers:4, volunteers: 5}])
  return (
    <>
    <div id="upcomingEvents">
      <h1>Upcoming Events</h1>
      {/* <Event date="Wednesday, March 23" group="Hack4Impact" location="McDonald's" needed={30} drivers={10} volunteers={5} /> */}
      {events.map(event => <Event date={event.date} group={event.group} location={event.location} 
      needed={event.needed} drivers={event.drivers} volunteers={event.volunteers} />)}
    </div>
    </>
  )
}

export default UpcomingEvents;
