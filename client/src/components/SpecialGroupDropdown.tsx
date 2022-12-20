import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { API_BASE_URL } from "../httpUtils";
import { Loading } from "./Loading";
import { ProcessedSpecialGroup, DropdownFilter } from "../types";

//Assets
import plus from "../assets/plus.svg";
import x from "../assets/greenX.svg";
import alert from "../assets/alert.svg";
import check from "../assets/check.svg";

// Show/Hide dropdown, clear button, and messages
function showHideElements() {
  const input = document.getElementById(
    "specialGroupInput"
  ) as HTMLInputElement;
  const dropdown = document.getElementById("specialGroupDropdown");
  const clearButton = document.getElementById("clearBtn");
  const alertMessage = document.getElementById("alreadyRegisteredMessage");
  const readyMessage = document.getElementById("readyToRegisterMessage");

  if (
    dropdown != null &&
    clearButton != null &&
    alertMessage != null &&
    readyMessage != null
  ) {
    alertMessage.style.display = "none";
    readyMessage.style.display = "none";

    if (input.value === "") {
      dropdown.style.display = "block";
      clearButton.style.display = "block";
    } else {
      dropdown.style.display = "block";
      clearButton.style.display = "block";
    }
  }
}
interface Props {
  specialGroupsList: ProcessedSpecialGroup[];
  refetchGroups: () => void;
  handleQuery: (s: string) => void;
  handleRegistered: (b: boolean) => void;
}

export const SpecialGroupDropdown: React.FC<Props> = ({
  specialGroupsList,
  refetchGroups,
  handleQuery,
  handleRegistered,
}) => {
  // Get allEventIds from ViewEvent
  const location = useLocation();
  const allEventIds = location.state;
  console.log("allEventIds", allEventIds);

  const [searchQuery, setSearchQuery] = useState<string>("");
  // Create list of all event ids associated with event
  const eventIdsList: string[] = [];
  for (const k in allEventIds) {
    eventIdsList.push(allEventIds[k]);
  }

  const [state, setState] = useState<DropdownFilter>({
    query: "",
    list: [],
  });

  // Handling when input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Result filtering based on input
    // refetchGroups();
    if (e.target.value === "") {
    }
    const results = specialGroupsList.filter((group) => {
      if (e.target.value === "") return specialGroupsList;
      return group.name.toLowerCase().includes(e.target.value.toLowerCase());
    });
    setState({
      query: e.target.value,
      list: results,
    });

    // showHideElements();
  };

  // Clear input
  // const inputRef = useRef<HTMLInputElement>(null);
  // const clearInput = () => {
  //   if (inputRef.current != null) {
  //     inputRef.current.value = "";
  //     setState({
  //       query: "",
  //       list: [],
  //     });
  //     showHideElements();
  //     handleQuery("");
  //     handleRegistered(false);
  //   }
  // };

  // Determines if the special group is already registered for the event and handling
  // const isSpecialGroupRegistered = (
  //   specialGroup: ProcessedSpecialGroup,
  //   allEventIds: string[]
  // ) => {
  //   // Determine if special group's event list includes an id associated with event
  //   let registered = false;
  //   if (specialGroup.events != null) {
  //     registered = allEventIds.some((id) => specialGroup.events.includes(id));
  //   }
  //   //console.log("registered", registered)

  //   // Set input value to selected special group name
  //   setState({
  //     query: specialGroup.name,
  //     list: state.list,
  //   });

  //   // Set visibility of messages and dropdown
  //   const dropdown = document.getElementById("specialGroupDropdown");
  //   const alertMessage = document.getElementById("alreadyRegisteredMessage");
  //   const readyMessage = document.getElementById("readyToRegisterMessage");
  //   if (
  //     dropdown != null &&
  //     inputRef.current != null &&
  //     alertMessage != null &&
  //     readyMessage != null
  //   ) {
  //     dropdown.style.display = "none"; // Hide dropdown
  //     if (registered == true) {
  //       handleRegistered(true);
  //       alertMessage.style.display = "flex";
  //       readyMessage.style.display = "none";
  //     } else {
  //       readyMessage.style.display = "flex";
  //       alertMessage.style.display = "none";
  //     }

  //     handleQuery(specialGroup.name);
  //   }
  // };

  return (
    <div className="r grow-0 px-4 lg:w-80">
      {/* Special Group Input */}
      <div className="flex flex-row items-center">
        <input
          className="h-8 w-80 rounded-lg border-2 border-softGrayWhite pl-2 pr-7 text-lg text-newLeafGreen placeholder:text-lg placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:outline-softGrayWhite"
          type="text"
          id="specialGroupInput"
          autoComplete="off"
          placeholder="Search through groups..."
          // value={state.query}
          value={searchQuery}
          // onChange={handleChange}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Clear button */}
        {searchQuery.length > 0 && (
          <button id="clearBtn" onClick={() => setSearchQuery("")}>
            <img
              className="bottom-0.25 relative right-6 w-3 sm:w-4"
              src={x}
              alt="x"
            />
          </button>
        )}
      </div>

      {/* Special Group Listing Dropdown */}
      {searchQuery.length > 0 && (
        <ul
          className="max-h-56 w-80 overflow-y-scroll rounded-lg border-2 border-t-0 border-softGrayWhite py-1 text-newLeafGreen"
          id="specialGroupDropdown"
        >
          <div className="px-2 text-sm text-[#0E7575]">
            Select existing group or create new one
          </div>
          {specialGroupsList
            .filter((specialGroup) => {
              return specialGroup.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            })
            .map((specialGroup) => {
              return (
                <li
                  className="flex flex-row rounded-lg px-2 hover:cursor-pointer hover:bg-softGrayWhite"
                  key={specialGroup.name}
                  onClick={() => {
                    isSpecialGroupRegistered(specialGroup, eventIdsList);
                  }}
                >
                  <img className="mr-1 w-2 md:w-4" src={plus} alt="plus-icon" />
                  {specialGroup.name}
                </li>
              );
            })}
          {/* {state.list.map((specialGroup) => {
            return (
              <li
                className="flex flex-row rounded-lg px-2 hover:cursor-pointer hover:bg-softGrayWhite"
                key={specialGroup.name}
                onClick={() => {
                  isSpecialGroupRegistered(specialGroup, eventIdsList);
                }}
              >
                <img className="mr-1 w-2 md:w-4" src={plus} alt="plus-icon" />
                {specialGroup.name}
              </li>
            );
          })} */}

          <li
            className="flex flex-row rounded-lg px-2 hover:cursor-pointer hover:bg-softGrayWhite"
            onClick={() => {
              isSpecialGroupRegistered(
                { name: state.query, events: [] },
                eventIdsList
              );
            }}
          >
            Create:
            <p className="pl-2 text-[#0E7575]">{searchQuery}</p>
          </li>
        </ul>
      )}

      <div className="h-8" />
      {/* Aleady registered message */}
      <div className="hidden items-center" id="alreadyRegisteredMessage">
        <img className="mt-1 w-4 md:w-6 lg:w-7" src={alert} alt="alert-icon" />
        <div className="flex flex-col items-center px-2 text-lg font-semibold leading-5 text-newLeafGreen">
          <div> This group is already registered for </div>
          <div> the event! </div>
        </div>
      </div>

      {/* Ready message */}
      <div className="hidden items-center" id="readyToRegisterMessage">
        <img className="mt-1 w-4 md:w-6 lg:w-7" src={check} alt="check-icon" />
        <div className="px-4 text-lg font-semibold leading-5 text-newLeafGreen">
          Ready to generate link!
        </div>
      </div>
    </div>
  );
};
