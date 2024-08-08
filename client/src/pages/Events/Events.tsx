import { EventCard } from "./EventCard";
import { Loading } from "../../components/Loading";
import { Navbar } from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useFutureEvents } from "../eventHooks";
import { toastNotify } from "../../utils/ui";
import { processVolunteerCount } from "../ViewEvent/VolunteersTable";
import { useEffect, useState } from "react";
import { ProcessedScheduledSlot } from "../../types"; // Ensure this path is correct

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

interface EventWithVolunteersData extends Event {
  volunteers: ProcessedScheduledSlot[];
}

export function Events() {
  const { token, setToken } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }
  const futureEventsQuery = useFutureEvents();
  const [eventsData, setEventsData] = useState<EventWithVolunteersData[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);

  useEffect(() => {
    const fetchVolunteersForEvent = async (event: Event, token: string) => {
      const response = await fetch(
        `/api/volunteers/?scheduledSlotsIds=${event.scheduledSlots.join(",")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json() as Promise<ProcessedScheduledSlot[]>;
    };

    const fetchVolunteersForAllEvents = async () => {
      if (futureEventsQuery.status === "success" && futureEventsQuery.data) {
        try {
          const eventsWithVolunteers: EventWithVolunteersData[] =
            await Promise.all(
              futureEventsQuery.data
                .slice(0, displayCount)
                .map(async (event) => {
                  const volunteers = await fetchVolunteersForEvent(
                    event,
                    token
                  );
                  return {
                    ...event,
                    volunteers,
                  };
                })
            );
          setEventsData(eventsWithVolunteers);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      }
    };

    fetchVolunteersForAllEvents();
  }, [futureEventsQuery.status, futureEventsQuery.data, token, displayCount]);

  const loadMoreEvents = () => {
    setDisplayCount((prevCount) => prevCount + 10);
  };

  if (loading) {
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
          {eventsData.map((event) => (
            <EventCard
              key={event.id}
              eventId={event.id}
              date={event.dateDisplay}
              time={event.time}
              location={event.mainLocation}
              participants={event.numTotalParticipants}
              drivers={event.numDrivers}
              packers={event.numPackers}
              scheduledSlots={event.volunteers}
              guestCount={processVolunteerCount(event.volunteers)}
            />
          ))}
          {futureEventsQuery.data &&
            displayCount < futureEventsQuery.data.length && (
              <li className="mt-4 flex justify-center">
                <button
                  className="rounded-full bg-pumpkinOrange px-4 py-2 text-base font-semibold text-white md:px-10 md:py-3 lg:shadow-sm lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md lg:hover:shadow-newLeafGreen"
                  type="button"
                  onClick={loadMoreEvents}
                >
                  Load More
                </button>
              </li>
            )}
        </ul>
      </div>
    </>
  );
}
