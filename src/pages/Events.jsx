import React, { useState, useEffect } from "react";
import { AIRTABLE_URL_BASE } from "../airtableDataFetchingUtils";

export function Events() {
  const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
  const [upcomingEventsData, setUpcomingEventsData] = useState([]);

  const fetchUpcomingEventsData = () => {
    fetch(
      `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
        // Get events after today
        `&filterByFormula=IS_AFTER({Start Time}, NOW())` +
        // Get fields for upcoming events dashboard
        `&fields=Start Time` + // Day, Time
        `&fields=Pickup Address` + // Main Location
        `&fields=Only Distributor Count` + // Packers, Total Participants
        `&fields=Only Driver Count` + // Drivers, Total Participants
        `&fields=Driver and Distributor Count`, // Packers, Drivers, Total Participants

      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
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

  const optionsDay = { weekday: "long", month: "long", day: "numeric" };
  const optionsTime = { hour: "numeric", minute: "numeric", hour12: true };

  const getOrdinal = function (d) {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const upcomingEvents = upcomingEventsData.map((event) => ({
    day:
      new Date(event.fields["Start Time"]).toLocaleDateString(
        "en-US",
        optionsDay
      ) + getOrdinal(new Date(event.fields["Start Time"]).getDate()), // start day in Weekday, Month Day format
    time: new Date(event.fields["Start Time"]).toLocaleString(
      "en-US",
      optionsTime
    ), // start time in HH:MM AM/PM format
    mainLocation: event.fields["Pickup Address"][0],
    numDrivers:
      event.fields["Only Distributor Count"] +
      event.fields["Driver and Distributor Count"] +
      "/30", // sum of only packers and packers who are also drivers
    numPackers:
      event.fields["Only Driver Count"] +
      event.fields["Driver and Distributor Count"], // sum of only drivers and drivers who are also packers
    numtotalParticipants:
      event.fields["Only Distributor Count"] +
      event.fields["Only Driver Count"] +
      event.fields["Driver and Distributor Count"],
  }));

  return (
    <div>
      {upcomingEventsData.length > 0 ? (
        upcomingEvents.map((event) => (
          <div>
            <p>Day: {event.day}</p>
            <p>Time: {event.time}</p>
            <p>Main Location: {event.mainLocation}</p>
            <p>Total Participants: {event.numtotalParticipants}</p>
            <p>Drivers: {event.numDrivers}</p>
            <p>Packers: {event.numPackers}</p>
            <br />
          </div>
        ))
      ) : (
        <p>Fetching Event Data...</p>
      )}
    </div>
  );
}
