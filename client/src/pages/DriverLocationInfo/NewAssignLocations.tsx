import { Popup } from "../../components/Popup";
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
import roundX from "../../assets/roundX.svg";
import * as Modal from "@radix-ui/react-dialog";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { cn, toastNotify } from "../../utils/ui";
import { DataTable } from "../../components/DataTable";
import { CoordinatorInfoPopup } from "./CoordinatorInfoPopup";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import add_user_icon from "../../assets/add-user-svgrepo-com.svg";
import check_icon from "../../assets/checkbox-icon.svg";
import { useState } from "react";
import { Loading } from "../../components/Loading";
import { useMutation, useQueryClient } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import { DRIVER_INFO_QUERY_KEYS } from "./hooks";

function AssignLocationCheckbox({
  isSelected,
  isLoading,
}: {
  isSelected: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="relative flex h-full items-center justify-center">
      {isLoading ? (
        <div className="relative h-4 w-4">
          <Loading size="xsmall" thickness="thin" />
        </div>
      ) : (
        <RadixCheckbox.Root
          className="border-newLeafGreen bg-softGrayWhite flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 shadow-md"
          checked={isSelected}
        >
          <RadixCheckbox.Indicator>
            <img src={check_icon} alt="" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      )}
    </div>
  );
}
function processRestrictedLocations(
  neighborhoods: string[],
  restrictedLocations: string[]
) {
  const restrictedLocationsSet = new Set(restrictedLocations);
  return (
    <div className="text-xs md:text-base">
      {neighborhoods.map((neigh, i) => {
        const className = restrictedLocationsSet.has(neigh)
          ? "text-red-500"
          : "";
        return (
          <p key={i} className={className}>
            {neigh}
          </p>
        );
      })}
    </div>
  );
}
function processDropoffLocationsForTable(
  dropoffLocationsUIStateList: DropoffLocationUIState[],
  driver: ProcessedDriver,
  processedDropOffLocations: ProcessedDropoffLocation[]
) {
  return processedDropOffLocations.map((curLocation, i) => {
    return [
      curLocation.id, //id
      <AssignLocationCheckbox
        isSelected={dropoffLocationsUIStateList[i].isSelected}
        isLoading={dropoffLocationsUIStateList[i].isLoading}
      />,
      curLocation.siteName,
      curLocation.address,
      //curLocation.neighborhoods.join(", "),
      processRestrictedLocations(
        curLocation.neighborhoods,
        driver.restrictedLocations
      ),
      typeof curLocation.startTime === "string" ? curLocation.startTime : "N/A",
      typeof curLocation.endTime === "string" ? curLocation.endTime : "N/A",
      `${curLocation.deliveriesAssigned}/${curLocation.deliveriesNeeded}`,
    ];
  });
}
type DropoffLocationUIState = { isLoading: boolean; isSelected: boolean };
function getDropoffLocationsUIStateList(
  locations: ProcessedDropoffLocation[],
  driver: ProcessedDriver
): DropoffLocationUIState[] {
  const idsOfDropoffLocationsAssignedToThisDriver = new Set(
    driver.dropoffLocations
  );
  return locations.map((loc) => ({
    isLoading: false,
    isSelected: idsOfDropoffLocationsAssignedToThisDriver.has(loc.id),
  }));
}

function updateDropoffLocationsUIStateList(
  prevUIStateList: DropoffLocationUIState[],
  idx: number,
  field: keyof DropoffLocationUIState,
  newState: boolean
) {
  const newLocationsUIStateList = [...prevUIStateList];
  newLocationsUIStateList[idx][field] = newState;
  return newLocationsUIStateList;
}
export function NewAssignLocations({
  driver,
  dropoffLocations,
}: {
  driver: ProcessedDriver;
  dropoffLocations: ProcessedDropoffLocation[];
}) {
  const [dropoffLocationsUIStateList, setDropoffLocationsUIStateList] =
    useState<DropoffLocationUIState[]>(
      getDropoffLocationsUIStateList(dropoffLocations, driver)
    );
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const assignLocationMutation = useMutation({
    mutationFn: async ({ id, idx }: { id: string; idx: number }) => {
      //Payload to update this driver's locations has to contain all of the selected locations for this driver.
      //If the location was previously selected, then that means we are unassigning that location to this driver.
      //If the location was NOT previously selected, then that means we are assigning that location to this driver.
      const locationIds = dropoffLocationsUIStateList[idx].isSelected
        ? []
        : [id];
      //Add the rest of the locations for this driver to the payload
      for (let i = 0; i < dropoffLocationsUIStateList.length; i++) {
        if (i != idx && dropoffLocationsUIStateList[i].isSelected) {
          locationIds.push(dropoffLocations[i].id);
        }
      }
      //Set the state for the newly selected/unselected location to loading
      setDropoffLocationsUIStateList((prev) =>
        updateDropoffLocationsUIStateList(prev, idx, "isLoading", true)
      );
      const url = `/api/volunteers/drivers/assign-location/${driver.id}`;
      const resp = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationIds: locationIds }),
      });
      if (!resp.ok) {
        throw new Error("Failed to assign driver location");
      }
    },
    onSuccess: (data, { id, idx }) => {
      //Set the state for the newly selected/unselected location to not loading
      const uiStateWithUpdatedLoading = updateDropoffLocationsUIStateList(
        dropoffLocationsUIStateList,
        idx,
        "isLoading",
        false
      );
      //optimistically update selection state
      const uiStateWithUpdatedLoadingAndSelection =
        updateDropoffLocationsUIStateList(
          uiStateWithUpdatedLoading,
          idx,
          "isSelected",
          !uiStateWithUpdatedLoading[idx].isSelected
        );
      setDropoffLocationsUIStateList(uiStateWithUpdatedLoadingAndSelection); //Why did I do this?

      //Invalidate driver info
      queryClient.invalidateQueries(DRIVER_INFO_QUERY_KEYS.fetchDriverInfo);
      toastNotify(
        `Location ${
          uiStateWithUpdatedLoadingAndSelection[idx].isSelected
            ? "assigned"
            : "unassigned"
        }`,
        "success"
      );
    },
    onError: (error, { id, idx }) => {
      console.error(error);
      //Set state back to not loading
      setDropoffLocationsUIStateList((prev) =>
        updateDropoffLocationsUIStateList(prev, idx, "isLoading", false)
      );
      toastNotify("Unable to assign location", "failure");
    },
  });
  return (
    <Popup
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] h-full w-full -translate-x-1/2 -translate-y-1/2  px-3 py-4",
        "md:h-[90%] md:w-[80%] md:rounded-lg md:py-6 md:px-8"
      )}
      trigger={
        <div className="flex items-center justify-center hover:cursor-pointer hover:opacity-80">
          <img
            src={add_user_icon}
            className="w-8 md:w-12"
            alt="Assign Location"
          />
        </div>
      }
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
        <Modal.Title className="text-newLeafGreen flex h-[5%] items-center font-bold lg:text-xl">
          Assign {driver.firstName} {driver.lastName}
        </Modal.Title>
        <div className="mb-2 flex h-[5%] gap-2 md:m-0">
          {" "}
          {/* Kinda weird */}
          <p className="text-sm italic lg:text-base">Deliveries: </p>
          <h2 className="text-newLeafGreen text-sm font-semibold lg:text-base">
            {driver.dropoffLocations.length}/{driver.deliveryCount}
          </h2>
        </div>
        <div className="h-[90%]">
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
              dropoffLocationsUIStateList,
              driver,
              dropoffLocations
            )}
          />
          {/* </div> */}
        </div>
      </>
    </Popup>
  );
}
