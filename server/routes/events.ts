import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "./airtableUtils";
import { fetch } from "./nodeFetch";

//Types
import { AirtableResponse, Record, Event, ProcessedEvent } from "../types";
import { INTERNAL_SERVER_ERROR, OK } from "../statusCodes";

const router = express.Router();

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

  const eventDate = new Date(event.fields["Start Time"]);

  return {
    id: event.id,
    date: eventDate,
    dateDisplay:
      eventDate.toLocaleDateString("en-US", optionsDay) +
      getOrdinal(new Date(event.fields["Start Time"]).getDate()), // start day in Weekday, Month Day format

    time: eventDate.toLocaleString("en-US", optionsTime), // start time in HH:MM AM/PM format

    mainLocation: event.fields["Pickup Address"][0], // event pickup location

    numDrivers: event.fields["Total Count of Drivers for Event"], // number of total drivers for event

    numPackers: event.fields["Total Count of Distributors for Event"], // number of total packers for event

    numtotalParticipants: event.fields["Total Count of Volunteers for Event"], // number of total participants for event

    numSpecialGroups: 0, // number of associated special groups

    numOnlyDrivers: 0, // number of only drvers for events

    numOnlyPackers: 0, // number of only packers for events

    numBothDriversAndPackers: 0, // number of both drivers and packers

    scheduledSlots: event.fields["📅 Scheduled Slots"],
  };
}

function processSpecialEventsData(
  event: ProcessedEvent,
  specialEvents: Record<Event>[]
): ProcessedEvent {
  specialEvents.forEach((specialEvent) =>
    processSpecialEventData(event, specialEvent)
  );
  return event;
}

function processSpecialEventData(
  event: ProcessedEvent,
  specialEvent: Record<Event>
) {
  event.numSpecialGroups += 1;
  event.numDrivers += specialEvent.fields["Total Count of Drivers for Event"];
  event.numPackers +=
    specialEvent.fields["Total Count of Distributors for Event"];
  event.numtotalParticipants +=
    specialEvent.fields["Total Count of Volunteers for Event"];
  event.scheduledSlots = event.scheduledSlots.concat(
    specialEvent.fields["📅 Scheduled Slots"]
  );
}

function processPackerAndDriverCounts(event: ProcessedEvent) {
  event.numOnlyDrivers = event.numtotalParticipants - event.numPackers;
  event.numOnlyPackers = event.numtotalParticipants - event.numDrivers;
  event.numBothDriversAndPackers =
    event.numPackers - (event.numtotalParticipants - event.numDrivers);
}

/**
 * @description Get all upcoming events.
 * @route  GET /api/events/
 * @access
 */
router.route("/api/events").get(
  asyncHandler(async (req: Request, res: Response) => {
    console.log("GET /api/events");
    const url =
      `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
      // Get events after today
      `&filterByFormula=IS_AFTER({Start Time}, NOW())` +
      // Get fields for upcoming events dashboard
      `&fields=Start Time` + // Day, Time
      `&fields=Pickup Address` + // Main Location
      `&fields=Total Count of Distributors for Event` + // Packers
      `&fields=Total Count of Drivers for Event` + // Drivers
      `&fields=Total Count of Volunteers for Event` + // Total Participants
      `&fields=Special Event` + // isSpecialEvent
      `&fields=📅 Scheduled Slots`; //Scheduled slots -> list of participants for event

    try {
      const resp = await fetch(url, {
        headers: {
          method: "GET",
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      });
      const futureEventsData = (await resp.json()) as AirtableResponse<Event>;
      let futureEvents: ProcessedEvent[] = [];
      let generalEvents = futureEventsData.records.filter(
        (event) => !event.fields["Special Event"]
      );
      let specialEvents = futureEventsData.records.filter(
        (event) => event.fields["Special Event"]
      );

      futureEvents = generalEvents.map((generalEvent) =>
        processSpecialEventsData(
          processGeneralEventData(generalEvent),
          specialEvents.filter(
            (specialEvent) =>
              specialEvent.fields["Pickup Address"][0] ==
                generalEvent.fields["Pickup Address"][0] &&
              specialEvent.fields["Start Time"] ==
                generalEvent.fields["Start Time"]
          )
        )
      );

      futureEvents.forEach((event) => processPackerAndDriverCounts(event));
      futureEvents.sort((a, b) => (a.date < b.date ? -1 : 1));
      res.status(OK).json(futureEvents);
    } catch (error) {
      console.error(error);
      res.status(INTERNAL_SERVER_ERROR);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Something went wrong on server.");
      }
    }
  })
);

export default router;
