import { useFutureEvents } from "./eventHooks";
import { Navbar } from "../../components/Navbar/Navbar";
import { EventCard } from "./EventCard";

import "./Events.css";

export function Events() {
  const { futureEvents, futureEventsStatus, futureEventsError } =
    useFutureEvents();
  if (futureEventsStatus === "loading" || futureEventsStatus === "idle") {
    return <div>Loading...</div>;
  }
  if (futureEventsStatus === "error") {
    console.error(futureEventsError);
    return <div>Error...</div>;
  }
  //console.log("Logging futureEvents", futureEvents);
  return (
    <div className="events-container">
      <div className="top-row">
        <div className="upcoming-events-label">Upcoming Events</div>
        <button className="add-button" type="button">
          +
        </button>
      </div>
      <ul className="events-list-wrapper">
        {futureEvents.map((event) => {
          return (
            <EventCard
              eventId={event.id}
              date={event.day}
              time={event.time}
              location={event.mainLocation}
              participants={event.numtotalParticipants}
              drivers={event.numDrivers}
              packers={event.numPackers}
            />
          );
        })}
      </ul>
    </div>
  );
}
