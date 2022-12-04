import express from "express";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { OK } from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  Record,
  DropoffLocation,
  ProcessedDropoffLocation,
} from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";

const router = express.Router();

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
 * @description Get dropoff locations for event
 * @route  GET /api/dropoff-locations/
 * @access
 */
router.route("/api/dropoff-locations/").get(
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`GET /api/dropoff-locations/`);

    const url =
      `${AIRTABLE_URL_BASE}/📍 Drop off locations?` +
      `view=Drop-offs for This Weekend` +
      `&fields%5B%5D=Drop off location`; // Name of drop off location

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
    const dropoffLocations =
      (await resp.json()) as AirtableResponse<DropoffLocation>;
    let processedDropOffLocations = dropoffLocations.records.map((location) =>
      processDropOffLocations(location)
    );
    res.status(OK).json(processedDropOffLocations) as Response<
      ProcessedDropoffLocation[]
    >;
  })
);

export default router;
