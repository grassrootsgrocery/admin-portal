import { useEffect, useRef, useState } from "react";
import chevron_up from "../assets/chevron-up.svg";
import chevron_down from "../assets/chevron-down.svg";
import { AirtableResponse, Record, ScheduledSlot } from "../types";

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
  item: string;
  selected: boolean;
}
const FilterItem: React.FC<FilterItemProps> = (props: FilterItemProps) => {
  const { item, selected, onSelect } = props;
  return (
      <li
        className={`rounded-lg border border-pumpkinOrange px-2 font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
          selected ? "bg-pumpkinOrange text-white" : "bg-white text-pumpkinOrange"
        }`}
        onClick={onSelect}
      >
        {item}
      </li>
  );
};

interface FilterButtonProps {
  onSelect: () => void;
  item: string;
  selected: boolean;
}
const FilterButton: React.FC<FilterButtonProps> = (props: FilterButtonProps) => {
  const { item, selected, onSelect } = props;
  
  return selected ? (
    <div className="flex rounded-full bg-newLeafGreen p-1 px-3 h-8 w-fit overflow-y-clip font-semibold text-white transition-all 
      hover:shadow-lg hover:shadow-newLeafGreen" onClick={onSelect}>
      <button> {item} </button>
      <h3 className="pl-4"> X </h3>
    </div>
  ) : null;
};

interface Props {
  filters: { label: string; filter: (e: Record<ScheduledSlot>) => boolean }[];
  ss: Record<ScheduledSlot>[];
}

export const Dropdown: React.FC<Props> = ({ filters, ss }) => {
  const [selectedFilters, setSelectedFilters] = useState(
    Array(filters.length).fill(false)
  );
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(ss);
  const [dropdownRef] = useClickOutside(() => setOpen(false));

  useEffect(() => {
    let filteredItems = ss;
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

  return (
    <div>
    <div className="flex h-fit items-start gap-8">
      <div
        className="rounded-lg border bg-softBeige shadow-md "
        ref={dropdownRef}
      >
        <h1
          className={
            "flex w-40 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110" +
            (open ? " brightness-110" : "")
          }
          onClick={() => setOpen(!open)}
        >
          Filter <img src={open ? chevron_up : chevron_down} alt="ugh" />
        </h1>
        {
          <ul className={`flex flex-col gap-2 ${open ? "py-2 px-1" : ""}`}>
            {open &&
              filters.map((item, i) => (
                <FilterItem
                  key={i}
                  selected={selectedFilters[i]}
                  onSelect={() => onFilterSelect(i)}
                  item={item.label}
                />
              ))}
          </ul>
        }
      </div>

        {/* Applied Filters Label */}
        <h1 className="text-xl font-semibold text-newLeafGreen"> Applied Filters: </h1>

        {
          <div className="flex w-1/3 overflow-x-scroll overscroll-x-auto items-start gap-4">
            {
              filters.map((item, i) => (
                <FilterButton
                  key={i}
                  selected={selectedFilters[i]}
                  onSelect={() => onFilterSelect(i)}
                  item={item.label}
                />
              ))}
          </div>
        }

        {/* Clear Filters button */}
      <button
            className="rounded-full bg-pumpkinOrange px-9 py-1 font-semibold text-white transition-all hover:shadow-lg hover:shadow-newLeafGreen"
            type="button"
          >
            Clear Filters
      </button>

      </div>

      <div className="h-screen z-0 flex grow flex-col self-stretch overflow-hidden border pr-2">
        <ul className="flex h-0 grow flex-col gap-4 overflow-auto rounded border border-pumpkinOrange bg-softBeige p-4">
          {filtered.map((scheduledSlot) => {
            return (
              <li
                key={scheduledSlot.id}
                className="rounded-lg border border-pumpkinOrange bg-white p-2 font-semibold text-pumpkinOrange shadow-sm shadow-pumpkinOrange transition-all hover:-translate-y-1 hover:cursor-pointer hover:shadow-md hover:shadow-pumpkinOrange hover:brightness-110"
              >
                {scheduledSlot.fields["First Name"]}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
