import { useDriversInfo } from "./driverInfoHooks";


export function DriverInfo() {
  const { processedDrivers, processedDriversStatus, processedDriversError } =
  useDriversInfo();

//   console.log(processedDrivers);
  
}
