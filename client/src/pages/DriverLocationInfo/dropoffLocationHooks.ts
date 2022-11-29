import { useQuery } from "react-query";
import {
  AirtableResponse,
  Record,
  DropoffLocation,
  ProcessedDropoffLocation,
} from "../../types";

import {
  AIRTABLE_URL_BASE,
  fetchAirtableData,
} from "../../httpUtils";

function processDropOffLocations(
  location: Record<DropoffLocation>
): ProcessedDropoffLocation {
  console.log("fieldss:", location.fields["Drop off location"]);
  return {
    id: location.id,
    dropOffLocation: location.fields["Drop off location"]
      ? location.fields["Drop off location"]
      : "N/A",
  };
}

// query for drop off locations from Drop off locations table
export function useDropOffLocations() {
  const dropoffsUrl =
    `${AIRTABLE_URL_BASE}/📍 Drop off locations?` +
    `view=Drop-offs for This Weekend` +
    `&fields%5B%5D=Drop off location`; // Name of drop off location

  const {
    data: DropOffLocations,
    status: DropOffLocationsStatus,
    error: DropOffLocationsError,
  } = useQuery(["fetchDropOffLocations"], () =>
    fetchAirtableData<AirtableResponse<DropoffLocation>>(dropoffsUrl)
  );

  let processedDropOffLocations: ProcessedDropoffLocation[] = [];
  if (
    DropOffLocationsStatus === "success" &&
  ) {
    console.log("data:", DropOffLocations.records);
    processedDropOffLocations = DropOffLocations.records.map((location) =>
      processDropOffLocations(location)
    );
  }

  return {
    processedDropOffLocations,
    processedDropOffLocationsStatus: DropOffLocationsStatus,
    processedDropOffLocationsError: DropOffLocationsError,
  };
}
