import { useQuery } from "react-query";
import { AirtableResponse, ProcessedDriver, Neighborhood } from "../../types";
import { API_BASE_URL } from "../../httpUtils";

export function useDriversInfo() {
  const {
    data: processedDrivers,
    status: processedDriversStatus,
    error: processedDriversError,
  } = useQuery(["fetchDriverInfo"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/volunteers/drivers`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedDriver[]>;
  });

  // query for neighborhood names from neighborhood table
  const {
    data: neighborhoods,
    status: neighborhoodsStatus,
    error: neighborhoodsError,
  } = useQuery(
    ["fetchNeighborhoodNames"],
    async () => {
      if (typeof processedDrivers === "undefined") {
        return Promise.reject(new Error("Undefined driver info"));
      }

      const neighborhoodIds = getNeighborhoodIdsForUrl(processedDrivers);

      const response = await fetch(
        `${API_BASE_URL}/api/neighborhoods?neighborhoodIds=${neighborhoodIds}`
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.messsage);
      }
      return response.json() as Promise<AirtableResponse<Neighborhood>>;
    },
    {
      enabled: processedDriversStatus === "success",
    }
  );

  if (
    processedDriversStatus === "success" &&
    neighborhoodsStatus === "success"
  ) {
    let neighborhoodNamesById: Map<string, string> = new Map();
    neighborhoods.records.forEach((neighborhood) =>
      neighborhoodNamesById.set(neighborhood.id, neighborhood.fields.Name)
    );
    processNeighborhoodsForDriver(processedDrivers, neighborhoodNamesById);

    // sort drivers by first name
    processedDrivers.sort((driver1, driver2) =>
      driver1.firstName < driver2.firstName ? -1 : 1
    );
  }

  const isLoading =
    processedDriversStatus === "loading" ||
    processedDriversStatus === "idle" ||
    neighborhoodsStatus === "loading" ||
    neighborhoodsStatus === "idle";

  const isError =
    processedDriversStatus === "error" || neighborhoodsStatus === "error";

  return {
    driversInfo: processedDrivers,
    driversInfoIsLoading: isLoading,
    driversInfoIsError: isError,
    driversInfoError: processedDriversError || neighborhoodsError,
  };
}

// create string with needed neighborhood ids for url in neighborhood table query
function getNeighborhoodIdsForUrl(drivers: ProcessedDriver[]): string {
  let neighborhoodIds: string[] = [];
  drivers.forEach((driver) =>
    driver.restrictedLocations.forEach((neighborhood) =>
      neighborhoodIds.push(neighborhood)
    )
  );
  return neighborhoodIds.join();
}

// update the processed driver's restricted neighborhood field with neighborhood names
function processNeighborhoodsForDriver(
  drivers: ProcessedDriver[],
  neighborhoods: Map<string, string>
) {
  drivers.forEach(function (driver) {
    let neighborhoodNames: string[] = [];
    driver.restrictedLocations.forEach(function (neighborhoodId) {
      const neighborhoodName = neighborhoods.get(neighborhoodId);
      if (neighborhoodName !== undefined) {
        neighborhoodNames.push(neighborhoodName);
      }
    });
    driver.restrictedLocations = neighborhoodNames;
  });
}
