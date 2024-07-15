import { useEffect, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { useMutation, useQueryClient } from "react-query";
import { toastNotify } from "../../utils/ui";
import { applyPatch } from "../../utils/http";
//Components
import { Loading } from "../../components/Loading";
import { DataTable } from "../../components/DataTable";
//Assets
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import x from "../../assets/x.svg";
import check_icon from "../../assets/checkbox-icon.svg";
//Types
import { ProcessedScheduledSlot } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { ContactPopup } from "../../components/ContactPopup";
import { EditVolunteerPopup } from "../../components/EditVolunteerPopup";
import { HttpCheckbox } from "../../components/HttpCheckbox";
import { VOLUNTEERS_FOR_EVENT_QUERY_KEYS } from "../eventHooks";

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
    <DropdownMenu.Item
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border px-2 font-semibold shadow-md outline-none hover:cursor-pointer hover:brightness-110 data-[highlighted]:-m-[1px] data-[selected]:cursor-pointer data-[highlighted]:cursor-pointer data-[highlighted]:border-2 data-[highlighted]:brightness-110 ${
        selected
          ? "bg-pumpkinOrange text-white data-[highlighted]:border-white"
          : "border-pumpkinOrange bg-white text-pumpkinOrange"
      }`}
      onSelect={(e) => {
        e.preventDefault(); //So that the dropdown doesn' close automatically when an item is selected
        onSelect();
      }}
    >
      <div className="w-10/12">{filterLabel}</div>
      <RadixCheckbox.Root
        className={`ml-auto flex h-4 w-4 items-end justify-end rounded border border-pumpkinOrange ${
          selected ? "bg-white" : "bg-softGrayWhite"
        }`}
        checked={selected}
        id="c1"
      >
        <RadixCheckbox.Indicator className="CheckboxIndicator">
          <img src={check_icon} alt="check" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
    </DropdownMenu.Item>
  );
};

interface FilterButtonProps {
  onSelect: () => void;
  filterLabel: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  filterLabel,
  onSelect,
}: FilterButtonProps) => {
  return (
    <button
      className="flex min-w-fit shrink-0 items-center gap-1 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white lg:text-base lg:shadow-sm lg:shadow-newLeafGreen lg:transition-all lg:hover:shadow-md lg:hover:shadow-newLeafGreen"
      onClick={onSelect}
    >
      <p className="text-sm">{filterLabel}</p>
      <img className="w-3 sm:w-4" src={x} alt="x" />
    </button>
  );
};

interface DropdownFilterOption {
  label: string;
  isSelected: boolean;
  filter: (e: ProcessedScheduledSlot) => boolean;
}

function createDropdownFilters(scheduledSlots: ProcessedScheduledSlot[]) {
  let dropdownFilters = [
    {
      label: "Confirmed",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) => ss.confirmed,
    },
    {
      label: "Not Confirmed",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) => !ss.confirmed,
    },
    {
      label: "Only Packers",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) =>
        ss.participantType.includes("Packer") &&
        !ss.participantType.includes("Driver"),
    },
    {
      label: "Only Drivers",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) =>
        ss.participantType.includes("Driver") &&
        !ss.participantType.includes("Packer"),
    },
    {
      label: "Packers & Drivers",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) =>
        ss.participantType.includes("Packer") &&
        ss.participantType.includes("Driver"),
    },
    {
      label: "Signed Up",
      isSelected: true,
      filter: (ss: ProcessedScheduledSlot) => !ss.cantCome,
    },
    {
      label: "Can't Come",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) => ss.cantCome,
    },
  ];

  let specialGroupsList: string[] = [];
  scheduledSlots.forEach((schedSlot) => {
    let curSpecialGroup = schedSlot.specialGroup;

    // Check for a unique special group
    if (curSpecialGroup && !specialGroupsList.includes(curSpecialGroup)) {
      specialGroupsList.push(curSpecialGroup);

      // Add special group as a filter
      let groupFilter = {
        label: curSpecialGroup,
        isSelected: false,
        filter: (ss: ProcessedScheduledSlot) =>
          ss.specialGroup === curSpecialGroup,
      };
      dropdownFilters.push(groupFilter);
    }
  });
  return dropdownFilters;
}

const applySelectedFilters = (
  selectedFilters: DropdownFilterOption[],
  scheduledSlots: ProcessedScheduledSlot[]
) => {
  let filteredItems = scheduledSlots;
  selectedFilters.forEach((curFilter) => {
    if (curFilter.isSelected) {
      //It's rather unfortunate that 'filter' is both a noun and a verb
      filteredItems = filteredItems.filter(curFilter.filter);
    }
  });
  return filteredItems;
};

// NEW FUNCTIONS FOR TOTAL VOLUNTEERS
function sum(arr: number[]): number {
  return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}
//Allows filtering based on the following criteria
function createFilters() {
  return [
    {
      label: "Confirmed",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) => ss.confirmed,
    },
    {
      label: "Not Confirmed",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) => !ss.confirmed,
    },
    {
      label: "Only Packers",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) =>
        ss.participantType.includes("Packer") &&
        !ss.participantType.includes("Driver"),
    },
    {
      label: "Only Drivers",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) =>
        ss.participantType.includes("Driver") &&
        !ss.participantType.includes("Packer"),
    },
    {
      label: "Packers & Drivers",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) =>
        ss.participantType.includes("Packer") &&
        ss.participantType.includes("Driver"),
    },
    {
      label: "Signed Up",
      isSelected: true,
      filter: (ss: ProcessedScheduledSlot) => !ss.cantCome,
    },
    {
      label: "Can't Come",
      isSelected: false,
      filter: (ss: ProcessedScheduledSlot) => ss.cantCome,
    },
  ];
}

//applies our filters
function applyFilters(scheduledSlots: ProcessedScheduledSlot[], filters: any[]): ProcessedScheduledSlot[] {
  let filteredItems = scheduledSlots;
  filters.forEach((curFilter) => {
    if (curFilter.isSelected) {
      filteredItems = filteredItems.filter(curFilter.filter);
    }
  });
  return filteredItems;
}

//new function to calculate the total participants
export function processVolunteerCount(scheduledSlots: ProcessedScheduledSlot[], eventId: string): number {

  const filters = createFilters();

  const filteredSlots = applyFilters(scheduledSlots, filters);

  const guestCounts = filteredSlots.map((ss) => ss.guestCount);

  const totalGuestCount = sum(guestCounts);

  return totalGuestCount;
}

export const VolunteersTable: React.FC<{
  scheduledSlots: ProcessedScheduledSlot[];
  eventId: string;
}> = ({ scheduledSlots, eventId }) => {
  const [filters, setFilters] = useState<DropdownFilterOption[]>(
    createDropdownFilters(scheduledSlots)
  );
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filtered, setFiltered] = useState(
    applySelectedFilters(filters, scheduledSlots)
  );

  //Filter items on filter selection
  useEffect(() => {
    setFiltered(applySelectedFilters(filters, scheduledSlots));
  }, [scheduledSlots]);

  const onFilterSelect = (i: number) => {
    let newSelectedFilters = [...filters];
    newSelectedFilters[i] = {
      ...filters[i],
      isSelected: !filters[i].isSelected,
    };
    setFilters(newSelectedFilters);
    setFiltered(applySelectedFilters(newSelectedFilters, scheduledSlots));
  };

  //for debugging
  const volunteerCountData = processVolunteerCount(filtered, eventId);
  console.log("Total:" + volunteerCountData);

  function processScheduledSlotsForTable(
    scheduledSlots: ProcessedScheduledSlot[],
    eventId: string
  ): (string | number | JSX.Element)[][] {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const rows = scheduledSlots.map((ss, i) => {
      return [
        /* id */
        ss.id,
        /* # */
        i + 1,
        ss.firstName,
        ss.lastName,
        ss.timeSlot,
        ss.participantType,
        // Delete this, for debugging 
        ss.guestCount,
        /* Confirmed Checkbox */
        <HttpCheckbox
          checked={ss.confirmed}
          mutationFn={applyPatch(
            `/api/volunteers/confirm/${ss.id}`,
            { newConfirmationStatus: !ss.confirmed },
            token as string
          )}
          onSuccess={() => {
            const toastMessage = `${ss.firstName} ${ss.lastName} ${
              ss.confirmed ? "unconfirmed" : "confirmed"
            }`;
            queryClient.invalidateQueries(
              VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
            );
            toastNotify(toastMessage, "success");
          }}
          onError={() => toastNotify("Unable to confirm volunteer", "failure")}
        />,
        /* Not Going Checkbox */
        <HttpCheckbox
          checked={ss.cantCome}
          mutationFn={applyPatch(
            `/api/volunteers/going/${ss.id}`,
            { newGoingStatus: !ss.cantCome },
            token as string
          )}
          onSuccess={() => {
            const toastMessage = `${ss.firstName} ${ss.lastName} ${
              ss.cantCome ? "is able to volunteer" : "is unable to volunteer"
            }`;
            queryClient.invalidateQueries(
              VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
            );
            toastNotify(toastMessage, "success");
          }}
          onError={() =>
            toastNotify("Unable to modify availability", "failure")
          }
        />,
        ss.specialGroup ?? "N/A",
        typeof ss.totalDeliveries === "number" ? ss.totalDeliveries : "N/A",
        /* Contact Modal */
        <ContactPopup phoneNumber={ss.phoneNumber} email={ss.email} />,
        <EditVolunteerPopup
          id={ss.id}
          email={ss.email}
          phoneNumber={ss.phoneNumber}
          firstName={ss.firstName}
          lastName={ss.lastName}
          participantType={ss.participantType}
          onEditSuccess={() => {
            queryClient.invalidateQueries(
              VOLUNTEERS_FOR_EVENT_QUERY_KEYS.fetchVolunteersForEvent(eventId)
            );
          }}
        />,
      ];
    });

    return rows;
  }

  filtered.sort((a, b) => {
    if (!a.firstName) {
      return 1;
    }
    if (!b.firstName) {
      return -1;
    }
    return a.firstName < b.firstName ? -1 : 1;
  });
  // UI
  return (
    <div className="flex h-screen flex-col pt-6">
      {/* Filtering */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-4">
        <DropdownMenu.Root
          open={isFilterDropdownOpen}
          onOpenChange={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          modal={false}
        >
          <DropdownMenu.Trigger asChild>
            <h1
              className={`flex w-44 shrink-0 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:brightness-110 md:text-base ${
                isFilterDropdownOpen ? " brightness-110" : ""
              }`}
            >
              Filter
              <img
                className="w-2 md:w-3"
                src={isFilterDropdownOpen ? chevron_up : chevron_down}
                alt="chevron-icon"
              />
            </h1>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={`absolute z-20 flex w-44 flex-col gap-2 rounded-lg border bg-softBeige shadow-md ${
                isFilterDropdownOpen ? "py-2 px-2" : ""
              }`}
              avoidCollisions
              align="start"
            >
              {filters.map((item, i) => (
                <FilterItem
                  key={i}
                  selected={item.isSelected}
                  onSelect={() => onFilterSelect(i)}
                  filterLabel={item.label}
                />
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Applied Filters Labels */}
        <h1 className="align-stretch shrink-0 font-semibold text-newLeafGreen lg:text-lg">
          Applied Filters:
        </h1>

        {/* Buttons that pops up after filter is clicked */}
        <div className="scrollbar-thin flex h-11 max-w-full grow items-start gap-4 overflow-x-auto overscroll-x-auto py-1 px-2">
          {filters.map((item, i) => {
            if (!item.isSelected) return null;
            return (
              <FilterButton
                key={i}
                onSelect={() => onFilterSelect(i)}
                filterLabel={item.label}
              />
            );
          })}
        </div>

        {/* Clear Filters button */}
        <button
          className="shrink-0 rounded-full bg-pumpkinOrange px-4 text-base font-semibold text-white md:px-10 md:py-1 lg:shadow-sm lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md lg:hover:shadow-newLeafGreen"
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
        borderColor="softGrayWhite"
        columnHeaders={[
          "#",
          "First",
          "Last",
          "Time Slot",
          "Participant Type",
          "Test Guest Count",
          "Confirmed",
          "Can't Come",
          "Special Group",
          "Delivery Count",
          "Contact",
          "Edit",
        ]}
        dataRows={processScheduledSlotsForTable(filtered, eventId)}
      />
    </div>
  );
};
