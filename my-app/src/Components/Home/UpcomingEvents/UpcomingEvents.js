import React, {useState, useEffect} from 'react';
import Airtable from 'airtable';
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
        <div class = "primaryInfoSection"> Volunteer Group <br/> <b>{props.group}</b></div>
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
  const [events, setEvents] = useState([])

  const api_key = process.env.REACT_APP_API_KEY

  const getRecords = () => {
    base('🚛 Supplier Pickup Events').select({
      // Selecting the first 3 records in 🗄 All Records: Supplier Pickup Events:
      maxRecords: 2,
      view: "🗄 All Records: Supplier Pickup Events"
  }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
  
      records.forEach(function(record) {
          if(record.fields["Volunteer Group"]) {
            base('Volunteer Groups').find(record.fields["Volunteer Group"], function(err, group) {
              if (err) { console.error(err); return; }
              record.fields["Name of Group"] = group.fields["Name"];
            });
          } else {
            record.fields["Name of Group"] = "NA";
          }
          
      });
  
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
      setEvents(records);

      console.log(events[0].fields);
  
  }, function done(err) {
      if (err) { console.error(err); return; }
  });

  }

  const base = new Airtable({apiKey: api_key}).base('appCVXBrL5oceApI4');
  useEffect(() => {
    getRecords();
  }, [])
  return (

    <>
    <div id="upcomingEvents">
      <div class="upcomingEventsHeader"><p><b>Upcoming Events</b></p></div>

      {events.map(event => <Event date={event.fields["Date"]} group={event.fields["Name of Group"]} location={event.fields["Pickup Address (from 🥑 Supplier CRM)"]} 
      needed={event.fields["Count of Driving Slots Available"]} drivers={event.fields["Total Count of Drivers for Event"]}
       volunteers={event.volunteers} />)}
      <Link className="upcoming_see_more" to="/">See More</Link>
    </div>
    </>
  )
}

export default UpcomingEvents;
