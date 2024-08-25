import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { Request, Response } from "express";
import {
  airtableGET,
  AIRTABLE_ERROR_MESSAGE,
  AIRTABLE_URL_BASE,
} from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import {
  INTERNAL_SERVER_ERROR,
  OK,
  BAD_REQUEST,
} from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  AirtableRecord,
  Event,
  ProcessedEvent,
  SpecialEvent,
  ProcessedSpecialEvent,
} from "../types";
//Logger
import { logger } from "../loggerUtils/logger";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

let today = "TODAY()";
if (process.env.NODE_ENV === "development" && process.env.TODAY) {
  today = `"${process.env.TODAY}"`;
}

function processGeneralEventData(event: AirtableRecord<Event>): ProcessedEvent {
  const optionsDay = {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  } as const;
  const optionsYear = {
    year: "numeric",
    timeZone: "America/New_York",
  } as const;
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "America/New_York",
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

  const numOnlyDrivers =
    event.fields["Only Driver Count Including Unconfirmed"] || 0; // number of only drivers for event

  const numOnlyPackers =
    event.fields["Only Distributor Count Including Unconfirmed"] || 0; // number of only packers for event

  const numTotalParticipants =
    event.fields["Total Count of Volunteers for Event"] || 0; // number of total participants for event

  const numDriversAndPackers =
    event.fields["Driver and Distributor Count Including Unconfirmed"] || 0; // all driver and distr participants for event

  return {
    id: event.id,
    date: eventDate,
    dateDisplay: 
      eventDate.toLocaleDateString("en-US", optionsDay) +
      getOrdinal(new Date(event.fields["Start Time"]).getDate()) + ", " +
      eventDate.toLocaleDateString("en-US", optionsYear), // start day in Weekday, Month Day, Year format

    time: eventDate.toLocaleString("en-US", optionsTime), // start time in HH:MM AM/PM format
    mainLocation: event.fields["Pickup Address"]
      ? event.fields["Pickup Address"][0]
      : "No address", // event pickup location
    numDrivers: numDrivers,
    numPackers: numPackers,
    numTotalParticipants: numTotalParticipants,
    numSpecialGroups: 0, // number of associated special groups
    numOnlyDrivers: numOnlyDrivers,
    numOnlyPackers: numOnlyPackers,
    numBothDriversAndPackers: numDriversAndPackers, // number of both drivers and packers
    scheduledSlots: event.fields["📅 Scheduled Slots"] || [],
    supplierId: event.fields.Supplier
      ? event.fields.Supplier[0]
      : "No supplier",
    allEventIds: [event.id],
  };
}

function getSpecialEventsForGeneralEvent(
  specialEvents: AirtableRecord<Event>[],
  generalEvent: AirtableRecord<Event>
) {
  const areEventsSame = (
    specialEvent: AirtableRecord<Event>,
    generalEvent: AirtableRecord<Event>
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
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    logger.info("GET /api/events");
    const url =
      `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
      // Get all events that are after yesterday. We want it to be after yesterday because we want the event to still show up on the day of the event
      `&filterByFormula=IS_AFTER({Start Time}, (DATEADD(${today}, -1, 'days')))` +
      // Get fields for upcoming events dashboard
      `&fields=Start Time` + // Day, Time
      `&fields=Pickup Address` + // Main Location
      `&fields=Total Count of Distributors for Event` + // Packers
      `&fields=Total Count of Drivers for Event` + // Drivers
      `&fields=Only Driver Count` + // People only driving
      `&fields=Only Distributor Count Including Unconfirmed` + // People only packing including unconfirmed
      `&fields=Only Driver Count Including Unconfirmed` + // People only driving including unconfirmed
      `&fields=Driver and Distributor Count Including Unconfirmed` + // People both driving and packing including unconfirmed
      `&fields=Only Distributor Count` + // People only packing
      `&fields=Driver and Distributor Count` + // People both driving and packing
      `&fields=Total Count of Volunteers for Event` + // Total Participants
      `&fields=Special Event` + // isSpecialEvent
      `&fields=Supplier` +
      `&fields=📅 Scheduled Slots`; //Scheduled slots -> list of participants for event

    const futureEventsAirtableResp = await airtableGET<Event>({ url: url });

    if (futureEventsAirtableResp.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: futureEventsAirtableResp.error,
      });

      return;
    }

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
    const futureEvents: ProcessedEvent[] = generalEvents.map((generalEvent) => {
      const specialEventsForThisGeneralEvent = getSpecialEventsForGeneralEvent(
        specialEvents,
        generalEvent
      );
      const processedGeneralEvent = processGeneralEventData(generalEvent);
      //Combine special events with general event
      for (const se of specialEventsForThisGeneralEvent) {
        processedGeneralEvent.numSpecialGroups += 1;
        processedGeneralEvent.numOnlyPackers +=
          se.fields["Only Distributor Count"] || 0;
        processedGeneralEvent.numOnlyDrivers +=
          se.fields["Only Driver Count"] || 0;
        processedGeneralEvent.numDrivers +=
          se.fields["Total Count of Drivers for Event"] || 0;
        processedGeneralEvent.numPackers +=
          se.fields["Total Count of Distributors for Event"] || 0;
        processedGeneralEvent.numTotalParticipants +=
          se.fields["Total Count of Volunteers for Event"] || 0;
        processedGeneralEvent.numBothDriversAndPackers +=
          se.fields["Driver and Distributor Count"] || 0;
        processedGeneralEvent.scheduledSlots =
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

/**
 * @description Get event specific special group sign up links
 * @route  GET /api/events/view-event-special-groups
 * @access
 */
router.route("/api/events/view-event-special-groups/").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const { eventIds } = req.query;
    logger.info(
      `GET /api/events/view-event-special-groups/?eventIds=${eventIds}`
    );

    const isValidRequest = typeof eventIds === "string";

    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'eventIds' as a query param of type 'string'."
      );
    }

    const url =
      `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
      // get special events that are associated with the specific event
      `filterByFormula=AND(SEARCH(RECORD_ID(), "${eventIds}") != "",` +
      `{Special Event})` + //  get events that are special events
      `&fields=Volunteer Group` + // Special Group
      `&fields=Fillout Special Event Signup`; // Special Event Link

    const specialEvents = await airtableGET<SpecialEvent>({ url: url });

    if (specialEvents.kind === "error") {
      res.status(INTERNAL_SERVER_ERROR).json({
        message: specialEvents.error,
      });

      return;
    }

    let processedSpecialEvents: ProcessedSpecialEvent[] =
      specialEvents.records.map((specialEvent) => {
        return {
          id: specialEvent.id,
          specialGroupId: specialEvent.fields["Volunteer Group"]
            ? specialEvent.fields["Volunteer Group"][0]
            : "NO ID",
          eventSignUpLink:
            specialEvent.fields["Fillout Special Event Signup"] ||
            "No sign up link",
        };
      });

    res.status(OK).json(processedSpecialEvents);
  })
);

export default router;
