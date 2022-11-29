import { useEffect, useRef, useState } from "react";
import { ProcessedDropoffLocation } from "../types";
import { useMutation } from "react-query";
import chevron_up from "../assets/chevron-up.svg";
import chevron_down from "../assets/chevron-down.svg";
import * as Checkbox from "@radix-ui/react-checkbox";
import checkbox_icon from "../../assets/checkbox-icon.svg";

const key = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID_DEV = "app18BBTcWqsoNjb2";

//Taken from y-knot code base. Used to track click event outside of the dropdown.
const useClickOutside = (onClickOutside: () => void) => {
  const domNodeRef = useRef<any>(null);

  const clickedOutsideDomNodes = (e: any) => {
    return !domNodeRef.current || !domNodeRef.current.contains(e.target);
  };
  //Because I gave up on trying to get the types to work.
  const handleClick = (e: any) => {
    e.preventDefault();
    if (clickedOutsideDomNodes(e)) {
      onClickOutside();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return [domNodeRef];
};

interface FilterItemProps {
  onSelect: () => void;
  filterLabel: string;
  selected: boolean;
}
const FilterItem: React.FC<FilterItemProps> = (props: FilterItemProps) => {
  const { filterLabel, selected, onSelect } = props;
  return (
    <li
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-newLeafGreen px-2 text-left font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        selected ? "bg-newLeafGreen text-white" : "bg-white text-newLeafGreen"
      }`}
      onClick={onSelect}
    >
      <div className="w-10/12">{filterLabel}</div>
      <Checkbox.Root
        className={`ml-auto flex h-4 w-4 items-end justify-end rounded border border-newLeafGreen hover:brightness-110 ${
          selected ? "bg-white" : "bg-softGrayWhite"
        }`}
        checked={selected}
        id="c1"
      >
        <Checkbox.Indicator className="CheckboxIndicator">
          <img src={checkbox_icon} alt="" />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </li>
  );
};

interface Props {
  filters: { label: string }[];
  locations: ProcessedDropoffLocation[];
  driverId: string;
}

export const Dropdown: React.FC<Props> = ({ filters, locations, driverId }) => {
  const [selectedFilters, setSelectedFilters] = useState(
    Array(filters.length).fill(false)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filtered, setFiltered] = useState(locations);
  const [dropdownRef] = useClickOutside(() => setIsDropdownOpen(false));

  useEffect(() => {
    let filteredItems = locations;
    setFiltered(filteredItems);
  }, selectedFilters);

  const onFilterSelect = (i: number) => {
    let newSelectedFilters = [...selectedFilters];
    newSelectedFilters[i] = !selectedFilters[i];
    setSelectedFilters(newSelectedFilters);
    let ids: string[] = [];
    newSelectedFilters.forEach((item, idx) => {
      if (newSelectedFilters[idx] == true) {
        ids.push(locations[idx].id);
      }
    });
    assignLocation.mutate(ids);
  };

  const assignLocation = useMutation({
    mutationFn: async (ids: string[]) => {
      const data = {
        records: [
          {
            id: driverId,
            fields: { "📍 Drop off location": ids },
          },
        ],
      };
      const json = JSON.stringify(data);
      const resp = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID_DEV}/%F0%9F%93%85%20Scheduled%20Slots`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: json,
        }
      );
      return resp.json();
    },
  });

  return (
    <div className="flex h-9 items-start gap-8">
      <div
        className={`flex flex-col items-start ${
          isDropdownOpen ? "z-50" : "z-0"
        }`}
        ref={dropdownRef}
      >
        {/* Dropdown */}
        <div className="relative">
          <h1
            className={
              "relative flex w-52 select-none items-center justify-between rounded-lg border bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110" +
              (isDropdownOpen ? " z-50 brightness-110" : "z-0")
            }
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Assign
            <img
              className="w-2 md:w-3"
              src={isDropdownOpen ? chevron_up : chevron_down}
              alt="chevron-icon"
            />
          </h1>
          {
            <ul
              className={`absolute flex flex-col gap-2 rounded-lg border bg-white shadow-md  ${
                isDropdownOpen
                  ? "hide-scroll z-50 h-36 overflow-y-scroll py-2 px-2"
                  : "z-0"
              }`}
            >
              {isDropdownOpen &&
                filters.map((item, i) => (
                  <FilterItem
                    key={i}
                    selected={selectedFilters[i]}
                    onSelect={() => onFilterSelect(i)}
                    filterLabel={item.label}
                  />
                ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
};
