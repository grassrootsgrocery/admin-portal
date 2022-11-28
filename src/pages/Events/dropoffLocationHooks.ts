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
  } from "../../airtableDataFetchingUtils";

function processDropOffLocations(location: Record<DropoffLocation>): ProcessedDropoffLocation {
    return {
     dropOffLocation: location.fields["Drop Off Location"] 
       ? location.fields["Drop Off Location"]
       : "N/A",
   };
 }
 
 // query for drop off locations from Drop off locations table
 export function useDropOffLocations() {
   const dropoffsUrl =
     `${AIRTABLE_URL_BASE}/📍 Drop off locations?` +
     `view=Drop-offs for This Weekend` +
     `&fields=Drop off location`; 
 
   const {
     data: DropOffLocations,
     status: DropOffLocationsStatus,
     error: DropOffLocationsError,
   } = useQuery(["fetchDropOffLocations"], () =>
     fetchAirtableData<AirtableResponse<DropoffLocation>>(dropoffsUrl)
   );
 
   let processedDropOffLocations: ProcessedDropoffLocation[] = [];
   if (DropOffLocationsStatus === "success" && DropOffLocations.records !== undefined) {
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