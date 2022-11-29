import { useEffect, useRef, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import toast from "react-hot-toast";
import { API_BASE_URL, applyPatch } from "../../httpUtils";
//Types
import { Record, ScheduledSlot } from "../../types";
//Assets
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import x from "../../assets/x.svg";

/*
TODO: There is a lot of stuff going on in this component, and we should perhaps look into refactoring at some point. 
*/

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

function toastNotify(message: string, isSuccess: boolean) {
  toast(message, {
    duration: 3000,
    position: "top-center",
    icon: isSuccess ? "✅" : "❌",
    ariaProps: {
      role: "status",
      "aria-live": "polite",
    },
  });
}

interface DropdownFilterOption {
  label: string;
  isSelected: boolean;
  filter: (e: Record<ScheduledSlot>) => boolean;
}
function createDropdownFilters(scheduledSlots: Record<ScheduledSlot>[]) {
  let dropdownFilters = [
    {
      label: "Confirmed",
      isSelected: false,
      filter: (ss: Record<ScheduledSlot>) => ss.fields["Confirmed?"],
    },
    {
      label: "Not Confirmed",
      isSelected: false,
      filter: (ss: Record<ScheduledSlot>) => !ss.fields["Confirmed?"],
    },
    {
      label: "Only Packers",
      isSelected: false,
      filter: (ss: Record<ScheduledSlot>) =>
        ss.fields.Type.includes("Packer") && !ss.fields.Type.includes("Driver"),
    },
    {
      label: "Only Drivers",
      isSelected: false,
      filter: (ss: Record<ScheduledSlot>) =>
        ss.fields.Type.includes("Driver") &&
        !ss.fields.Type.includes("Distributor"),
    },
    {
      label: "Packers & Drivers",
      isSelected: false,
      filter: (ss: Record<ScheduledSlot>) =>
        ss.fields.Type.includes("Distributor") &&
        ss.fields.Type.includes("Driver"),
    },
  ];

  let specialGroupsList: string[] = [];
  scheduledSlots.forEach((ss) => {
    let specialGroup = ss.fields["Volunteer Group (for MAKE)"];

    // Check for a unique special group
    if (specialGroup && !specialGroupsList.includes(specialGroup)) {
      specialGroupsList.push(specialGroup);

      // Add special group as a filter
      let groupFilter = {
        label: specialGroup,
        isSelected: false,
        filter: (ss: Record<ScheduledSlot>) =>
          ss.fields["Volunteer Group (for MAKE)"] === specialGroup,
      };
      dropdownFilters.push(groupFilter);
    }
  });
  return dropdownFilters;
}

interface Props {
  scheduledSlots: Record<ScheduledSlot>[];
  refetchVolunteers: () => void;
}
export const VolunteersTable: React.FC<Props> = ({
  scheduledSlots,
  refetchVolunteers,
}) => {
  const [filters, setFilters] = useState<DropdownFilterOption[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filtered, setFiltered] = useState(scheduledSlots);
  const [dropdownRef] = useClickOutside(() => setIsFilterDropdownOpen(false));

  //Create filters on component mount
  useEffect(() => {
    let dropdownFilters = createDropdownFilters(scheduledSlots);
    setFilters(dropdownFilters);
  }, []);

  //Filter items on filter selection
  useEffect(() => {
    let filteredItems = scheduledSlots;
    console.log("ss", scheduledSlots);
    for (let i = 0; i < filters.length; i++) {
      if (filters[i].isSelected) {
        filteredItems = filteredItems.filter(filters[i].filter);
      }
    }
    setFiltered(filteredItems);
  }, [filters, scheduledSlots]);

  const onFilterSelect = (i: number) => {
    let newSelectedFilters = [...filters];
    newSelectedFilters[i] = {
      ...filters[i],
      isSelected: !filters[i].isSelected,
    };
    setFilters(newSelectedFilters);
  };

  //Takes in scheduledSlots array and formats data for DataTable component
  function processScheduledSlotsForTable(
    scheduledSlots: Record<ScheduledSlot>[]
  ): (string | number | JSX.Element)[][] {
    //Replace the word "Distributor" with "Packer" in the type array
    function getParticipantType(type: string[]) {
      const typeCopy = [...type];
      for (let i = 0; i < typeCopy.length; i++) {
        typeCopy[i] = typeCopy[i].replace("Distributor", "Packer");
      }
      typeCopy.sort();
      let typeLabel = typeCopy[0];
      if (typeCopy.length === 2) {
        typeLabel += " & " + typeCopy[1];
      }
      return typeLabel;
    }

    function getTimeSlot(timeslot: string) {
      const optionsTime = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      } as const;
      return new Date(timeslot).toLocaleString("en-US", optionsTime);
    }

    let rows = [];
    for (let i = 0; i < scheduledSlots.length; i++) {
      const ss = scheduledSlots[i];
      const first = ss.fields["First Name"] || "";
      const last = ss.fields["Last Name"] || "";

      let curRow = [
        /* id */
        ss.id,
        /* # */
        i + 1,
        /* First Name */
        first,
        /* Last Name */
        last,
        /* Time Slot */
        ss.fields["Correct slot time"]["error"]
          ? "Error!"
          : getTimeSlot(ss.fields["Correct slot time"]),
        /* Participant Type */
        getParticipantType(ss.fields["Type"]),
        /* Confirmed Checkbox */
        <HttpCheckbox
          checked={ss.fields["Confirmed?"]}
          mutationFn={applyPatch(
            `${API_BASE_URL}/api/volunteers/confirm/${ss.id}`,
            { newConfirmationStatus: !ss.fields["Confirmed?"] }
          )}
          onSuccess={() => {
            const toastMessage = `${first} ${last} ${
              ss.fields["Confirmed?"] ? "unconfirmed" : "confirmed"
            }`;
            refetchVolunteers();
            toastNotify(toastMessage, true);
          }}
          onError={() => toastNotify("Unable to confirm volunteer", false)}
        />,
        /* Not Going Checkbox */
        <HttpCheckbox
          checked={ss.fields["Can't Come"]}
          mutationFn={applyPatch(
            `${API_BASE_URL}/api/volunteers/going/${ss.id}`,
            { newGoingStatus: !ss.fields["Can't Come"] }
          )}
          onSuccess={() => {
            const toastMessage = `${first} ${last} ${
              ss.fields["Can't Come"]
                ? "is able to volunteer"
                : "is unable to volunteer"
            }`;
            refetchVolunteers();
            toastNotify(toastMessage, true);
          }}
          onError={() => toastNotify("Unable to modify availability", false)}
        />,
        /* Special Group */
        ss.fields["Volunteer Group (for MAKE)"] || "N/A",
        /* Deliver Count */
        "IDK",
        /* TODO: Contact Modal */
        ss.fields["Email"],
      ];

      rows.push(curRow);
    }
    return rows;
  }

  // UI
  return (
    <div className="flex h-screen flex-col pt-6">
      {/* Filtering */}
      <div
        className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-4"
        ref={dropdownRef}
      >
        {/* Filter dropdown */}
        <div className="relative z-50">
          <h1
            className={`relative flex w-40 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:brightness-110 md:text-base ${
              isFilterDropdownOpen ? " brightness-110" : ""
            }`}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          >
            Filter
            <img
              className="w-2 md:w-3"
              src={isFilterDropdownOpen ? chevron_up : chevron_down}
              alt="chevron-icon"
            />
          </h1>
          {/* Filter options */}
          {
            <ul
              className={`absolute flex flex-col gap-2 rounded-lg border bg-softBeige shadow-md ${
                isFilterDropdownOpen ? "py-2 px-1" : ""
              }`}
            >
              {isFilterDropdownOpen &&
                filters.map((item, i) => (
                  <FilterItem
                    key={i}
                    selected={item.isSelected}
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
        <div className="scrollbar-thin flex grow items-start gap-4 overflow-x-auto overscroll-x-auto py-1 px-2">
          {filters.map((item, i) => (
            <FilterButton
              key={i}
              selected={item.isSelected}
              onSelect={() => onFilterSelect(i)}
              filterLabel={item.label}
            />
          ))}
        </div>

        {/* Clear Filters button */}
        <button
          className="shrink-0 rounded-full bg-pumpkinOrange px-4 text-base font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-10 md:py-1"
          type="button"
          onClick={() => {
            let newFilters = filters.map((filter) => ({
              ...filter,
              isSelected: false,
            }));
            setFilters(newFilters);
          }}
        >
          Clear Filters
        </button>
      </div>
      <div className="h-16" />

      {/* Table */}
      <DataTable
        columnHeaders={[
          "#",
          "First",
          "Last",
          "Time Slot",
          "Participant Type",
          "Confirmed",
          "Not Going",
          "Special Group",
          "Delivery Count",
          "Contact",
        ]}
        dataRows={processScheduledSlotsForTable(filtered)}
      />
    </div>
  );
};
