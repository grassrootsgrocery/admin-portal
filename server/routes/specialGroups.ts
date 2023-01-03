import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
  OK_CREATED,
} from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  Record,
  SpecialGroup,
  ProcessedSpecialGroup,
} from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";

const router = express.Router();

function processSpecialGroups(
  specialGroup: Record<SpecialGroup>
): ProcessedSpecialGroup {
  return {
    id: specialGroup.id,
    name: specialGroup.fields["Name"] ? specialGroup.fields["Name"] : "N/A",
    events: specialGroup.fields["🚛 Supplier Pickup Events"],
  };
}

/**
 * @description Get all special groups
 * @route  GET /api/special-groups
 * @access
 */
router.route("/api/special-groups").get(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`GET /api/special-groups`);

    const url =
      `${AIRTABLE_URL_BASE}/👨‍👨‍👧 Volunteer Groups?` +
      `&fields=Name` + // Special Group Name
      `&fields=🚛 Supplier Pickup Events`; // Supplier Pickup Events -> list of events group is registered for

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const specialGroups = (await resp.json()) as AirtableResponse<SpecialGroup>;
    let processedSpecialGroups: ProcessedSpecialGroup[] =
      specialGroups.records.map((specialGroup) => {
        return {
          id: specialGroup.id,
          name: specialGroup.fields["Name"] || "No name",
          events: specialGroup.fields["🚛 Supplier Pickup Events"] || [],
        };
      });

    res.status(OK).json(processedSpecialGroups) as Response<
      ProcessedSpecialGroup[]
    >;
  })
);

/**
 * @description Create new special group
 * @route  POST /api/special-groups
 * @access
 */
router.route("/api/special-groups/").post(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`POST /api/special-groups`);
    console.log("Request body: ", req.body);
    const { specialGroupName } = req.body;
    if (!specialGroupName || typeof specialGroupName !== "string") {
      throw {
        status: BAD_REQUEST,
        message: "Please include 'specialGroupName' with type 'string'.",
      };
    }

    const resp = await fetch(`${AIRTABLE_URL_BASE}/👨‍👨‍👧 Volunteer Groups`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              Name: specialGroupName,
            },
          },
        ],
      }),
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }

    const specialGroups = await resp.json(); //as AirtableResponse<SpecialGroup>;
    res.status(OK_CREATED).json(specialGroups);
  })
);

interface EventForSpecialGroup {
  "Start Time": string | undefined;
  "End Time": string | undefined;
  Supplier: string[] | undefined; //This is the supplier id
  "First Driving Slot Start Time": string | undefined;
}
/**
 * @description Add special group to event
 * @route  POST /api/special-groups/add-special-group-to-event/
 * @access
 */
router.route("/api/special-groups/add-special-group-to-event").post(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`POST /api/special-groups/add-special-group-to-event`);
    console.log("Request body: ", req.body);

    const { eventId, specialGroupId } = req.body;
    const isBodyValid =
      eventId &&
      specialGroupId &&
      typeof eventId === "string" &&
      typeof specialGroupId === "string";

    if (!isBodyValid) {
      throw {
        status: BAD_REQUEST,
        message:
          "Please include 'eventId' and 'specialGroupId' on the request body and as 'string' types.",
      };
    }

    //Fetch some relevant information about this event so that we can add the special group to the event
    const fetchEventUrl =
      `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events?` +
      // Get events after today
      `&filterByFormula=SEARCH(RECORD_ID(), "${eventId}") != ""` +
      // Get fields for upcoming events dashboard
      `&fields=Start Time` + // Day, Time
      `&fields=End Time` + // Day, Time
      `&fields=First Driving Slot Start Time` +
      `&fields=Supplier`;

    const eventResp = await fetch(fetchEventUrl, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    });
    if (!eventResp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: eventResp.status,
      };
    }
    const eventData =
      (await eventResp.json()) as AirtableResponse<EventForSpecialGroup>;
    //Validation
    if (eventData.records.length === 0) {
      throw {
        status: INTERNAL_SERVER_ERROR,
        message: `Event with id ${eventId} was not found`,
      };
    }
    if (eventData.records.length > 1) {
      //Should never happen
      throw {
        status: INTERNAL_SERVER_ERROR,
        message: `Uh oh. Event with id ${eventId} was not unique when querying Airtable???`,
      };
    }
    const event = eventData.records[0];
    if (
      !event.fields["Start Time"] ||
      !event.fields["End Time"] ||
      !event.fields["Supplier"] ||
      event.fields["Supplier"].length !== 1 ||
      !event.fields["First Driving Slot Start Time"]
    ) {
      throw {
        status: INTERNAL_SERVER_ERROR,
        message: AIRTABLE_ERROR_MESSAGE,
      };
    }

    //Use fetched event data to create special event in supplier pickup events table
    const eventSupplierId = event.fields["Supplier"][0];
    const addGroupResp = await fetch(
      `${AIRTABLE_URL_BASE}/🚛 Supplier Pickup Events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                "Special Event": true,
                Supplier: [eventSupplierId],
                Status: "Volunteer Recruitment",
                City: "City", //Not sure what this is for
                "Volunteer Group": [specialGroupId],
                "Start Time": event.fields["Start Time"],
                "End Time": event.fields["End Time"],
                "First Driving Slot Start Time":
                  event.fields["First Driving Slot Start Time"],
                "Driver Time Slot Duration": 5400, //1 hour, 30 minutes -> (60 + 30) * 60 = 5400. TODO: This should eventually be changed so that it's not hardcoded
                "Max Count of Drivers Per Slot": 30, //TODO: This should eventually be changed so that it's not hardcoded
                "Max Count of Drivers for Event": 30, //TODO: This should eventually be changed so that it's not hardcoded
              },
            },
          ],
        }),
      }
    );
    if (!addGroupResp) {
      throw {
        status: INTERNAL_SERVER_ERROR,
        message: `Something went wrong when trying to add this special group to event with id ${eventId}`,
      };
    }
    const addGroupData = await addGroupResp.json();
    res.status(OK_CREATED).json(addGroupData);
  })
);

export default router;
