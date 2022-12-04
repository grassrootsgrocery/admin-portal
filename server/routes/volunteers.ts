import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { BAD_REQUEST, OK } from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  Driver,
  ProcessedDriver,
  Record,
  ScheduledSlot,
  Neighborhood,
  DropoffLocation,
  ProcessedDropoffLocation,
} from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";

const router = express.Router();
/**
 * @description Get all volunteers for event
 * @route  GET /api/volunteers/
 * @access
 */
router.route("/api/volunteers/").get(
  asyncHandler(async (req: Request, res: Response) => {
    const { scheduledSlotsIds } = req.query;
    console.log(`GET /api/volunteers/?${scheduledSlotsIds}`);

    const isValidRequest =
      scheduledSlotsIds && typeof scheduledSlotsIds === "string";
    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'scheduledSlotsIds' as a query param of type 'string'."
      );
    }

    const url =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${scheduledSlotsIds}") != ""` +
      `&fields=First Name` +
      `&fields=Last Name` +
      `&fields=Correct slot time` +
      `&fields=Type` +
      `&fields=Confirmed?` +
      `&fields=Volunteer Status` +
      `&fields=Can't Come` +
      `&fields=Email` +
      `&fields=Volunteer Group (for MAKE)`;

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
    const volunteers = (await resp.json()) as AirtableResponse<ScheduledSlot>;
    res.status(OK).json(volunteers);
  })
);

/**
 * @description Confirm a volunteer for an event
 * @route  PATCH /api/volunteers/confirm/:volunteerId
 * @access
 */
router.route("/api/volunteers/confirm/:volunteerId").patch(
  asyncHandler(async (req: Request, res: Response) => {
    const { volunteerId } = req.params;
    const { newConfirmationStatus } = req.body;
    console.log(`PATCH /api/volunteers/confirm/${volunteerId}`);

    const isValidRequest =
      volunteerId &&
      typeof volunteerId === "string" &&
      typeof newConfirmationStatus === "boolean";

    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'volunteerId' as a query param and a 'newConfirmationStatus' on the body."
      );
    }

    const data = {
      records: [
        {
          id: volunteerId,
          fields: { "Confirmed?": newConfirmationStatus },
        },
      ],
    };
    const json = JSON.stringify(data);
    const resp = await fetch(`${AIRTABLE_URL_BASE}/📅 Scheduled Slots`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      body: json,
    });
    const result = await resp.json();
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    res.status(OK).json(result);
  })
);

/**
 * @description Update the "Can't Come" status for a volunteer  for a particular event
 * @route  PATCH /api/volunteers/going/:volunteerId
 * @access
 */
router.route("/api/volunteers/going/:volunteerId").patch(
  asyncHandler(async (req: Request, res: Response) => {
    const { volunteerId } = req.params;
    const { newGoingStatus } = req.body;
    console.log(`PATCH /api/volunteers/going/${volunteerId}`);

    const isValidRequest =
      volunteerId &&
      typeof volunteerId === "string" &&
      typeof newGoingStatus === "boolean";

    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'volunteerId' as a query param and a 'newGoingStatus' on the body."
      );
    }

    const data = {
      records: [
        {
          id: volunteerId,
          fields: { "Can't Come": newGoingStatus },
        },
      ],
    };
    const json = JSON.stringify(data);
    const resp = await fetch(`${AIRTABLE_URL_BASE}/📅 Scheduled Slots`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      body: json,
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const result = await resp.json();
    res.status(OK).json(result);
  })
);

function processDriverData(driver: Record<Driver>): ProcessedDriver {
  // TODO: process restricted locations
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  } as const;

  const timeSlot = new Date(driver.fields["Driving Slot Time"][0]);

  return {
    // validate each data type data, returns N/A for null values
    id: driver.id,
    firstName: driver.fields["First Name"]
      ? driver.fields["First Name"][0]
      : "N/A",
    lastName: driver.fields["Last Name"]
      ? driver.fields["Last Name"][0]
      : "N/A",
    timeSlot: timeSlot.toLocaleString("en-US", optionsTime), // time slot in HH:MM AM/PM format
    deliveryCount: driver.fields["Total Deliveries"],
    zipCode: driver.fields["Zip Code"] ? driver.fields["Zip Code"][0] : "N/A",
    vehicle: driver.fields["Transportation Types"]
      ? driver.fields["Transportation Types"][0]
      : "N/A",
    restrictedLocations: driver.fields["Restricted Neighborhoods"]
      ? driver.fields["Restricted Neighborhoods"]
      : [],
    dropoffLocations: driver.fields["📍 Drop off location"] || [],
  };
}

function processDropOffLocations(
  location: Record<DropoffLocation>
): ProcessedDropoffLocation {
  return {
    id: location.id,
    dropOffLocation: location.fields["Drop off location"]
      ? location.fields["Drop off location"]
      : "N/A",
  };
}
/**
 * @description Get all the drivers for an event
 * @route  GET /api/volunteers/drivers
 * @access
 */
router.route("/api/volunteers/drivers").get(
  asyncHandler(async (req: Request, res: Response) => {
    console.log("GET /api/volunteers/drivers");
    console.log("HELLO!!");
    const url =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      `view=Assign Location ` + // tested with view "Drivers - Last Week"
      //`view=Drivers - Last Week` +
      // Get fields for driver info table
      `&fields=First Name` + // First Name
      `&fields=Last Name` + // Last Name
      `&fields=Driving Slot Time` + // Time Slot
      `&fields=Total Deliveries` + // Delivery Type
      `&fields=Zip Code` + // Zip Code
      `&fields=Transportation Types` + // Vehicle
      `&fields=Restricted Neighborhoods` + // Restricted Locations
      `&fields=📍 Drop off location`; // Restricted Locations

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
    const drivers = (await resp.json()) as AirtableResponse<Driver>;
    let processedDrivers = drivers.records.map((driver) =>
      processDriverData(driver)
    );
    processedDrivers.sort((driver1, driver2) =>
      driver1.firstName < driver2.firstName ? -1 : 1
    );
    console.log(processedDrivers);
    res.status(OK).json(processedDrivers);
  })
);

/**
 * @description Assign a driver a dropoff location
 * @route  GET /api/volunteers/drivers/assign-location/:driverId
 * @access
 */
router.route("/api/volunteers/drivers/assign-location/:driverId").patch(
  asyncHandler(async (req: Request, res: Response) => {
    const { driverId } = req.params;
    const { locationIds } = req.body;

    const isValidRequest =
      locationIds && driverId && typeof driverId === "string"; //&& typeof locationIds === "string[]";
    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'locationIds' on the request body with type string[]"
      );
    }
    console.log(`PATCH /api/volunteers/drivers/assign-location/${driverId}`);

    const resp = await fetch(`${AIRTABLE_URL_BASE}/📅 Scheduled Slots`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      body: JSON.stringify({
        records: [
          {
            id: driverId,
            fields: { "📍 Drop off location": locationIds },
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
    const result = await resp.json();
    res.status(OK).json(result);
  })
);
/**
 * @description
 * @route  GET /api/neighborhoods
 * @access
 */
router.route("/api/neighborhoods").get(
  asyncHandler(async (req: Request, res: Response) => {
    const { neighborhoodIds } = req.query;
    console.log(`GET /api/neighborhoods ${neighborhoodIds}`);

    const isValidRequest = typeof neighborhoodIds === "string";
    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please provide a 'neighborhoodIds' as a query param of type 'string'."
      );
    }

    const url =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

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
    const neighborhoods = (await resp.json()) as AirtableResponse<Neighborhood>;
    res.status(OK).json(neighborhoods);
  })
);

export default router;
