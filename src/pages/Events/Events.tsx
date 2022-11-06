import { Link } from "react-router-dom";
import { useFutureEvents } from "./eventHooks";
import { Navbar } from "../../components/Navbar/Navbar";
import { EventCard } from "./EventCard";

import "./Events.css";

const newEventLink =
  "https://airtable.com/shrETAYONKTJMVTnZ?prefill_Supplier=Rap+4+Bronx&prefill_Start+Time=01/01/2023+09:00am&prefill_End+Time=01/01/2023+01:00pm&prefill_First+Driving+Slot+Start+Time=01/01/2023+10:30am&prefill_How+long+should+each+Driver+Time+Slot+be?=0:15&prefill_Max+Count+of+Drivers+Per+Slot=30&prefill_How+long+should+the+Logistics+slot+be?=1:30&prefill_Maximum+number+of+drivers+needed+for+this+event+(usually+30)?=30&prefill_Max+Count+of+Distributors+Per+Slot=30";

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
          <a href={newEventLink} target="_blank" rel="noopener noreferrer">
            <button className="add-button" type="button">
              +
            </button>
          </a>
      </div>
      <ul className="events-list-wrapper">
        {futureEvents.map((event) => {
          return (
            <EventCard
              eventId={event.id}
              date={event.dateDisplay}
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
