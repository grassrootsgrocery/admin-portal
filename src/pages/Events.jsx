import React, { useState, useEffect } from "react";


export function Events() {
  
  const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
  const [upcomingEventsData, setUpcomingEventsData] = useState([]);
  
  const fetchUpcomingEventsData = () => {
    fetch(
      `https://api.airtable.com/v0/app7zige4DRGqIaL2/%F0%9F%9A%9B%20Supplier%20Pickup%20Events?` + 
      
      // Get events after today
      `&filterByFormula=IS_AFTER({Start Time}, NOW())` +

      // Get fields for upcoming events dashboard
      `&fields=Start Time` +                  // Day, Time
      `&fields=Pickup Address` +              // Main Location
      `&fields=Only Distributor Count` +      // Packers, Total Participants
      `&fields=Only Driver Count` +           // Drivers, Total Participants
      `&fields=Driver and Distributor Count`, // Packers, Drivers, Total Participants

      {headers: {Authorization: `Bearer ${AIRTABLE_API_KEY}`}}
    )
      .then((resp) => resp.json())
      .then((data) => {
        setUpcomingEventsData(data.records);
        // console.log("Upcoming Events:");
        // console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchUpcomingEventsData();
  }, [AIRTABLE_API_KEY]);

  const upcomingEvents = upcomingEventsData.map(event => (
    {
      day: event.fields["Start Time"],      // TODO: need to get day in correct format
      time: event.fields["Start Time"],     // TODO : need to get time in correct format
      mainLocation: event.fields["Pickup Address"][0],
      numDrivers: event.fields["Only Distributor Count"] + event.fields["Driver and Distributor Count"],    // sum of only packers and packers who are also drivers
      numPackers: event.fields["Only Driver Count"] + event.fields["Driver and Distributor Count"],         // sum of only drivers and drivers who are also packers
      numtotalParticipants: event.fields["Only Distributor Count"] + event.fields["Only Driver Count"] + event.fields["Driver and Distributor Count"]
    }
  ));

  return (
    <div>
      {upcomingEventsData.length > 0 ? (
        upcomingEvents.map(event => (
          <div>
            <p>Day: {event.day}</p>
            <p>Time: {event.time}</p>
            <p>Main Location: {event.mainLocation}</p>
            <p>Total Participants: {event.numtotalParticipants}</p>
            <p>Drivers: {event.numDrivers}</p>
            <p>Packers: {event.numPackers}</p>
            <br/>
          </div>
        ))
      ) : (
        <p>Fetching Event Data...</p>
      )}
    </div>
  );
}
