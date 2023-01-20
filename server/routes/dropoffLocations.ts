import express, { response } from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware";
import { Request, Response } from "express";
import { AIRTABLE_URL_BASE } from "../httpUtils/airtable";
import { fetch } from "../httpUtils/nodeFetch";
//Status codes
import { BAD_REQUEST, OK, OK_CREATED } from "../httpUtils/statusCodes";
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

  const startTime = location.fields["Starts accepting at"]
    ? new Date(location.fields["Starts accepting at"]).toLocaleString(
        "en-US",
        optionsTime
      )
    : "";
  const endTime = location.fields["Stops accepting at"]
    ? new Date(location.fields["Stops accepting at"]).toLocaleString(
        "en-US",
        optionsTime
      )
    : "";

  return {
    id: location.id,
    siteName: location.fields["Drop off location"] || "No name",
    address: location.fields["Drop-off Address"] || "No address",
    neighborhoods: location.fields["Neighborhood (from Zip Code)"] || [],
    startTime: startTime, // start time in HH:MM AM/PM format
    endTime: endTime, // end time in HH:MM AM/PM format
    deliveriesNeeded: location.fields["# of Loads Requested"] || 0,
    deliveriesAssigned: location.fields["Total Loads"] || 0,
    matchedDrivers: [""],
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
      `&fields=Drop off location` + // siteName
      `&fields=Drop-off Address` + // address
      `&fields=Neighborhood (from Zip Code)` + // neighborhoods
      `&fields=Starts accepting at` + // startTime
      `&fields=Stops accepting at` + // endTime
      `&fields=Total Loads` + // deliveriesAssigned
      `&fields%5B%5D=%23+of+Loads+Requested`; // deliveriesNeeded. This needs to be url encoded for reasons that I don't understand.

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      },
    });
    if (!resp.ok) {
      console.log(`${resp.status} ` + `${AIRTABLE_ERROR_MESSAGE}`);
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
 * @description Get all dropoff locations
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
      `&fields=Neighborhood (from Zip Code)` + // neighborhoods
      `&fields=Starts accepting at` + // startTime
      `&fields=Stops accepting at` + // endTime
      `&fields=Total Loads` + // deliveriesAssigned
      `&fields%5B%5D=%23+of+Loads+Requested`; // deliveriesNeeded. This needs to be url encoded for reasons that I don't understand.

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

/**
 * @description Set start time, end time, and deliveries needed for drop off locations
 * @route  PATCH /api/dropoff-locations/
 * @access
 */
router.route("/api/dropoff-locations/").patch(
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    console.log(`PATCH /api/dropoff-locations/`);
    console.log("Request body: ", req.body);

    const isValidRequest =
      Object.keys(req.body).filter(
        (locationId) =>
          typeof req.body[locationId].startTime !== "string" ||
          typeof req.body[locationId].endTime !== "string" ||
          typeof req.body[locationId].deliveriesNeeded !== "number"
      ).length === 0;

    if (!isValidRequest) {
      res.status(BAD_REQUEST);
      throw new Error(
        "Please ensure that the request body if of form { [locationId: string]: { 'startTime': string, 'endTime': string, 'deliveriesNeeded': number } }."
      );
    }

    const records = Object.keys(req.body).map((locationId) => {
      return {
        id: locationId,
        fields: {
          "Starts accepting at": req.body[locationId].startTime || null,
          "Stops accepting at": req.body[locationId].endTime || null,
          "# of Loads Requested": req.body[locationId].deliveriesNeeded,
        },
      };
    });

    const url = `${AIRTABLE_URL_BASE}/📍 Drop off locations`;

    //Use this loop to make the requests because Airtable can only update the records 10 at a time.
    let start = 0;
    while (start + 10 <= records.length) {
      const resp = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          records: records.slice(start, start + 10),
        }),
      });
      if (!resp.ok) {
        throw {
          message: AIRTABLE_ERROR_MESSAGE,
          status: resp.status,
        };
      }
      start += 10;
    }
    res.status(OK).json({ message: "Dropoff locations updated" });
  })
);

export default router;
