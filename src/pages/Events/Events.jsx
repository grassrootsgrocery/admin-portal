import Navbar from "../Navbar/Navbar";
import EventCard from "./EventCard";
import "./Events.css";

export function Events() {
  const events = [
    {
      date: "Saturday, March 23rd",
      time: "9:00 am",
      location: "1957 Turnbull Ave",
      participants: 34,
      drivers: "17/30",
      packers: 17,
    },
    {
      date: "Saturday, March 23rd",
      time: "9:00 am",
      location: "1957 Turnbull Ave",
      participants: 34,
      drivers: "17/30",
      packers: 17,
    },
    {
      date: "Saturday, March 23rd",
      time: "9:00 am",
      location: "1957 Turnbull Ave",
      participants: 34,
      drivers: "17/30",
      packers: 17,
    },
    {
      date: "Saturday, March 23rd",
      time: "9:00 am",
      location: "1957 Turnbull Ave",
      participants: 34,
      drivers: "17/30",
      packers: 17,
    },
  ].map((event) => (
    <EventCard
      date={event.date}
      time={event.time}
      location={event.location}
      participants={event.participants}
      drivers={event.drivers}
      packers={event.packers}
    />
  ));

  return (
    <div>
      <Navbar />
      <div class="events-container">
        <div class="top-row">
          <div class="events-label">Upcoming Events</div>
          <button class="add-button" type="button">
            + Add Saturday Event
          </button>
        </div>

        {events}
      </div>
      <footer>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
      </footer>
    </div>
  );
}
