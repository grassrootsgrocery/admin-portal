import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { OK, OK_CREATED } from "../httpUtils/statusCodes";
//Types
import {
  AirtableResponse,
  Record,
  DropoffLocation,
  ProcessedDropoffLocation,
  DropOffOrganizer,
  ProcessedDropOffOrganizer,
  Neighborhood,
} from "../types";
//Error messages
import { AIRTABLE_ERROR_MESSAGE } from "../httpUtils/airtable";
import { request } from "http";

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
    dropOffLocation: location.fields["Drop off location"]
      ? location.fields["Drop off location"]
      : "N/A",
    address: location.fields["Drop-off Address"],
    neighborhoods: location.fields["Neighborhood (from Zip Code)"]
      ? location.fields["Neighborhood (from Zip Code)"]
      : [],
    startTime: startTime.toLocaleString("en-US", optionsTime), // start time in HH:MM AM/PM format
    endTime: endTime.toLocaleString("en-US", optionsTime), // end time in HH:MM AM/PM format
    deliveriesAssigned: 0, // location.fields[""],        // TODO: update with correct airtable field
    matchedDrivers: [""], //location.fields[""]          // TODO: update with correct airtable field
  };
}

// create string with needed neighborhood ids for url in neighborhood table query
function getNeighborhoodIdsForUrl(
  location: ProcessedDropoffLocation[] | ProcessedDropOffOrganizer[]
): string {
  let neighborhoodIds: string[] = [];
  location.forEach((organizer) =>
    organizer.neighborhoods.forEach((neighborhood) =>
      neighborhoodIds.push(neighborhood)
    )
  );
  return neighborhoodIds.join();
}

// update the processed location or organizer's neighborhood field with neighborhood name
function processNeighborhoods(
  locations: ProcessedDropoffLocation[] | ProcessedDropOffOrganizer[],
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

    const neighborhoodIds = getNeighborhoodIdsForUrl(processedDropOffLocations);
    const neighborhoodsUrl =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

    const neighborhoodResp = await fetch(neighborhoodsUrl, {
      headers: {
        method: "GET",
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

    // console.log(neighborhoodNamesById);
    processNeighborhoods(processedDropOffLocations, neighborhoodNamesById);

    res.status(OK).json(processedDropOffLocations) as Response<
      ProcessedDropoffLocation[]
    >;
  })
);

function processDropOffOrganizers(
  organizer: Record<DropOffOrganizer>
): ProcessedDropOffOrganizer {
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  } as const;

  let startTime = null;
  if (organizer.fields["Starts accepting at"]) {
    startTime = new Date(
      organizer.fields["Starts accepting at"]
    ).toLocaleString("en-US", optionsTime);
  }
  let endTime = null;
  if (organizer.fields["Stops accepting at"]) {
    endTime = new Date(organizer.fields["Stops accepting at"]).toLocaleString(
      "en-US",
      optionsTime
    );
  }

  return {
    id: organizer.id,
    siteName: organizer.fields["Drop off location"] || "No name",
    address: organizer.fields["Drop-off Address"] || "No address",
    neighborhoods: organizer.fields["Neighborhood (from Zip Code)"] || [],
    startTime,
    endTime,
    deliveriesNeeded: organizer.fields["Total Loads"] || 0,
  };
}

/**
 * @description Get regular saturday partners for drop off organizer pop up
 * @route  GET /api/dropoff-locations/partner-organizers
 * @access
 */
router.route("/api/dropoff-locations/partner-organizers").get(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`GET /api/dropoff-locations/partner-organizers`);

    const url =
      `${AIRTABLE_URL_BASE}/📍 Drop off locations?` +
      // Get organizers who are regular saturday partners
      `&filterByFormula={Regular Saturday Partner?}` +
      `&fields=Drop off location` + // siteName
      `&fields=Drop-off Address` + // address
      `&fields=Neighborhood (from Zip Code)` + // neighborhood
      `&fields=Starts accepting at` + // startTime
      `&fields=Stops accepting at` + // endTime
      `&fields=Total Loads`; // deliveriesNeeded

    const resp = await fetch(url, {
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
    const dropoffOrganizers =
      (await resp.json()) as AirtableResponse<DropOffOrganizer>;
    let processedDropOffOrganizers = dropoffOrganizers.records.map(
      (organizer) => processDropOffOrganizers(organizer)
    );

    const neighborhoodIds = getNeighborhoodIdsForUrl(
      processedDropOffOrganizers
    );
    const neighborhoodsUrl =
      `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

    const neighborhoodResp = await fetch(neighborhoodsUrl, {
      headers: {
        method: "GET",
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
    //console.log(neighborhoodNamesById);
    processNeighborhoods(processedDropOffOrganizers, neighborhoodNamesById);

    res.status(OK).json(processedDropOffOrganizers) as Response<
      ProcessedDropoffLocation[]
    >;
  })
);

/**
 * @description Set start time, end time, and deliveries needed for drop off locations
 * @route  PATCH /api/dropoff-locations/
 * @access
 */
router.route("/api/dropoff-locations/").patch(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    console.log(req.body, `PATCH /api/dropoff-locations/`);
    /*
    records = [
      {
        "id": "recRMO4c6PTJqAoVv",
        "fields": {
          "Deliveries Needed": "whatever",
          "Starts accepting at": "2022-11-05T10:00:00.000Z",
          "Stops accepting at": "2022-11-05T14:00:00.000Z",
    */
    const records = Object.keys(req.body).map((locationId) => {
      return {
        id: locationId,
        fields: {
          "Starts accepting at": req.body[locationId].startTime,
          "Stops accepting at": req.body[locationId].endTime,
        },
      };
    });

    const url = `${AIRTABLE_URL_BASE}/📍 Drop off locations`;

    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
      body: JSON.stringify({
        records: records,
      }),
    });
    if (!resp.ok) {
      throw {
        message: AIRTABLE_ERROR_MESSAGE,
        status: resp.status,
      };
    }
    const dropoffOrganizers = await resp.json();
    res.status(OK_CREATED).json(dropoffOrganizers);
  })
);

export default router;
