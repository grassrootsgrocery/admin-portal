import { useQuery } from "react-query";
import { AirtableResponse, Record, Event, ProcessedEvent } from "../../types";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

function processEventData(event: Record<Event>): ProcessedEvent {
  const optionsDay = {
    weekday: "long",
    month: "long",
    day: "numeric",
  } as const;
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  } as const;

  const getOrdinal = function (d: number) {
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

  return {
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
    scheduledSlots: event.fields["📅 Scheduled Slots"],
  };
}

export function useFutureEvents() {
  const futureEventsUrl =
    `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
    // Get events after today
    `&filterByFormula=IS_AFTER({Start Time}, NOW())` +
    // Get fields for upcoming events dashboard
    `&fields=Start Time` + // Day, Time
    `&fields=Pickup Address` + // Main Location
    `&fields=Only Distributor Count` + // Packers, Total Participants
    `&fields=Only Driver Count` + // Drivers, Total Participants
    `&fields=Driver and Distributor Count` + // Packers, Drivers, Total Participants
    `&fields=📅 Scheduled Slots`; //Scheduled slots -> list of participants for event

  const {
    data: futureEventsData,
    status: futureEventsStatus,
    error: futureEventsError,
  } = useQuery(["fetchFutureEvents"], () =>
    fetchAirtableData<AirtableResponse<Event>>(futureEventsUrl)
  );

  let futureEvents: ProcessedEvent[] = [];
  if (futureEventsStatus === "success") {
    console.log(futureEventsData);
    futureEvents = futureEventsData.records.map((event) =>
      processEventData(event)
    );
  }

  return {
    futureEvents,
    futureEventsStatus,
    futureEventsError,
  };
}
