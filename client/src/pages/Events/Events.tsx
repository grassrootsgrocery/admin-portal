import { EventCard } from "./EventCard";
import { Loading } from "../../components/Loading";
import { Navbar } from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useFutureEvents, useVolunteersForEvent } from "../eventHooks";
import { toastNotify } from "../../utils/ui";
import { processVolunteerCount } from "../ViewEvent/VolunteersTable";

const newEventLink =
  "https://airtable.com/shrETAYONKTJMVTnZ?prefill_Supplier=Rap+4+Bronx&prefill_Start+Time=01/01/2023+09:00am&prefill_End+Time=01/01/2023+01:00pm&prefill_First+Driving+Slot+Start+Time=01/01/2023+10:30am&prefill_How+long+should+each+Driver+Time+Slot+be?=0:15&prefill_Max+Count+of+Drivers+Per+Slot=30&prefill_How+long+should+the+Logistics+slot+be?=1:30&prefill_Maximum+number+of+drivers+needed+for+this+event+(usually+30)?=30&prefill_Max+Count+of+Distributors+Per+Slot=30";

//made to avoid implicit any type errors
interface Event {
  id: string;
  dateDisplay: string;
  time: string;
  mainLocation: string;
  numTotalParticipants: number;
  numDrivers: number;
  numPackers: number;
  scheduledSlots: string[];
}

export function Events() {
  const { token, setToken } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }
  const futureEventsQuery = useFutureEvents();

  if (
    futureEventsQuery.status === "loading" ||
    futureEventsQuery.status === "idle"
  ) {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (futureEventsQuery.status === "error") {
    const error = futureEventsQuery.error;
    if (error instanceof Error && error.message.includes("token")) {
      setToken(null);
      localStorage.removeItem("token");
      toastNotify("Sorry, please login again");
      return <Navigate to="/" />;
    }
    console.error(error);
    return <div>Error...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex grow flex-col rounded border px-4 md:px-8">
        <div className="h-8" />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-newLeafGreen md:text-4xl">
            Upcoming Events
          </h1>
          <a href={newEventLink} target="_blank" rel="noopener noreferrer">
            <button
              className="h-10 w-10 rounded-full bg-pumpkinOrange text-3xl font-semibold text-white sm:h-12 sm:w-12 lg:h-auto lg:w-auto lg:py-3 lg:px-5 lg:text-xl lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:after:content-['_Add_Saturday_Event'] lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen"
              type="button"
            >
              +
            </button>
          </a>
        </div>
        <div className="h-5" />
        <ul className="flex h-0 grow flex-col gap-2 overflow-auto pr-2 sm:gap-7 md:pr-4">
          {futureEventsQuery.data.map((event: Event) => (
            <EventWithVolunteers key={event.id} event={event} />
          ))}
        </ul>
      </div>
    </>
  );
}

//made a component to conatin the fetching volunteers logic
//Circumvents an error occuring previously from the event card changes
interface EventWithVolunteersProps {
  event: Event;
}

const EventWithVolunteers: React.FC<EventWithVolunteersProps> = ({ event }) => {
  const { token, setToken } = useAuth();
  const scheduledSlotsQuery = useVolunteersForEvent({
    enabled: true,
    eventId: event.id,
    scheduledSlotIds: event.scheduledSlots,
  });

  if (
    scheduledSlotsQuery.status === "loading" ||
    scheduledSlotsQuery.status === "idle"
  ) {
    return (
      <div className="relative h-full" key={event.id}>
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }

  if (scheduledSlotsQuery.status === "error") {
    const error = scheduledSlotsQuery.error;
    if (error instanceof Error && error.message.includes("token")) {
      setToken(null);
      localStorage.removeItem("token");
      toastNotify("Sorry, please login again");
      return <Navigate to="/" />;
    }
    console.error(error);
    return <div key={event.id}>Error...</div>;
  }

  //ensured undefined cases are accounted for
  const scheduledSlots = scheduledSlotsQuery.data || [];
  const totalVolunteerCount = processVolunteerCount(scheduledSlots);

  return (
    <EventCard
      eventId={event.id}
      date={event.dateDisplay}
      time={event.time}
      location={event.mainLocation}
      participants={event.numTotalParticipants}
      drivers={event.numDrivers}
      packers={event.numPackers}
      scheduledSlots={scheduledSlots}
      guestCount={totalVolunteerCount}
    />
  );
};
