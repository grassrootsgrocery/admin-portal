import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "react-query";
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
      dropdown.style.display = "none";
      clearButton.style.display = "none";
    } else {
      dropdown.style.display = "block";
      clearButton.style.display = "block";
    }
  }
}

export const Dropdown = (props: any) => {
  // Get allEventIds from ViewEvent
  const location = useLocation();
  const allEventIds = location.state;

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
    const results = specialGroupsList.filter((group) => {
      if (e.target.value === "") return specialGroupsList;
      return group.name.toLowerCase().includes(e.target.value.toLowerCase());
    });
    setState({
      query: e.target.value,
      list: results,
    });

    showHideElements();
  };

  // Clear input
  const inputRef = useRef<HTMLInputElement>(null);
  const clearInput = () => {
    if (inputRef.current != null) {
      inputRef.current.value = "";
      setState({
        query: "",
        list: [],
      });
      showHideElements();
      props.handleQuery("");
    }
  };

  // Determines if the special group is already registered for the event and handling
  const isSpecialGroupRegistered = (
    specialGroup: ProcessedSpecialGroup,
    allEventIds: string[]
  ) => {
    // Determine if special group's event list includes an id associated with event
    let registered = false;
    if (specialGroup.events != null) {
      registered = allEventIds.some((id) => specialGroup.events.includes(id));
    }
    //console.log("registered", registered)

    // Set input value to selected special group name
    setState({
      query: specialGroup.name,
      list: state.list,
    });

    // Set visibility of messages and dropdown
    const dropdown = document.getElementById("specialGroupDropdown");
    const alertMessage = document.getElementById("alreadyRegisteredMessage");
    const readyMessage = document.getElementById("readyToRegisterMessage");
    if (
      dropdown != null &&
      inputRef.current != null &&
      alertMessage != null &&
      readyMessage != null
    ) {
      dropdown.style.display = "none"; // Hide dropdown
      if (registered == true) {
        alertMessage.style.display = "flex";
        readyMessage.style.display = "none";
      } else {
        readyMessage.style.display = "flex";
        alertMessage.style.display = "none";
      }

      props.handleQuery(specialGroup.name);
    }
  };

  // Retrieve Special Groups
  const {
    data: specialGroups,
    status: specialGroupsStatus,
    error: specialGroupsError,
  } = useQuery(["fetchSpecialGroups"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/special-groups`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedSpecialGroup[]>;
  });

  if (specialGroupsStatus === "loading" || specialGroupsStatus === "idle") {
    return (
      <div style={{ position: "relative", minHeight: "80vh" }}>
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }

  if (specialGroupsStatus === "error") {
    console.error(specialGroupsError);
    return <div>Error...</div>;
  }

  console.log("Logging specialGroups", specialGroups);

  const specialGroupsList: ProcessedSpecialGroup[] = specialGroups;

  return (
    <div className="px-4 py-2">
      {/* Special Group Input */}
      <div className="flex flex-row items-center">
        <form>
          <input
            className="w-80 h-8 border-2 border-softGrayWhite rounded-lg text-lg text-newLeafGreen placeholder:text-lg placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:outline-softGrayWhite pl-2 pr-7"
            ref={inputRef}
            type="text"
            id="specialGroupInput"
            placeholder="Search through groups..."
            value={state.query}
            onChange={handleChange}
          ></input>
        </form>

        {/* Clear button */}
        <button hidden id="clearBtn" onClick={clearInput}>
          <img
            className="relative bottom-0.25 right-6 w-3 sm:w-4"
            src={x}
            alt="x"
          />
        </button>
      </div>

      {/* Special Group Listing Dropdown */}
      <ul
        className="hidden w-80 max-h-56 overflow-y-scroll border-2 border-t-0 border-softGrayWhite rounded-lg text-newLeafGreen py-1"
        id="specialGroupDropdown"
      >
        <div className="text-sm text-[#0E7575] px-2">
          Select existing group or create new one
        </div>

        {state.query === ""
          ? ""
          : state.list.map((specialGroup) => {
              return (
                <li
                  className="flex flex-row rounded-lg hover:cursor-pointer hover:bg-softGrayWhite px-2"
                  key={specialGroup.name}
                  onClick={() => {
                    isSpecialGroupRegistered(specialGroup, eventIdsList);
                  }}
                >
                  <img className="w-2 mr-1 md:w-4" src={plus} alt="plus-icon" />
                  {specialGroup.name}
                </li>
              );
            })}

        <li
          className="flex flex-row rounded-lg hover:cursor-pointer hover:bg-softGrayWhite px-2"
          onClick={() => {
            isSpecialGroupRegistered(
              { name: state.query, events: [] },
              eventIdsList
            );
          }}
        >
          Create:
          <div className="pl-2 text-[#0E7575]">{state.query}</div>
        </li>
      </ul>

      {/* Aleady registered message */}
      <div className="hidden items-center" id="alreadyRegisteredMessage">
        <img className="mt-1 w-4 md:w-6 lg:w-7" src={alert} alt="alert-icon" />
        <div className="flex flex-col items-center leading-5 px-2 text-lg font-semibold text-newLeafGreen">
          <div> This group is already registered for </div>
          <div> the event! </div>
        </div>
      </div>

      {/* Ready message */}
      <div className="hidden items-center" id="readyToRegisterMessage">
        <img className="mt-1 w-4 md:w-6 lg:w-7" src={check} alt="check-icon" />
        <div className="leading-5 px-4 text-lg font-semibold text-newLeafGreen">
          Ready to generate link!
        </div>
      </div>
    </div>
  );
};
