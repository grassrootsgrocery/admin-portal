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
      <div className="events-container">
        <div className="top-row">
          <div className="upcoming-events-label">Upcoming Events</div>
          <button className="add-button" type="button">
            + 
          </button>
        </div>
        <ul className="events-list-wrapper">
          {events}
        </ul>
      </div>
      <footer></footer>
    </div>
  );
}
