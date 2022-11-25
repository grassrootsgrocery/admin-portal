import { Loading } from "../../components/Loading";
import { useDriversInfo } from "./driverInfoHooks";

export function DriverInfo() {
  const { processedDrivers, processedDriversStatus, processedDriversError } =
    useDriversInfo();
  console.log(processedDrivers);

  const loading =
    processedDriversStatus === "loading" || processedDriversStatus === "idle";
  if (loading) {
    <div style={{ position: "relative", minHeight: "80vh" }}>
      <Loading />
    </div>;
  }
  if (processedDriversStatus === "error") {
    console.error(processedDriversError);
    return <div>Error...</div>;
  }
  const tdClasses = "rounded border p-4";
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Time Slot</th>
            <th>Delivery Count</th>
            <th>Zip Code</th>
            <th>Vehicle</th>
            <th>Restricted Locations</th>
          </tr>
        </thead>
        <tbody>
          {processedDrivers.map((driver, idx) => {
            return (
              <tr key={driver.id}>
                <td className={tdClasses}>{driver.id}</td>
                <td className={tdClasses}>{driver.firstName}</td>
                <td className={tdClasses}>{driver.lastName}</td>
                <td className={tdClasses}>{driver.timeSlot}</td>
                <td className={tdClasses}>{driver.deliveryCount}</td>
                <td className={tdClasses}>{driver.zipCode}</td>
                <td className={tdClasses}>{driver.vehicle}</td>
                <td className={tdClasses}>
                  {driver.restrictedLocations.join(",")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
