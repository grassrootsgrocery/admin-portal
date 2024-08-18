import { EventCard } from "./EventCard";
import { Loading } from "../../components/Loading";
import { Navbar } from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useFutureEvents } from "../eventHooks";
import { toastNotify } from "../../utils/ui";
import { useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import magnifyingGlass from "../../assets/magnifying-glass-3-48.png";

const newEventLink =
  "https://airtable.com/shrETAYONKTJMVTnZ?prefill_Supplier=Rap+4+Bronx&prefill_Start+Time=01/01/2023+09:00am&prefill_End+Time=01/01/2023+01:00pm&prefill_First+Driving+Slot+Start+Time=01/01/2023+10:30am&prefill_How+long+should+each+Driver+Time+Slot+be?=0:15&prefill_Max+Count+of+Drivers+Per+Slot=30&prefill_How+long+should+the+Logistics+slot+be?=1:30&prefill_Maximum+number+of+drivers+needed+for+this+event+(usually+30)?=30&prefill_Max+Count+of+Distributors+Per+Slot=30";

export function Events() {
  const { token, setToken } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const futureEventsQuery = useFutureEvents();

  const filteredEvents = useMemo(() => {
    return (
      futureEventsQuery.data?.filter((event) =>
        `${event.id} ${event.dateDisplay} ${event.mainLocation}`
          .toLowerCase()
          .includes(debouncedSearchValue.toLowerCase())
      ) || []
    );
  }, [debouncedSearchValue, futureEventsQuery.data]);

  if (!token) {
    return <Navigate to="/" />;
  }

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
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <button
                className="h-10 w-10 rounded-full bg-pumpkinOrange text-3xl font-semibold text-white sm:h-12 sm:w-12 lg:h-auto lg:w-auto lg:py-3 lg:px-5 lg:text-xl lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen"
                type="button"
                onClick={() => setShowSearch(!showSearch)}
              >
                <img src={magnifyingGlass} alt="Search" className="h-6 w-6" />
              </button>
              {showSearch && (
                <div className="relative ml-2 flex h-10 items-center rounded-md p-1">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="ml-2 h-10 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-newLeafGreen focus:outline-none focus:ring-newLeafGreen"
                    placeholder="Search events"
                  />
                </div>
              )}
            </div>
            <a href={newEventLink} target="_blank" rel="noopener noreferrer">
              <button
                className="h-10 w-10 rounded-full bg-pumpkinOrange text-3xl font-semibold text-white sm:h-12 sm:w-12 lg:h-auto lg:w-auto lg:py-3 lg:px-5 lg:text-xl lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:after:content-['_Add_Saturday_Event'] lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen"
                type="button"
              >
                +
              </button>
            </a>
          </div>
        </div>

        <div className="h-5" />

        <div className="h-5" />
        <ul className="flex h-0 grow flex-col gap-2 overflow-auto pr-2 sm:gap-7 md:pr-4">
          {filteredEvents.map((event) => {
            return (
              <EventCard
                key={event.id}
                eventId={event.id}
                date={event.dateDisplay}
                time={event.time}
                location={event.mainLocation}
                participants={event.numTotalParticipants}
                drivers={event.numDrivers}
                packers={event.numPackers}
              />
            );
          })}
        </ul>
      </div>
    </>
  );
}
