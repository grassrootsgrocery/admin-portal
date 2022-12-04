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
    dropOffLocation: location.fields["Drop off location"]
      ? location.fields["Drop off location"]
      : "N/A",
    address: location.fields["Drop-off Address"],
    neighborhood: location.fields["Neighborhood"]
      ? location.fields["Neighborhood"][0]
      : "",
    startTime: startTime.toLocaleString("en-US", optionsTime), // start time in HH:MM AM/PM format
    endTime: endTime.toLocaleString("en-US", optionsTime), // end time in HH:MM AM/PM format
    deliveriesAssigned: 0, // location.fields[""],        // TODO: update with correct aitable field
    matchedDrivers: [""], //location.fields[""]          // TODO: update with correct aitable field
  };
}

// create string with needed neighborhood ids for url in neighborhood table query
function getNeighborhoodIdsForUrl(
  location: ProcessedDropoffLocation[]
): string {
  let neighborhoodIds: string[] = [];
  location.forEach((organizer) => neighborhoodIds.push(organizer.neighborhood));
  return neighborhoodIds.join();
}
// update the processed organizer's neighborhood field with neighborhood name
function processNeighborhoodsForLocation(
  locations: ProcessedDropoffLocation[],
  neighborhoods: Map<string, string>
) {
  locations.forEach(function (location) {
    const neighborhoodName = neighborhoods.get(location.neighborhood);
    if (neighborhoodName !== undefined) {
      location.neighborhood = neighborhoodName;
    }
  });
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
      `&fields=Drop off location` + // Name of drop off location
      `&fields=Drop-off Address` + // address
      `&fields=Neighborhood` + // neighborhood
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
    processNeighborhoodsForLocation(
      processedDropOffLocations,
      neighborhoodNamesById
    );

    res.status(OK).json(processedDropOffLocations) as Response<
      ProcessedDropoffLocation[]
    >;
  })
);

export default router;
