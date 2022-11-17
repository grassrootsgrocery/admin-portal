import { useEffect, useRef, useState } from "react";
import chevron_up from "../assets/chevron-up.svg";
import chevron_down from "../assets/chevron-down.svg";
import x from "../assets/x.svg";
import { Record, ScheduledSlot } from "../types";

import "./VolunteersTable.css";

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
      className={`rounded-lg border border-pumpkinOrange px-2 font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        selected ? "bg-pumpkinOrange text-white" : "bg-white text-pumpkinOrange"
      }`}
      onClick={onSelect}
    >
      {filterLabel}
    </li>
  );
};

interface FilterButtonProps {
  onSelect: () => void;
  filterLabel: string;
  selected: boolean;
}
const FilterButton: React.FC<FilterButtonProps> = ({
  filterLabel,
  selected,
  onSelect,
}: FilterButtonProps) => {
  if (!selected) {
    return null;
  }

  return (
    <button
      className="flex min-w-fit shrink-0 items-center gap-1 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:shadow-md hover:shadow-newLeafGreen sm:text-sm md:text-base"
      onClick={onSelect}
    >
      <p className="text-sm">{filterLabel}</p>
      <img className="w-3 sm:w-4" src={x} alt="x" />
    </button>
  );
};

interface Props {
  filters: { label: string; filter: (e: Record<ScheduledSlot>) => boolean }[];
  scheduledSlots: Record<ScheduledSlot>[];
}

export const VolunteersTable: React.FC<Props> = ({
  filters,
  scheduledSlots,
}) => {
  const [selectedFilters, setSelectedFilters] = useState(
    Array(filters.length).fill(false)
  );
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(scheduledSlots);
  const [dropdownRef] = useClickOutside(() => setOpen(false));

  useEffect(() => {
    let filteredItems = scheduledSlots;
    for (let i = 0; i < selectedFilters.length; i++) {
      if (selectedFilters[i]) {
        filteredItems = filteredItems.filter(filters[i].filter);
      }
    }
    setFiltered(filteredItems);
  }, selectedFilters);

  const onFilterSelect = (i: number) => {
    let newSelectedFilters = [...selectedFilters];
    newSelectedFilters[i] = !selectedFilters[i];
    setSelectedFilters(newSelectedFilters);
  };

  const label = "text-sm md:text-base lg:text-xl";
  const labelBold =
    "text-sm font-semibold text-newLeafGreen md:text-base lg:text-xl";

  return (
    <div className="lg:py-10">
      {/* Filtering */}
      <div
        className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-4"
        ref={dropdownRef}
      >
        {/* Filter dropdown */}
        <div className="relative z-50">
          <h1
            className={`relative flex w-40 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:brightness-110 md:text-base ${
              open ? " brightness-110" : ""
            }`}
            onClick={() => setOpen(!open)}
          >
            Filter{" "}
            <img
              className="w-2 md:w-3"
              src={open ? chevron_up : chevron_down}
              alt="^"
            />
          </h1>
          {
            <ul
              className={`absolute flex flex-col gap-2 rounded-lg border bg-softBeige shadow-md ${
                open ? "py-2 px-1" : ""
              }`}
            >
              {open &&
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

        {/* Applied Filters Label */}
        <h1 className="shrink-0 font-semibold text-newLeafGreen lg:text-lg">
          Applied Filters:
        </h1>

        {/* Buttons that pops up after filter is clicked */}
        <div className="flex grow items-start gap-4 overflow-x-auto overscroll-x-auto py-1 px-2">
          {filters.map((item, i) => (
            <FilterButton
              key={i}
              selected={selectedFilters[i]}
              onSelect={() => onFilterSelect(i)}
              filterLabel={item.label}
            />
          ))}
        </div>

        {/* Clear Filters button */}
        <button
          className="shrink-0 rounded-full bg-pumpkinOrange px-4 text-base font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-10 md:py-1"
          type="button"
          onClick={() => setSelectedFilters(Array(filters.length).fill(false))}
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="z-10 min-h-screen lg:px-0 lg:py-16">
        <table className="border-4 border-softGrayWhite">
          <thead>
            <tr>
              <th>#</th>
              <th>First</th>
              <th>Last</th>
              <th>Time</th>
              <th>Participant Type</th>
              <th>Confirmed</th>
              <th>Special Group</th>
              <th>Delivery Type</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((scheduledSlot, idx) => {
              return (
                <tr key={scheduledSlot.id}>
                  <td>{idx + 1}</td>
                  <td>{scheduledSlot.fields["First Name"]}</td>
                  <td>{scheduledSlot.fields["Last Name"]}</td>
                  <td>
                    {scheduledSlot.fields["Correct slot time"]["error"]
                      ? "None"
                      : scheduledSlot.fields["Correct slot time"]}
                  </td>
                  <td>{scheduledSlot.fields["Type"].length}</td>
                  <td>{scheduledSlot.fields["Confirmed?"] ? "Yes" : "No"}</td>
                  <td>{scheduledSlot.fields["Volunteer Group (for MAKE)"]}</td>
                  <td>IDK</td>
                  <td>{scheduledSlot.fields["Email"]}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    </div>
  );
};
