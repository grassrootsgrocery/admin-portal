import { useQuery } from "react-query";
import { AirtableResponse, Record, Neighborhood, ProcessedNeighborhood } from "../../types";

import {
    AIRTABLE_URL_BASE,
    fetchAirtableData,
  } from "../../airtableDataFetchingUtils";

function useNeighborhoodNames(neighborhoodIds: string[]) {
    const driversUrl =
    `${AIRTABLE_URL_BASE}/🏡 Neighborhoods?`; 
    
  const {
    data: neighborhoods,
    status: neighborhoodsStatus,
    error: neighborhoodsError,
  } = useQuery(["fetchNeighborhoodNames"], () =>
    fetchAirtableData<AirtableResponse<Neighborhood>>(driversUrl)
  );

  let processedNeighborhoods: ProcessedNeighborhood[] = [];
  if (neighborhoodsStatus === "success") {
    console.log(neighborhoods);
  }

  return {
    processedNeighborhoods,
    processedDriversStatus: neighborhoodsStatus,
    processedDriversError: neighborhoodsError,
  };
}

export function getNeighborhoodNames(neighborhoodIds: string[]): string {
    useNeighborhoodNames(neighborhoodIds);
    return "";
}