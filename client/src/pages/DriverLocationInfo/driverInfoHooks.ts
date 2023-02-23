import { useQuery } from "react-query";
import { Neighborhood, ProcessedDriver } from "../../types";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";

export function useDriversInfo() {
  const { token } = useAuth();
  if (!token) {
    throw new Error("No token found in useDriversInfo hook");
  }

  const driversQuery = useQuery(["fetchDriverInfo"], async () => {
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

  const neighborhoodsQuery = useQuery(
    ["fetchNeighborhoodNames"],
    async () => {
      if (typeof driversQuery.data === "undefined") {
        return Promise.reject(new Error("Undefined driversQuery.data"));
      }

      const neighborhoodIds = getNeighborhoodIdsForUrl(driversQuery.data);

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
      enabled: driversQuery.status === "success",
    }
  );
  let driversWithNeighborhoodNames: ProcessedDriver[] = [];
  if (
    driversQuery.status === "success" &&
    neighborhoodsQuery.status === "success"
  ) {
    let neighborhoodNamesById: Map<string, string> = new Map();
    neighborhoodsQuery.data.forEach((neighborhood) =>
      neighborhoodNamesById.set(neighborhood.id, neighborhood.Name)
    );
    driversWithNeighborhoodNames = processNeighborhoodsForDriver(
      driversQuery.data,
      neighborhoodNamesById
    );

    // sort drivers by first name
    driversWithNeighborhoodNames.sort((driver1, driver2) =>
      driver1.firstName < driver2.firstName ? -1 : 1
    );
  }

  const isLoading =
    driversQuery.status === "loading" ||
    driversQuery.status === "idle" ||
    neighborhoodsQuery.status === "loading" ||
    neighborhoodsQuery.status === "idle";

  const isError =
    driversQuery.status === "error" || neighborhoodsQuery.status === "error";

  return {
    data: driversWithNeighborhoodNames,
    refetch: driversQuery.refetch,
    isLoading,
    isError,
    error: driversQuery.error || neighborhoodsQuery.error,
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
