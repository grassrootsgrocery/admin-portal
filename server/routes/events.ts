import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  AIRTABLE_ERROR_MESSAGE,
  AIRTABLE_URL_BASE,
} from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { OK } from "../httpUtils/statusCodes";
//Types
import { AirtableResponse, Record, Event, ProcessedEvent } from "../types";

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
  if (!event.fields["Start Time"]) {
    //Should never happen
    throw new Error("Event has no start time");
  }

  const eventDate = new Date(event.fields["Start Time"]);

  const numDrivers = event.fields["Total Count of Drivers for Event"] || 0; // number of total drivers for event
  const numPackers = event.fields["Total Count of Distributors for Event"] || 0; // number of total packers for event
  const numtotalParticipants =
    event.fields["Total Count of Volunteers for Event"] || 0; // number of total participants for event

  return {
    id: event.id,
    date: eventDate,
    dateDisplay:
      eventDate.toLocaleDateString("en-US", optionsDay) +
      getOrdinal(new Date(event.fields["Start Time"]).getDate()), // start day in Weekday, Month Day format

    time: eventDate.toLocaleString("en-US", optionsTime), // start time in HH:MM AM/PM format
    mainLocation: event.fields["Pickup Address"]
      ? event.fields["Pickup Address"][0]
      : "No address", // event pickup location
    numDrivers: numDrivers,
    numPackers: numPackers,
    numtotalParticipants: numtotalParticipants,
    numSpecialGroups: 0, // number of associated special groups
    numOnlyDrivers: numtotalParticipants - numPackers,
    numOnlyPackers: numtotalParticipants - numDrivers,
    numBothDriversAndPackers: numPackers + numDrivers - numtotalParticipants, // number of both drivers and packers
    scheduledSlots: event.fields["📅 Scheduled Slots"] || [],
    supplierId: event.fields.Supplier
      ? event.fields.Supplier[0]
      : "No supplier",
    allEventIds: [event.id],
  };
}

function getSpecialEventsForGeneralEvent(
  specialEvents: Record<Event>[],
  generalEvent: Record<Event>
) {
  const areEventsSame = (
    specialEvent: Record<Event>,
    generalEvent: Record<Event>
  ) => {
    if (
      !specialEvent.fields["Start Time"] ||
      !generalEvent.fields["Start Time"]
    ) {
      //Again, should never happen since we are filtering for this before calling this function
      throw new Error("Special event has no start time");
    }
    const sePickupAddress = specialEvent.fields["Pickup Address"]
      ? specialEvent.fields["Pickup Address"][0]
      : "";
    const gePickupAddress = generalEvent.fields["Pickup Address"]
      ? generalEvent.fields["Pickup Address"][0]
      : "";

    return (
      specialEvent.fields["Start Time"] === generalEvent.fields["Start Time"] &&
      sePickupAddress === gePickupAddress
    );
  };
  return specialEvents.filter((se) => areEventsSame(se, generalEvent));
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
      `&fields=Supplier` +
      `&fields=📅 Scheduled Slots`; //Scheduled slots -> list of participants for event

    const resp = await fetch(url, {
      headers: {
        method: "GET",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const futureEventsAirtableResp =
      (await resp.json()) as AirtableResponse<Event>;

    //An event is invalid if it has no start time
    let futureEventsData = futureEventsAirtableResp.records.filter(
      (event) => event.fields["Start Time"]
    );

    let generalEvents = futureEventsData.filter(
      (event) => !event.fields["Special Event"]
    );
    let specialEvents = futureEventsData.filter(
      (event) => event.fields["Special Event"]
    );
    // let futureEvents: ProcessedEvent[] = [];
    const futureEvents: ProcessedEvent[] = generalEvents.map((generalEvent) => {
      const specialEventsForThisGeneralEvent = getSpecialEventsForGeneralEvent(
        specialEvents,
        generalEvent
      );
      const processedGeneralEvent = processGeneralEventData(generalEvent);
      //Combine special events with general event
      for (const se of specialEventsForThisGeneralEvent) {
        processedGeneralEvent.numSpecialGroups += 1;
        processedGeneralEvent.numDrivers +=
          se.fields["Total Count of Drivers for Event"] || 0;
        processedGeneralEvent.numPackers +=
          se.fields["Total Count of Distributors for Event"] || 0;
        processedGeneralEvent.numtotalParticipants +=
          se.fields["Total Count of Volunteers for Event"] || 0;
        processedGeneralEvent.scheduledSlots.concat(
          se.fields["📅 Scheduled Slots"] || []
        );
        processedGeneralEvent.allEventIds.push(se.id);
      }
      return processedGeneralEvent;
    });
    futureEvents.sort((a, b) => (a.date < b.date ? -1 : 1));
    res.status(OK).json(futureEvents);
  })
);

export default router;
