import { useFutureEvents } from "./eventHooks";
import { EventCard } from "./EventCard";

import { Loading } from "../../components/Loading";

import "./Events.css";

const newEventLink =
  "https://airtable.com/shrETAYONKTJMVTnZ?prefill_Supplier=Rap+4+Bronx&prefill_Start+Time=01/01/2023+09:00am&prefill_End+Time=01/01/2023+01:00pm&prefill_First+Driving+Slot+Start+Time=01/01/2023+10:30am&prefill_How+long+should+each+Driver+Time+Slot+be?=0:15&prefill_Max+Count+of+Drivers+Per+Slot=30&prefill_How+long+should+the+Logistics+slot+be?=1:30&prefill_Maximum+number+of+drivers+needed+for+this+event+(usually+30)?=30&prefill_Max+Count+of+Distributors+Per+Slot=30";

export function Events() {
  const { futureEvents, futureEventsStatus, futureEventsError } =
    useFutureEvents();
  if (futureEventsStatus === "loading" || futureEventsStatus === "idle") {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading />
      </div>
    );
  }
  if (futureEventsStatus === "error") {
    console.error(futureEventsError);
    return <div>Error...</div>;
  }
  //console.log("Logging futureEvents", futureEvents);
  return (
    <div className="grow border rounded px-8 flex flex-col">
      <div className="h-8" />
      <div className="flex justify-between items-center">
        <h1 className="md:text-4xl text-2xl font-semibold text-newLeafGreen">
          Upcoming Events
        </h1>
        <a href={newEventLink} target="_blank" rel="noopener noreferrer">
          <button
            className="
              rounded-full 
              px-4 py-2
              sm:px-6 sm:py-4 
              font-extrabold 
            bg-pumpkinOrange 
              shadow-md hover:shadow-lg 
            hover:shadow-newLeafGreen 
            shadow-newLeafGreen 
              hover:-translate-y-1 
              transition-all 
            text-white 
              lg:after:content-['_Add_Saturday_Event']
            "
            type="button"
          >
            +
          </button>
        </a>
      </div>
      <div className="h-5" />
      <ul className="flex flex-col gap-2 sm:gap-7 overflow-auto h-0 grow pr-1 md:pr-4">
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
