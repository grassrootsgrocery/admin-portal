import { useQuery } from "react-query";
import { AirtableResponse, Record, Event, ProcessedEvent } from "../../types";
import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

// TODO: FIX MATH
// TODO: ADD OTHER NEW FIELDS  
function processGeneralEventData(event: Record<Event>): ProcessedEvent {
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
      event.fields["Total Count of Drivers for Event"],
      //+ "/30", // sum of only packers and packers who are also drivers
    
    numPackers:
      event.fields["Total Count of Distributors for Event"], // sum of only drivers and drivers who are also packers
    
    numtotalParticipants:
      event.fields["Total Count of Volunteers for Event"],
        
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
    `&fields=Total Count of Distributors for Event` + // Packers, Total Participants
    `&fields=Total Count of Drivers for Event` + // Drivers, Total Participants
    `&fields=Total Count of Volunteers for Event` + // Packers, Drivers, Total Participants
    `&fields=Special Event` + // isSpecialEvent 
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

    let generalEvents = futureEventsData.records.filter(event => !event.fields["Special Event"]);
    let specialEvents = futureEventsData.records.filter(event => event.fields["Special Event"]);

    // console.log("Start");
    futureEvents = generalEvents.map((generalEvent) => 
      processSpecialEventsData(processGeneralEventData(generalEvent), 
        specialEvents.filter((specialEvent) => 
          specialEvent.fields["Pickup Address"][0] == generalEvent.fields["Pickup Address"][0]
          && specialEvent.fields["Start Time"] == generalEvent.fields["Start Time"]
        )
      )
    );
  }

  return {
    futureEvents,
    futureEventsStatus,
    futureEventsError,
  };
}

function processSpecialEventsData(event: ProcessedEvent, specialEvents: Record<Event>[]): ProcessedEvent {
  specialEvents.forEach((specialEvent) => 
    processSpecialEventData(event, specialEvent),
  )
  // if (event.day == "Saturday, November 12th") {
  //   console.log("G: " + event.numDrivers);
  // }
  return event;
}

//TODO: ADD OTHER FIELDS
function processSpecialEventData(event: ProcessedEvent, specialEvent: Record<Event>) {
  // if (event.day == "Saturday, November 12th") {
  //   console.log("S: " + event.numDrivers + "+=" + specialEvent.fields["Total Count of Drivers for Event"]);
  // }

  event.numDrivers += specialEvent.fields["Total Count of Drivers for Event"],
  event.numPackers += specialEvent.fields["Total Count of Distributors for Event"],
  event.numtotalParticipants += specialEvent.fields["Total Count of Volunteers for Event"]
}

