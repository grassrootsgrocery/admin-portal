import { useState } from "react";
import { ProcessedDriver, ProcessedDropoffLocation } from "../../types";
import { useMutation } from "react-query";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
//Components
import { Loading } from "../../components/Loading";
//Assets
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import check_icon from "../../assets/checkbox-icon.svg";
//Utils
import { API_BASE_URL } from "../../httpUtils";
import { toastNotify } from "../../uiUtils";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
interface DropdownItemProps {
  label: string;
  selected: boolean;
  mutationFn: any;
  onSuccess: () => void;
  onError: () => void;
}
const AssignLocationDropdownItem: React.FC<DropdownItemProps> = (
  props: DropdownItemProps
) => {
  const { label, selected, mutationFn, onSuccess, onError } = props;
  const [isChecked, setIsChecked] = useState(selected);
  const assign = useMutation({
    mutationFn: mutationFn,
    onSuccess(data, variables, context) {
      setIsChecked((prevVal) => !prevVal);
      onSuccess();
    },
    onError(error, variables, context) {
      console.error(error);
      onError();
    },
  });
  return (
    <DropdownMenu.Item
      className={`flex select-none items-center justify-between rounded-lg border border-newLeafGreen p-2 font-semibold shadow-md outline-none hover:cursor-pointer ${
        isChecked
          ? "bg-newLeafGreen text-white"
          : "text-newLeafGreen data-[highlighted]:-m-[1px] data-[selected]:cursor-pointer data-[highlighted]:cursor-pointer data-[highlighted]:border-2 data-[highlighted]:brightness-110"
      }`}
      onSelect={(e) => {
        e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        assign.mutate();
      }}
    >
      <div className="flex flex-wrap">{label}</div>
      {/* TODO: This can probably use the HttpCheckbox component that is in VolunteersTable */}
      {assign.isLoading ? (
        <div className="relative h-4 w-4">
          <Loading size="xsmall" thickness="thin" />
        </div>
      ) : (
        <RadixCheckbox.Root
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md"
          checked={isChecked}
        >
          <RadixCheckbox.Indicator>
            <img src={check_icon} alt="" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      )}
    </DropdownMenu.Item>
  );
};

//TODO: The whole way that we are doing selection needs to be rethought
function getSelectedLocations(
  locations: ProcessedDropoffLocation[],
  driver: ProcessedDriver
): boolean[] {
  const output = Array(locations.length).fill(false);
  for (let i = 0; i < locations.length; i++) {
    if (driver.dropoffLocations.some((locId) => locId === locations[i].id)) {
      output[i] = true;
    }
  }
  return output;
}
interface Props {
  locations: ProcessedDropoffLocation[];
  driver: ProcessedDriver;
  refetchDrivers: any;
}

//TODO: Error handling on assigning a dropoff location doesn't work
export const AssignLocationDropdown: React.FC<Props> = ({
  locations,
  driver,
  refetchDrivers,
}) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" />;
  }
  const [selectedLocations, setSelectedLocations] = useState<boolean[]>(
    getSelectedLocations(locations, driver)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const assignLocation = (id: string, idx: number) => async () => {
    const locationIds = selectedLocations[idx] ? [] : [id];
    for (let i = 0; i < selectedLocations.length; i++) {
      if (i != idx && selectedLocations[i]) {
        locationIds.push(locations[i].id);
      }
    }
    const url = `${API_BASE_URL}/api/volunteers/drivers/assign-location/${driver.id}`;
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ locationIds: locationIds }),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json();
  };

  return (
    <DropdownMenu.Root
      open={isDropdownOpen}
      onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}
      modal={false}
    >
      <DropdownMenu.Trigger asChild>
        <div className="flex w-80 select-none items-center justify-between rounded-lg border-2 bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110">
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
          className="z-20 flex h-64 w-80 flex-col gap-3 overflow-auto rounded-lg border border-newLeafGreen bg-white px-4 py-2"
          avoidCollisions
          align="start"
        >
          {locations.map((item, i) => (
            <AssignLocationDropdownItem
              key={item.id}
              selected={selectedLocations[i]}
              label={item.dropOffLocation}
              mutationFn={assignLocation(item.id, i)}
              onSuccess={() => {
                const newSelectedLocations = [...selectedLocations];
                newSelectedLocations[i] = !selectedLocations[i];
                setSelectedLocations(newSelectedLocations);
                refetchDrivers();
                toastNotify(
                  `Location ${
                    newSelectedLocations[i] ? "assigned" : "unassigned"
                  }`,
                  "success"
                );
              }}
              onError={() => {
                toastNotify("Unable to assign location", "failure");
              }}
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
