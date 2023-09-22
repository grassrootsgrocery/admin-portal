import { useState } from "react";
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
import { useMutation, useQueryClient } from "react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
//Components
import { Loading } from "../../components/Loading";
//Assets
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import check_icon from "../../assets/checkbox-icon.svg";
//Utils
import { cn, toastNotify } from "../../utils/ui";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { DRIVER_INFO_QUERY_KEYS } from "./hooks";

function AssignLocationDropdownItem({
  label,
  selected,
  isLoading,
  onAssign,
}: {
  label: string;
  selected: boolean;
  isLoading: boolean;
  onAssign: () => void;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "border-newLeafGreen flex select-none items-center justify-between rounded-lg  border",
        "p-2 font-semibold shadow-md outline-none hover:cursor-pointer data-[highlighted]:-m-[1px] data-[selected]:cursor-pointer",
        "data-[highlighted]:cursor-pointer data-[highlighted]:border-2 data-[highlighted]:brightness-110",
        selected
          ? "bg-newLeafGreen data-[highlighted]:border-softBeige text-white"
          : "text-newLeafGreen"
      )}
      onSelect={(e) => {
        e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        onAssign();
      }}
    >
      <div className="flex flex-wrap">{label}</div>
      {isLoading ? (
        <div className="relative h-4 w-4">
          <Loading size="xsmall" thickness="thin" />
        </div>
      ) : (
        <RadixCheckbox.Root
          className="border-newLeafGreen bg-softGrayWhite flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 shadow-md"
          checked={selected}
        >
          <RadixCheckbox.Indicator>
            <img src={check_icon} alt="" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      )}
    </DropdownMenu.Item>
  );
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

export const AssignLocationDropdown: React.FC<{
  locations: ProcessedDropoffLocation[];
  driver: ProcessedDriver;
}> = ({ locations, driver }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }

  const queryClient = useQueryClient();
  const [dropoffLocationsUIStateList, setDropoffLocationsUIStateList] =
    useState<DropoffLocationUIState[]>(
      getDropoffLocationsUIStateList(locations, driver)
    );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
          locationIds.push(locations[i].id);
        }
      }
      //Set the state for the newly selected/unselected location to loading
      setDropoffLocationsUIStateList((prev) =>
        updateDropoffLocationsUIStateList(prev, idx, "isLoading", true)
      );
      const url = `/api/volunteers/drivers/assign-location/${driver.id}`;
      await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationIds: locationIds }),
      });
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
    <DropdownMenu.Root
      open={isDropdownOpen}
      onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}
      modal={false}
    >
      <DropdownMenu.Trigger asChild>
        <div className="bg-newLeafGreen flex w-80 select-none items-center justify-between rounded-lg border-2 px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110">
          Assign Locations
          <img
            className="w-2 md:w-3"
            src={isDropdownOpen ? chevron_up : chevron_down}
            alt="chevron-icon"
          />
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="border-newLeafGreen z-20 flex h-64 w-80 flex-col gap-3 overflow-auto rounded-lg border bg-white px-4 py-2"
          avoidCollisions
          align="start"
        >
          {locations.map((item, i) => (
            <AssignLocationDropdownItem
              key={item.id}
              label={item.siteName}
              selected={dropoffLocationsUIStateList[i].isSelected}
              isLoading={dropoffLocationsUIStateList[i].isLoading}
              onAssign={() =>
                assignLocationMutation.mutate({ id: item.id, idx: i })
              }
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
