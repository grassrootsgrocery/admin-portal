import { useQuery } from "react-query";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

const futureEventsUrl =
  `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
  // Get events after today
  `&filterByFormula=IS_AFTER({Start Time}, NOW())` +
  // Get fields for upcoming events dashboard
  `&fields=Start Time` + // Day, Time
  `&fields=Pickup Address` + // Main Location
  `&fields=Only Distributor Count` + // Packers, Total Participants
  `&fields=Only Driver Count` + // Drivers, Total Participants
  `&fields=Driver and Distributor Count`; // Packers, Drivers, Total Participants

export function Events() {
  const {
    data: futureEvents,
    isLoading: futureEventsLoading,
    error: futureEventsError,
  } = useQuery(["fetchFutureEvents"], () => fetchAirtableData(futureEventsUrl));

  if (futureEventsLoading) {
    return <div>Loading...</div>;
  }
  if (futureEventsError) {
    console.log(futureEventsError);
    return <div>Error...</div>;
  }

  const optionsDay = { weekday: "long", month: "long", day: "numeric" };
  const optionsTime = { hour: "numeric", minute: "numeric", hour12: true };

  const getOrdinal = function (d) {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const upcomingEvents = futureEvents.records.map((event) => ({
    id: event.id,
    day:
      new Date(event.fields["Start Time"]).toLocaleDateString(
        "en-US",
        optionsDay
      ) + getOrdinal(new Date(event.fields["Start Time"]).getDate()), // start day in Weekday, Month Day format
    time: new Date(event.fields["Start Time"]).toLocaleString(
      "en-US",
      optionsTime
    ), // start time in HH:MM AM/PM format
    mainLocation: event.fields["Pickup Address"][0],
    numDrivers:
      event.fields["Only Distributor Count"] +
      event.fields["Driver and Distributor Count"] +
      "/30", // sum of only packers and packers who are also drivers
    numPackers:
      event.fields["Only Driver Count"] +
      event.fields["Driver and Distributor Count"], // sum of only drivers and drivers who are also packers
    numtotalParticipants:
      event.fields["Only Distributor Count"] +
      event.fields["Only Driver Count"] +
      event.fields["Driver and Distributor Count"],
  }));

  return (
    <div>
      {upcomingEvents.map((event) => (
        <div key={event.id}>
          <p>Day: {event.day}</p>
          <p>Time: {event.time}</p>
          <p>Main Location: {event.mainLocation}</p>
          <p>Total Participants: {event.numtotalParticipants}</p>
          <p>Drivers: {event.numDrivers}</p>
          <p>Packers: {event.numPackers}</p>
          <br />
        </div>
      ))}
    </div>
  );
}
