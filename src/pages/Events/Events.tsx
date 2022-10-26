import { useFutureEvents } from "./eventHooks";
import { Link } from "react-router-dom";

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
    <div>
      {futureEvents.map((event) => (
        <div key={event.id}>
          <p>Day: {event.day}</p>
          <p>Time: {event.time}</p>
          <p>Main Location: {event.mainLocation}</p>
          <p>Total Participants: {event.numtotalParticipants}</p>
          <p>Drivers: {event.numDrivers}</p>
          <p>Packers: {event.numPackers}</p>
          <br />
          <Link to={`/events/${event.id}`}>
            <button>View Event</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
