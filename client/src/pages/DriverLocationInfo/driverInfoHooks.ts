import { useQuery } from "react-query";
import { Neighborhood, ProcessedDriver } from "../../types";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";

export function useDriversInfo() {
  const { token } = useAuth();
  if (!token) {
    throw new Error("No token found in useDriversInfo hook");
  }
  const {
    data: processedDrivers,
    refetch: refetchDrivers,
    status: processedDriversStatus,
    error: processedDriversError,
  } = useQuery(["fetchDriverInfo"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/volunteers/drivers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
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
        `${API_BASE_URL}/api/neighborhoods?neighborhoodIds=${neighborhoodIds}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.messsage);
      }
      return response.json() as Promise<Neighborhood[]>;
    },
    {
      enabled: processedDriversStatus === "success",
    }
  );
  let driversWithNeighborhoodNames: ProcessedDriver[] = [];
  if (
    processedDriversStatus === "success" &&
    neighborhoodsStatus === "success"
  ) {
    let neighborhoodNamesById: Map<string, string> = new Map();
    neighborhoods.forEach((neighborhood) =>
      neighborhoodNamesById.set(neighborhood.id, neighborhood.Name)
    );
    driversWithNeighborhoodNames = processNeighborhoodsForDriver(
      processedDrivers,
      neighborhoodNamesById
    );

    // sort drivers by first name
    driversWithNeighborhoodNames.sort((driver1, driver2) =>
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
    driversInfo: driversWithNeighborhoodNames,
    refetchDrivers,
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
  return drivers.map((driver) => {
    let neighborhoodNames: string[] = [];
    driver.restrictedLocations.forEach((neighborhoodId) => {
      const neighborhoodName = neighborhoods.get(neighborhoodId);
      if (neighborhoodName !== undefined) {
        neighborhoodNames.push(neighborhoodName);
      }
    });
    //driver.restrictedLocations = neighborhoodNames;
    return { ...driver, restrictedLocations: neighborhoodNames };
  });
}
