import { useQuery } from "react-query";
//Types
import { ProcessedEvent } from "../../types";
//Components
import { EventCard } from "./EventCard";
import { Loading } from "../../components/Loading";

const newEventLink =
  "https://airtable.com/shrETAYONKTJMVTnZ?prefill_Supplier=Rap+4+Bronx&prefill_Start+Time=01/01/2023+09:00am&prefill_End+Time=01/01/2023+01:00pm&prefill_First+Driving+Slot+Start+Time=01/01/2023+10:30am&prefill_How+long+should+each+Driver+Time+Slot+be?=0:15&prefill_Max+Count+of+Drivers+Per+Slot=30&prefill_How+long+should+the+Logistics+slot+be?=1:30&prefill_Maximum+number+of+drivers+needed+for+this+event+(usually+30)?=30&prefill_Max+Count+of+Distributors+Per+Slot=30";

export function Events() {
  const {
    data: futureEvents,
    status: futureEventsStatus,
    error: futureEventsError,
  } = useQuery(["fetchFutureEvents"], async () => {
    const response = await fetch("/api/events");
    return response.json() as Promise<ProcessedEvent[]>;
  });

  if (futureEventsStatus === "loading" || futureEventsStatus === "idle") {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (futureEventsStatus === "error") {
    console.error(futureEventsError);
    return <div>Error...</div>;
  }

  console.log("Logging futureEvents", futureEvents);
  return (
    <div className="flex grow flex-col rounded border px-8">
      <div className="h-8" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-newLeafGreen md:text-4xl">
          Upcoming Events
        </h1>
        <a href={newEventLink} target="_blank" rel="noopener noreferrer">
          <button
            className="rounded-full bg-pumpkinOrange px-3 pb-2 text-3xl font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen sm:px-4 sm:pb-3 sm:pt-1 lg:py-3 lg:px-5 lg:text-xl lg:after:content-['_Add_Saturday_Event']"
            type="button"
          >
            +
          </button>
        </a>
      </div>
      <div className="h-5" />
      <ul className="flex h-0 grow flex-col gap-2 overflow-auto pr-1 sm:gap-7 md:pr-4">
        {futureEvents.map((event) => {
          return (
            <EventCard
              key={event.id}
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
