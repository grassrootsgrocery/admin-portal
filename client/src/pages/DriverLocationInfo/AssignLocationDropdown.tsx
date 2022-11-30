import { useEffect, useRef, useState } from "react";
import { ProcessedDropoffLocation } from "../../types";
import { useMutation } from "react-query";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
//Assets
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import checkbox_icon from "../../assets/checkbox-icon.svg";
//Utils
import { API_BASE_URL, applyPatch } from "../../httpUtils";
import { toastNotify, useClickOutside } from "../../uiUtils";
import { Loading } from "../../components/Loading";

interface DropdownItemProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  mutationFn: any;
}
const DropdownItem: React.FC<DropdownItemProps> = (
  props: DropdownItemProps
) => {
  const { label, selected, onSelect, mutationFn } = props;
  return (
    <li
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-newLeafGreen px-2 text-left font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        selected ? "bg-newLeafGreen text-white" : "bg-white text-newLeafGreen"
      }`}
      onClick={onSelect}
    >
      <div className="w-10/12">{label}</div>

      <div className="relative flex h-full items-center justify-center">
        {httpRequest.status === "loading" ? (
          <Loading size="xsmall" thickness="thin" />
        ) : (
          <RadixCheckbox.Root
            className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
            checked={selected}
            onClick={() => httpRequest.mutate()}
          >
            <RadixCheckbox.Indicator className="CheckboxIndicator">
              <img src={check_icon} alt="" />
            </RadixCheckbox.Indicator>
          </RadixCheckbox.Root>
        )}
      </div>
    </li>
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
  const [dropdownRef] = useClickOutside(() => setIsDropdownOpen(false));

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
    <div className={`r relative ${isDropdownOpen ? "z-50" : "z-0"}`}>
      {/* Dropdown */}

      {/* Dropdown title & icon */}
      <h1
        className={
          "g relative flex select-none items-center justify-between rounded-lg border bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110" +
          (isDropdownOpen ? " z-50 brightness-110" : "z-0")
        }
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        ref={dropdownRef}
      >
        Assign
        <img
          className="w-2 md:w-3"
          src={isDropdownOpen ? chevron_up : chevron_down}
          alt="chevron-icon"
        />
      </h1>
      {/* Dropdown items */}
      {
        <ul
          className={`r absolute flex w-44 flex-col gap-2 rounded-lg border bg-white shadow-md ${
            isDropdownOpen
              ? "hide-scroll z-50 h-36 overflow-y-scroll py-2 px-2"
              : "z-0"
          }`}
        >
          {isDropdownOpen &&
            locations.map((item, i) => (
              <DropdownItem
                key={i}
                selected={selectedLocations[i]}
                label={item.dropOffLocation}
                mutationFn={assignLocation(item.id)}
                onSelect={() => {
                  const newSelectedLocations = [...selectedLocations];
                  newSelectedLocations[i] = !selectedLocations[i];
                  setSelectedLocations(newSelectedLocations);
                }}
              />
            ))}
        </ul>
      }
    </div>
  );
};
