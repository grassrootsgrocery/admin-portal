import { useState } from "react";
import { ProcessedDropoffLocation } from "../../types";
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
interface DropdownItemProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  mutationFn: any;
  onSuccess: () => void;
  onError: () => void;
}
const AssignLocationDropdownItem: React.FC<DropdownItemProps> = (
  props: DropdownItemProps
) => {
  const { label, selected, mutationFn, onError, onSuccess } = props;
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
      className={`flex select-none items-center justify-between rounded-lg border border-newLeafGreen p-2 font-semibold shadow-md outline-none ${
        selected
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

interface Props {
  locations: ProcessedDropoffLocation[];
  driverId: string;
}

export const AssignLocationDropdown: React.FC<Props> = ({
  locations,
  driverId,
}) => {
  const [selectedLocations, setSelectedLocations] = useState<boolean[]>(
    Array(locations.length).fill(false)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const assignLocation = (id: string) => async () => {
    const locationIds = [id];
    for (let i = 0; i < selectedLocations.length; i++) {
      if (selectedLocations[i]) {
        locationIds.push(locations[i].id);
      }
    }
    const url = `${API_BASE_URL}/api/volunteers/drivers/assign-location/${driverId}`;
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
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
          className="flex h-64 w-80 flex-col gap-3 overflow-auto rounded-lg border border-newLeafGreen bg-white px-4 py-2"
          avoidCollisions
          align="start"
        >
          {locations.map((item, i) => (
            <AssignLocationDropdownItem
              key={item.id}
              onSelect={() => {
                const newSelectedLocations = [...selectedLocations];
                newSelectedLocations[i] = !selectedLocations[i];
                setSelectedLocations(newSelectedLocations);
              }}
              selected={selectedLocations[i]}
              label={item.dropOffLocation}
              mutationFn={assignLocation(item.id)}
              onSuccess={() => toastNotify("Location assigned", "success")}
              onError={() =>
                toastNotify("Unable to assign location", "failure")
              }
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
