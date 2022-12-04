import { Link, useParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { Loading } from "../../components/Loading";
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
import { useDriversInfo } from "./driverInfoHooks";
// import { useDropOffLocations } from "./dropoffLocationHooks";
import { AssignLocationDropdown } from "./AssignLocationDropdown";
import { useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";

//Takes in ProcessedDriver array and formats data for DataTable component
function processDriversForTable(
  drivers: ProcessedDriver[],
  processedDropOffLocations: ProcessedDropoffLocation[],
  refetchDrivers: any
) {
  let output = [];
  for (let i = 0; i < drivers.length; i++) {
    const curDriver = drivers[i];
    let curRow = [
      curDriver.id, //id
      i + 1, //#
      curDriver.firstName,
      curDriver.lastName,
      curDriver.timeSlot,
      curDriver.deliveryCount,
      curDriver.zipCode,
      curDriver.vehicle,
      curDriver.restrictedLocations.join(", "),
      <AssignLocationDropdown
        locations={processedDropOffLocations.sort((a, b) =>
          a.dropOffLocation < b.dropOffLocation ? -1 : 1
        )}
        driver={curDriver}
        refetchDrivers={refetchDrivers}
      />,
    ];
    output.push(curRow);
  }
  return output;
}

export function DriverLocationInfo() {
  const { eventId } = useParams();

  const {
    driversInfo,
    refetchDrivers,
    driversInfoIsLoading,
    driversInfoIsError,
    driversInfoError,
  } = useDriversInfo();
  console.log("driversInfo", driversInfo);

  const {
    data: dropoffLocations,
    status: dropoffLocationsStatus,
    error: dropoffLocationsError,
  } = useQuery(["fetchDropOffLocations"], async () => {
    const resp = await fetch(`${API_BASE_URL}/api/dropoff-locations`);
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.messsage);
    }
    return resp.json();
  });
  console.log("dropoffLocations", dropoffLocations);

  if (
    driversInfoIsLoading ||
    dropoffLocationsStatus === "loading" ||
    dropoffLocationsStatus === "idle"
  ) {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }
  if (driversInfoIsError || dropoffLocationsStatus === "error") {
    const error = driversInfoError || dropoffLocationsError;
    console.error(error);
    return <div>Error...</div>;
  }
  //This shouldn't be necessary but TypeScript isn't smart enough to know that this can't be undefined
  if (driversInfo === undefined) {
    console.error("driversInfo is undefined");
    return <div>Error...</div>;
  }
  return (
    <div className="p-6 lg:px-14 lg:py-10">
      <Link to={`/events/${eventId}`}>
        <button
          className="shrink-0 rounded-full bg-pumpkinOrange px-4 text-base font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-10 md:py-1"
          type="button"
        >
          Go Back
        </button>
      </Link>
      <div className="h-8" />
      <DataTable
        columnHeaders={[
          "#",
          "First Name",
          "Last Name",
          "Time Slot",
          "Delivery Count",
          "Zip Code",
          "Vehicle",
          "Restricted Locations",
          "Assign Location",
        ]}
        dataRows={processDriversForTable(
          driversInfo,
          dropoffLocations,
          refetchDrivers
        )}
      />
    </div>
  );
}
