import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "./airtableUtils";
import { fetch } from "./nodeFetch";

//Types
import {
  AirtableResponse,
  Driver,
  ProcessedDriver,
  Record,
  ScheduledSlot,
  Neighborhood,
} from "../types";

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
    const url =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${scheduledSlotsIds}") != ""` +
      `&fields=First Name` +
      `&fields=Last Name` +
      `&fields=Correct slot time` +
      `&fields=Type` +
      `&fields=Confirmed?` +
      `&fields=Volunteer Status` +
      `&fields=Email` +
      `&fields=Volunteer Group (for MAKE)`;

    try {
      const resp = await fetch(url, {
        headers: {
          method: "GET",
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      });
      const volunteers = (await resp.json()) as AirtableResponse<ScheduledSlot>;
      res.status(200).json(volunteers);
    } catch (error) {
      console.error(error);
      res.status(500);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Something went wrong on server.");
      }
    }
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
    console.log(`PATCH /api/volunteers/${volunteerId}`);
    try {
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
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Something went wrong on server.");
      }
    }
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
  };
}

/**
 * @description
 * @route  GET /api/volunteers/drivers
 * @access
 */
router.route("/api/volunteers/drivers").get(
  asyncHandler(async (req: Request, res: Response) => {
    console.log("GET /api/volunteers/drivers");
    const url =
      `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` +
      //`view=Assign Location ` + // tested with view "Drivers - Last Week"
      `view=Drivers - Last Week` +
      // Get fields for driver info table
      `&fields=First Name` + // First Name
      `&fields=Last Name` + // Last Name
      `&fields=Driving Slot Time` + // Time Slot
      `&fields=Total Deliveries` + // Delivery Type
      `&fields=Zip Code` + // Zip Code
      `&fields=Transportation Types` + // Vehicle
      `&fields=Restricted Neighborhoods`; // Restricted Locations

    try {
      const resp = await fetch(url, {
        headers: {
          method: "GET",
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      });
      const drivers = (await resp.json()) as AirtableResponse<Driver>;
      let processedDrivers = drivers.records.map((driver) =>
        processDriverData(driver)
      );
      processedDrivers.sort((driver1, driver2) =>
        driver1.firstName < driver2.firstName ? -1 : 1
      );
      res.status(200).json(processedDrivers);
    } catch (error) {
      console.error(error);
      res.status(500);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Something went wrong on server.");
      }
    }
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

    const url =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

    try {
      const resp = await fetch(url, {
        headers: {
          method: "GET",
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
      });
      const neighborhoods =
        (await resp.json()) as AirtableResponse<Neighborhood>;
      res.status(200).json(neighborhoods);
    } catch (error) {
      console.error(error);
      res.status(500);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Something went wrong on server.");
      }
    }
  })
);

export default router;
