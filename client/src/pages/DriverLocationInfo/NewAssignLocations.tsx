import { Popup } from "../../components/Popup";
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
import roundX from "../../assets/roundX.svg";
import * as Modal from "@radix-ui/react-dialog";
import { cn } from "../../utils/ui";
import { DataTable } from "../../components/DataTable";
import { CoordinatorInfoPopup } from "./CoordinatorInfoPopup";
import { HttpCheckbox } from "../../components/HttpCheckbox";

function processDropoffLocationsForTable(
  drivers: ProcessedDriver[],
  processedDropOffLocations: ProcessedDropoffLocation[]
) {
  return processedDropOffLocations.map((curLocation, i) => {
    return [
      curLocation.id, //id
      <HttpCheckbox
        checked={true}
        mutationFn={() => {}}
        onSuccess={() => {}}
        onError={() => {}}
      />,
      curLocation.siteName,
      curLocation.address,
      curLocation.neighborhoods.join(", "),
      typeof curLocation.startTime === "string" ? curLocation.startTime : "N/A",
      typeof curLocation.endTime === "string" ? curLocation.endTime : "N/A",
      `${curLocation.deliveriesAssigned}/${curLocation.deliveriesNeeded}`,
    ];
  });
}
const jason_locations = [
  "Washington Heights (Manhattan)",
  "Central Harlem",
  "Sugar Hill (Harlem)",
  "South Bronx",
  "East Harlem",
  "Southeast Bronx",
  "Inwood and Washington Heights (Manhattan)",
];
const is_valid = true;
export function NewAssignLocations({
  drivers,
  dropoffLocations,
}: {
  drivers: ProcessedDriver[];
  dropoffLocations: ProcessedDropoffLocation[];
}) {
  return (
    <Popup
      className={cn(
        "bg-softBeige fixed left-[50%] top-0 h-[27rem] w-full -translate-x-1/2 p-4",
        "md:top-[50%] md:w-[40rem] md:-translate-y-1/2 md:rounded-lg md:py-2 md:px-8",
        "lg:h-[40rem] lg:w-[80rem]"
      )}
      trigger={<button>Assign Location</button>}
    >
      <>
        <Modal.Close
          className="absolute right-5 top-5 w-4 md:w-6 lg:w-8"
          asChild
        >
          <button className="hover:brightness-150">
            <img src={roundX} alt="Hello" />
          </button>
        </Modal.Close>
        <Modal.Title className="text-newLeafGreen flex h-[10%] items-center justify-center text-lg font-bold lg:text-xl">
          Assign Jason Cavanaugh
        </Modal.Title>
        <div className="h-[88%]">
          <div className="h-[100%] flex gap-3">
            <div className="flex flex-col gap-2 w-[30%]">
              <div className="flex flex-col h-[10%]">
                <p className="italic">Time Slot</p>
                <h2 className="font-semibold text-newLeafGreen">10:00 AM</h2>
              </div>
              <div className="flex flex-col h-[10%]">
                <p className="italic">Delivery Count</p>
                <h2 className="font-semibold text-newLeafGreen">1</h2>
              </div>
              <div className="flex flex-col h-[70%]">
                <p className="italic">Restricted Locations</p>
                <p className="overflow-scroll pr-2 scrollbar-thin flex flex-col gap-1">
                  {jason_locations.map((l, i) => {
                    return (
                      <div className="border border-softGrayWhite rounded font-semibold bg-softBeige text-newLeafGreen p-1">
                        {l}
                      </div>
                    );
                  })}
                </p>
              </div>
            </div>
            <DataTable
              borderColor="softGrayWhite"
              columnHeaders={[
                "Assign",
                "Site Name",
                "Address",
                "Neighborhood",
                "Start Time",
                "End Time",
                "Deliveries Assigned",
              ]}
              dataRows={processDropoffLocationsForTable(
                drivers,
                dropoffLocations
              )}
            />
          </div>
        </div>
      </>
    </Popup>
  );
}

function getBorderColorClassName(
  borderColor: "softGrayWhite" | "newLeafGreen"
) {
  switch (borderColor) {
    case "newLeafGreen":
      return "border-newLeafGreen";
    case "softGrayWhite":
      return "border-softGrayWhite";
  }
}
export const JasonDataTable: React.FC<{
  columnHeaders: string[];
  dataRows: (string | number | JSX.Element)[][];
  borderColor: "softGrayWhite" | "newLeafGreen";
}> = ({ columnHeaders, dataRows, borderColor }) => {
  return (
    <div
      className={cn(
        "hide-scroll h-full w-full overflow-scroll rounded-lg border-4",
        getBorderColorClassName(borderColor)
      )}
    >
      {/* Note that you cannot do border-${borderColor} above because of how Tailwind purges classes at build time*/}
      <table className="table w-full border-separate border-spacing-0  rounded-lg">
        <thead className="sticky top-0 z-10 border-b-2 border-newLeafGreen bg-softBeige">
          <tr>
            {columnHeaders.map((h, i) => {
              return (
                <th
                  key={i}
                  className="border-b-2 border-newLeafGreen bg-softBeige p-4 text-newLeafGreen text-sm md:text-base"
                >
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row) => {
            const [id, ...data] = row;
            if (typeof id !== "string" && typeof id !== "number") {
              console.error(
                "Please provide an ID of type 'string' or 'number' as the first entry of each row."
              );
              return;
            }
            return (
              <tr key={id}>
                {data.map((datum, idx) => {
                  return (
                    <td
                      key={idx}
                      className="border border-newLeafGreen bg-softBeige px-2 py-2 text-center align-middle text-newLeafGreen text-sm md:text-base"
                    >
                      {datum}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
