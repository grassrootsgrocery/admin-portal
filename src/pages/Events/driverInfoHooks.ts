import { useQuery } from "react-query";
import { AirtableResponse, Record, Driver, ProcessedDriver } from "../../types";
import { getNeighborhoodNames } from "./neighborhoodNamesHooks";

import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../airtableDataFetchingUtils";

function processDriverData(driver: Record<Driver>): ProcessedDriver {
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
    // deliveryType: driver.fields[""],
    zipCode: (driver.fields["Zip Code"]? driver.fields["Zip Code"][0]: "N/A"),
    vehicle: (driver.fields["Transportation Types"]? driver.fields["Transportation Types"][0]: "N/A"),
    restrictedLocations: (driver.fields["Restricted Neighborhoods"]? getNeighborhoodNames(driver.fields["Restricted Neighborhoods"]): "N/A")       // get from neighborhoods table
  };
}

export function useDriversInfo() {
  const driversUrl =
    `${AIRTABLE_URL_BASE}/📅 Scheduled Slots?` + 
    
    `view=Drivers - Last Week` +    // change view to "Assign Location"

    // Get fields for driver info table
    `&fields=First Name` +              // First Name
    `&fields=Last Name` +               // Last Name
    `&fields=Driving Slot Time` +       // Time Slot
    // // `&fields=` +                        // Delivery Type
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
  if (driversStatus === "success") {
    // console.log(drivers);
    processedDrivers = drivers.records.map((driver) => processDriverData(driver));
    // console.log(processedDrivers);
  }

  return {
    processedDrivers,
    processedDriversStatus: driversStatus,
    processedDriversError: driversStatus,
  };
}


