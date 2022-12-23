import { useEffect, useRef, useState } from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { useMutation } from "react-query";
import { toastNotify, useClickOutside } from "../../uiUtils";
//Components
import { Loading } from "../../components/Loading";
import { DataTable } from "../../components/DataTable";
//Assets
import { API_BASE_URL, applyPatch } from "../../httpUtils";
import chevron_up from "../../assets/chevron-up.svg";
import chevron_down from "../../assets/chevron-down.svg";
import x from "../../assets/x.svg";
import check_icon from "../../assets/checkbox-icon.svg";
//Types
import { Record, ScheduledSlot } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

/*
TODO: There is a lot of stuff going on in this component, and we should perhaps look into refactoring at some point. 
*/

//Used for "Confirmed" and "Not going" checkboxes
interface HttpCheckboxProps {
  checked: boolean;
  mutationFn: any; //This needs to be generic enough
  onSuccess: () => void;
  onError: () => void;
}
export const HttpCheckbox: React.FC<HttpCheckboxProps> = ({
  checked,
  mutationFn,
  onSuccess,
  onError,
}: HttpCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(checked);
  const httpRequest = useMutation({
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

  //UI
  return (
    <div className="relative flex h-full items-center justify-center">
      {httpRequest.status === "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <RadixCheckbox.Root
          className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
          checked={isChecked}
          onClick={() => httpRequest.mutate()}
        >
          <RadixCheckbox.Indicator className="CheckboxIndicator">
            <img src={check_icon} alt="" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      )}
    </div>
  );
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
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-pumpkinOrange px-2 font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        selected ? "bg-pumpkinOrange text-white" : "bg-white text-pumpkinOrange"
      }`}
      onClick={onSelect}
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
    </li>
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
      className="flex min-w-fit shrink-0 items-center gap-1 rounded-full bg-newLeafGreen py-1 px-3 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:shadow-md hover:shadow-newLeafGreen sm:text-sm md:text-base"
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
    const { token } = useAuth();

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

    //let rows = [];
    const rows = scheduledSlots.map((ss, i) => {
      const first = ss.fields["First Name"] ? ss.fields["First Name"][0] : "";
      const last = ss.fields["Last Name"] ? ss.fields["First Name"][0] : "";
      const particpantType = getParticipantType(ss.fields["Type"]);

      return [
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
        particpantType,
        /* Confirmed Checkbox */
        <HttpCheckbox
          checked={ss.fields["Confirmed?"]}
          mutationFn={applyPatch(
            `${API_BASE_URL}/api/volunteers/confirm/${ss.id}`,
            { newConfirmationStatus: !ss.fields["Confirmed?"] },
            token as string
          )}
          onSuccess={() => {
            const toastMessage = `${first} ${last} ${
              ss.fields["Confirmed?"] ? "unconfirmed" : "confirmed"
            }`;
            refetchVolunteers();
            toastNotify(toastMessage, "success");
          }}
          onError={() => toastNotify("Unable to confirm volunteer", "failure")}
        />,
        /* Not Going Checkbox */
        <HttpCheckbox
          checked={ss.fields["Can't Come"]}
          mutationFn={applyPatch(
            `${API_BASE_URL}/api/volunteers/going/${ss.id}`,
            { newGoingStatus: !ss.fields["Can't Come"] },
            token as string
          )}
          onSuccess={() => {
            const toastMessage = `${first} ${last} ${
              ss.fields["Can't Come"]
                ? "is able to volunteer"
                : "is unable to volunteer"
            }`;
            refetchVolunteers();
            toastNotify(toastMessage, "success");
          }}
          onError={() =>
            toastNotify("Unable to modify availability", "failure")
          }
        />,
        /* Special Group */
        ss.fields["Volunteer Group (for MAKE)"] || "N/A",
        /* Delivery Count */
        particpantType.includes("Driver")
          ? ss.fields["Total Deliveries"]
          : "NA",
        /* TODO: Contact Modal */
        ss.fields["Email"] ? ss.fields["Email"][0] : "",
      ];
    });

    return rows;
  }

  filtered.sort((a, b) => {
    console.log(a.fields["First Name"], b.fields["First Name"]);
    if (!a.fields["First Name"]) {
      return 1;
    }
    if (!b.fields["First Name"]) {
      return -1;
    }

    return a.fields["First Name"][0] < b.fields["First Name"][0] ? -1 : 1;
  });
  // UI
  return (
    <div className="flex h-screen flex-col pt-6">
      {/* Filtering */}
      <div
        className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-4"
        ref={dropdownRef}
      >
        {/* Filter dropdown. TODO: This should be converted to use the Radix dropdown menu instead, similar to AssignLocationDropdown.tsx. */}
        <div className="relative z-20">
          <h1
            className={`flex w-44 select-none items-center justify-between rounded-lg border bg-pumpkinOrange px-2 py-1 text-sm font-semibold text-white hover:cursor-pointer hover:brightness-110 md:text-base ${
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
                isFilterDropdownOpen ? "py-2 px-2" : ""
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

        {/* Applied Filters Labels */}
        <h1 className="shrink-0 font-semibold text-newLeafGreen lg:text-lg">
          Applied Filters:
        </h1>

        {/* Buttons that pops up after filter is clicked */}
        <div className="scrollbar-thin flex max-w-full grow items-start gap-4 overflow-x-auto overscroll-x-auto py-1 px-2">
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
