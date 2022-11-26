import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "./airtableUtils";
import { fetch } from "./nodeFetch";

const router = express.Router();

/**
 * @description Get all upcoming events.
 * @route  GET /api/events/
 * @access
 */
router.route("/api/events").get(
  asyncHandler(async (req: Request, res: Response) => {
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
      const data = await resp.json();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  })
);

export default router;
