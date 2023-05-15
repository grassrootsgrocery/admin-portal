import { EventCard } from "./EventCard";
import { Loading } from "../../components/Loading";
import { Navbar } from "../../components/Navbar";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useFutureEvents } from "../eventHooks";
export function Events() {
  const { token } = useAuth();
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
    console.error(futureEventsQuery.error);
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
        </div>
        <div className="h-5" />
        <ul className="flex h-0 grow flex-col gap-2 overflow-auto pr-2 sm:gap-7 md:pr-4">
          {futureEventsQuery.data.map((event) => {
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
    </>
  );
}
