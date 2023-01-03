import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
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
  Neighborhood,
} from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";

const router = express.Router();

function processDropOffLocations(
  location: Record<DropoffLocation>
): ProcessedDropoffLocation {
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  } as const;

  const startTime = new Date(location.fields["Starts accepting at"]);
  const endTime = new Date(location.fields["Stops accepting at"]);

  return {
    id: location.id,
    siteName: location.fields["Drop off location"] || "No name",
    address: location.fields["Drop-off Address"] || "No address",
    neighborhoods: location.fields["Neighborhood (from Zip Code)"] || [],
    startTime: startTime.toLocaleString("en-US", optionsTime), // start time in HH:MM AM/PM format
    endTime: endTime.toLocaleString("en-US", optionsTime), // end time in HH:MM AM/PM format
    deliveriesNeeded: 0, // TODO: update with correct airtable field
    deliveriesAssigned: location.fields["Total Loads"] || 0,
    matchedDrivers: [""], // TODO: update with correct airtable field
  };
}

// create string with needed neighborhood ids for url in neighborhood table query
function getNeighborhoodIdsForUrl(
  locations: ProcessedDropoffLocation[]
): string {
  let neighborhoodIds: string[] = [];
  locations.forEach((location) =>
    location.neighborhoods.forEach((neighborhood) =>
      neighborhoodIds.push(neighborhood)
    )
  );
  return neighborhoodIds.join();
}

// update the processed location's neighborhood field with neighborhood name
function processNeighborhoodsForLocations(
  locations: ProcessedDropoffLocation[],
  neighborhoods: Map<string, string>
) {
  locations.forEach(function (location) {
    let locationNeighborhoodNames: string[] = [];
    location.neighborhoods.forEach(function (neighborhood) {
      const neighborhoodName = neighborhoods.get(neighborhood);
      if (neighborhoodName !== undefined) {
        locationNeighborhoodNames.push(neighborhoodName);
      }
    });
    location.neighborhoods = locationNeighborhoodNames;
  });
}

/**
 * @description Get dropoff locations for event
 * @route  GET /api/dropoff-locations/
 * @access
 */
router.route("/api/dropoff-locations/").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`GET /api/dropoff-locations/`);

    const url =
      `${AIRTABLE_URL_BASE}/📍 Drop off locations?` +
      `view=Drop-offs for This Weekend` +
      `&fields=Drop off location` + // Name of drop off location
      `&fields=Drop-off Address` + // address
      `&fields=Neighborhood (from Zip Code)` + // neighborhood
      `&fields=Starts accepting at` + // startTime
      `&fields=Stops accepting at`; //+  // endTime

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
    const dropoffLocations =
      (await resp.json()) as AirtableResponse<DropoffLocation>;
    let processedDropOffLocations = dropoffLocations.records.map((location) =>
      processDropOffLocations(location)
    );

    const neighborhoodIds = getNeighborhoodIdsForUrl(processedDropOffLocations);
    const neighborhoodsUrl =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

    const neighborhoodResp = await fetch(neighborhoodsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!neighborhoodResp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: neighborhoodResp.status,
      };
    }
    const neighborhoods =
      (await neighborhoodResp.json()) as AirtableResponse<Neighborhood>;
    let neighborhoodNamesById: Map<string, string> = new Map();
    neighborhoods.records.forEach((neighborhood) =>
      neighborhoodNamesById.set(neighborhood.id, neighborhood.fields.Name)
    );

    processNeighborhoodsForLocations(
      processedDropOffLocations,
      neighborhoodNamesById
    );

    res.status(OK).json(processedDropOffLocations) as Response<
      ProcessedDropoffLocation[]
    >;
  })
);

/**
 * @description Get partner locations for drop off organizer pop up
 * @route  GET /api/dropoff-locations/partner-locations
 * @access
 */
router.route("/api/dropoff-locations/partner-locations").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`GET /api/dropoff-locations/partner-locations`);

    const url =
      `${AIRTABLE_URL_BASE}/📍 Drop off locations?` +
      // Get locations who are regular saturday partners
      `&filterByFormula={Regular Saturday Partner?}` +
      `&fields=Drop off location` + // siteName
      `&fields=Drop-off Address` + // address
      `&fields=Neighborhood (from Zip Code)` + // neighborhood
      `&fields=Starts accepting at` + // startTime
      `&fields=Stops accepting at` + // endTime
      `&fields=Total Loads`; // deliveriesNeeded

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
    const partnerDropoffLocations =
      (await resp.json()) as AirtableResponse<DropoffLocation>;
    let processedPartnerDropOffLocations = partnerDropoffLocations.records.map(
      (location) => processDropOffLocations(location)
    );

    const neighborhoodIds = getNeighborhoodIdsForUrl(
      processedPartnerDropOffLocations
    );
    const neighborhoodsUrl =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

    const neighborhoodResp = await fetch(neighborhoodsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!neighborhoodResp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: neighborhoodResp.status,
      };
    }
    const neighborhoods =
      (await neighborhoodResp.json()) as AirtableResponse<Neighborhood>;
    let neighborhoodNamesById: Map<string, string> = new Map();
    neighborhoods.records.forEach((neighborhood) =>
      neighborhoodNamesById.set(neighborhood.id, neighborhood.fields.Name)
    );
    processNeighborhoodsForLocations(
      processedPartnerDropOffLocations,
      neighborhoodNamesById
    );

    res.status(OK).json(processedPartnerDropOffLocations) as Response<
      ProcessedDropoffLocation[]
    >;
  })
);

export default router;
