import { useQuery } from "react-query";
import { AirtableResponse, Record, Driver, ProcessedDriver, Neighborhood } from "../../types";

import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

function processDriverData(driver: Record<Driver>): ProcessedDriver {   // note: does not process restricted locations (done later)
  const optionsTime = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  } as const;

  const timeSlot = new Date(driver.fields["Driving Slot Time"][0]);  

  return {    // validate each data type data, returns N/A for null values
    id: driver.id,
    firstName: (driver.fields["First Name"]? driver.fields["First Name"][0]: "N/A"),
    lastName: (driver.fields["Last Name"]? driver.fields["Last Name"][0]: "N/A"),
    timeSlot: timeSlot.toLocaleString("en-US", optionsTime),  // time slot in HH:MM AM/PM format
    deliveryCount: driver.fields["Total Deliveries"],
    zipCode: (driver.fields["Zip Code"]? driver.fields["Zip Code"][0]: "N/A"),
    vehicle: (driver.fields["Transportation Types"]? driver.fields["Transportation Types"][0]: "N/A"),
    restrictedLocations: (driver.fields["Restricted Neighborhoods"]? driver.fields["Restricted Neighborhoods"]: [])
  };
}

export function useDriversInfo() {
  const { processedDrivers, processedDriversStatus, processedDriversError } = fetchDriverInfo();

  // query for neighborhood names from neighborhood table
  const {
    data: neighborhoods,
    status: neighborhoodsStatus,
    error: neighborhoodsError,
  } = useQuery (
    ["fetchNeighborhoodNames"],
    async () => {
      if (typeof processedDrivers === "undefined") {
        return Promise.reject(new Error("Undefined driver info"));
      }

      const neighborhoodIds = getNeighborhoodIdsForUrl(processedDrivers);

      const neighborhoodsUrl = `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?` +
      `filterByFormula=SEARCH(RECORD_ID(), "${neighborhoodIds}") != ""` +
      `&fields%5B%5D=Name`;

      return fetchAirtableData<AirtableResponse<Neighborhood>>(neighborhoodsUrl)
    },
    { enabled: processedDriversStatus === "success" && processDriverData.length > 0 }
  );

  if (neighborhoodsStatus === "success" && processedDrivers.length > 0) {
    let neighborhoodNamesById: Map<string, string> = new Map();
    neighborhoods.records.forEach((neighborhood) => neighborhoodNamesById.set(neighborhood.id, neighborhood.fields.Name));
    processNeighborhoodsForDriver(processedDrivers, neighborhoodNamesById);

    // sort drivers by first name
    processedDrivers.sort((driver1, driver2) => driver1.firstName < driver2.firstName ? -1 : 1);
  }

  return {
    processedDrivers,
    processedDriversStatus: processedDriversStatus && neighborhoodsStatus,
    processedDriversError: processedDriversError && neighborhoodsError,
  };
}

// query for driver info from schedule slots table
function fetchDriverInfo() {
  const driversUrl =
  `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` + 
  
  // `view=Assign Location ` +            // tested with view "Drivers - Last Week"
  `view=Drivers - Last Week` +    

  // Get fields for driver info table
  `&fields=First Name` +              // First Name
  `&fields=Last Name` +               // Last Name
  `&fields=Driving Slot Time` +       // Time Slot
  `&fields=Total Deliveries` +        // Delivery Type
  `&fields=Zip Code` +                // Zip Code
  `&fields=Transportation Types` +    // Vehicle
  `&fields=Restricted Neighborhoods`; // Restricted Locations

  const {
    data: drivers,
    status: driversStatus,
    error: driversError,
  } = useQuery(["fetchDriverInfo"], () =>
    fetchAirtableData<AirtableResponse<Driver>>(driversUrl)
  );

  let processedDrivers: ProcessedDriver[] = [];
  if (driversStatus === "success" && drivers.records !== undefined) {
    processedDrivers = drivers.records.map((driver) => processDriverData(driver));
  }

  return {
    processedDrivers,
    processedDriversStatus: driversStatus,
    processedDriversError: driversError,
  };
}

// create string with needed neighborhood ids for url in neighborhood table query
function getNeighborhoodIdsForUrl(drivers: ProcessedDriver[]): string {
  let neighborhoodIds:string[] = [];
  drivers.forEach((driver) => driver.restrictedLocations.forEach((neighborhood) => neighborhoodIds.push(neighborhood)));
  return neighborhoodIds.join();
}

// update the processed driver's restricted neighborhood field with neighborhood names
function processNeighborhoodsForDriver(drivers: ProcessedDriver[], neighborhoods: Map<string, string>) {
  drivers.forEach(function(driver) {
    let neighborhoodNames: string[] = [];
    driver.restrictedLocations.forEach(function(neighborhoodId) {
      const neighborhoodName = neighborhoods.get(neighborhoodId);
      if (neighborhoodName !== undefined) {
        neighborhoodNames.push(neighborhoodName);
      }
    });
    driver.restrictedLocations = neighborhoodNames;
  });
}
