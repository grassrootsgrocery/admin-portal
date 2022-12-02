import { useState } from "react";
import { ProcessedDropoffLocation } from "../../types";
import { useMutation } from "react-query";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
//Assets
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import check_icon from "../../assets/checkbox-icon.svg";
//Utils
import { API_BASE_URL, applyPatch } from "../../httpUtils";
import { toastNotify, useClickOutside } from "../../uiUtils";
import { Loading } from "../../components/Loading";
import "./assign.css";
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
  const { label, selected, onSelect, mutationFn, onError, onSuccess } = props;
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
      className={`flex max-w-[400px] select-none items-center justify-between  rounded-lg border border-newLeafGreen p-2 font-semibold shadow-md outline-none hover:cursor-pointer ${
        selected
          ? "bg-newLeafGreen text-white"
          : "text-newLeafGreen data-[selected]:cursor-pointer data-[highlighted]:cursor-pointer data-[highlighted]:bg-newLeafGreen data-[highlighted]:bg-opacity-80 data-[highlighted]:text-white"
      }`}
      onSelect={(e) => {
        e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        onSelect();
      }}
    >
      {/* <div
                className={`flex w-80 shrink-0 items-center gap-1 rounded-lg border border-newLeafGreen px-2 py-2 text-left font-semibold shadow-md hover:cursor-pointer hover:brightness-110  ${
                  selectedLocations[i]
                    ? "bg-newLeafGreen text-white"
                    : "bg-white text-newLeafGreen"
                }`}
              > */}
      <div className="flex flex-wrap">{label}</div>
      {assign.isLoading ? (
        <Loading size="xsmall" thickness="thin" />
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
  //  return (
  //    <li
  //      className={`flex w-80 shrink-0 items-center gap-1 rounded-lg border border-newLeafGreen px-2 py-2 text-left font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
  //        selected ? "bg-newLeafGreen text-white" : "bg-white text-newLeafGreen"
  //      }`}
  //      onClick={onSelect}
  //    >
  //      <div className="w-10/12">{label}</div>
  //
  //      <div className="relative flex h-full items-center justify-center">
  //        {mutationFn.status === "loading" ? (
  //          <Loading size="xsmall" thickness="thin" />
  //        ) : (
  //          <RadixCheckbox.Root
  //            className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md"
  //            checked={selected}
  //            onClick={() => mutationFn.mutate()}
  //          >
  //            <RadixCheckbox.Indicator>
  //              <img src={check_icon} alt="" />
  //            </RadixCheckbox.Indicator>
  //          </RadixCheckbox.Root>
  //        )}
  //      </div>
  //    </li>
  //  );
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

  // return (
  //   <div
  //     className={`relative ${isDropdownOpen ? "z-50" : "z-0"}`}
  //     ref={dropdownRef}
  //   >
  //     {/* Dropdown */}

  //     {/* Dropdown title & icon */}
  //     <h1
  //       className={
  //         "relative flex select-none items-center justify-between rounded-lg border-2 bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110" +
  //         (isDropdownOpen ? " z-50 brightness-110" : "z-0")
  //       }
  //       onClick={() => setIsDropdownOpen(!isDropdownOpen)}
  //     >
  //       Assign
  //       <img
  //         className="w-2 md:w-3"
  //         src={isDropdownOpen ? chevron_up : chevron_down}
  //         alt="chevron-icon"
  //       />
  //     </h1>
  //     {/* Dropdown items */}
  //     <ul
  //       className={`w-88 border-t-3 absolute flex -translate-y-1 -translate-x-28 flex-col gap-2 rounded-lg border border-newLeafGreen bg-white shadow-md ${
  //         isDropdownOpen
  //           ? "hide-scroll z-50 h-80 overflow-y-scroll  py-2 px-3"
  //           : "z-0"
  //       }`}
  //     >
  //       {isDropdownOpen &&
  //         locations.map((item, i) => (
  //           <DropdownItem
  //             key={i}
  //             selected={selectedLocations[i]}
  //             label={item.dropOffLocation}
  //             mutationFn={assignLocation(item.id)}
  //             onSelect={() => {
  //               const newSelectedLocations = [...selectedLocations];
  //               newSelectedLocations[i] = !selectedLocations[i];
  //               setSelectedLocations(newSelectedLocations);
  //             }}
  //           />
  //         ))}
  //     </ul>
  //   </div>
  // );
  return (
    <DropdownMenu.Root
      open={isDropdownOpen}
      onOpenChange={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <DropdownMenu.Trigger asChild>
        <div className="flex w-full select-none items-center justify-between rounded-lg border-2 bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110">
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
          className="flex h-64 flex-col gap-3 overflow-auto rounded-lg border border-newLeafGreen bg-white px-4 py-2 "
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
                assignLocation(item.id);
              }}
              selected={selectedLocations[i]}
              label={item.dropOffLocation}
              mutationFn={assignLocation(item.id)}
              onSuccess={() => {}}
              onError={() => {}}
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
