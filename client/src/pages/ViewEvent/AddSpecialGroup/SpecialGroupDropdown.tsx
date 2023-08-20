import { useState } from "react";
import { ProcessedSpecialGroup } from "../../../types";
//Assets
import plus from "../../../assets/plus.svg";
import x from "../../../assets/greenX.svg";

interface Props {
  specialGroupsList: ProcessedSpecialGroup[] | undefined;
  isGroupSelected: boolean;
  isGroupAlreadyRegisteredForEvent: (
    specialGroup: ProcessedSpecialGroup
  ) => boolean;
  setGroup: (
    group: (ProcessedSpecialGroup & { isNewSpecialGroup: boolean }) | null
  ) => void;
}

export const SpecialGroupDropdown: React.FC<Props> = ({
  specialGroupsList,
  isGroupAlreadyRegisteredForEvent,
  isGroupSelected,
  setGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="flex flex-col gap-2 border md:flex-row md:gap-8">
      <div className="relative w-64 grow border md:w-80">
        <div className="flex h-8 w-full rounded-lg border-2 border-softGrayWhite px-2">
          <input
            className="grow text-newLeafGreen placeholder:text-newLeafGreen placeholder:text-opacity-40 focus:outline-none md:text-lg md:placeholder:text-lg"
            type="text"
            id="specialGroupInput"
            autoComplete="off"
            placeholder="Search through groups..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setGroup(null);
            }}
          />

          {/* Clear button */}
          <button
            onClick={() => {
              setSearchQuery("");
              setGroup(null);
            }}
            className="w-4 "
          >
            <img
              className={searchQuery.length === 0 ? "hidden" : "block"}
              src={x}
              alt="x"
            />
          </button>
        </div>

        {/* Special Group Listing Dropdown */}
        {!isGroupSelected && (
          <ul className="absolute w-full overflow-y-scroll rounded-lg border-2 border-t-0 border-softGrayWhite bg-softBeige p-1  text-newLeafGreen">
            <div className="px-2 text-sm text-[#0E7575]">
              Select existing group or create new one
            </div>
            {specialGroupsList &&
              specialGroupsList
                .filter((specialGroup) => {
                  //Filter based on search query
                  return (
                    specialGroup.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    searchQuery
                      .toLowerCase()
                      .includes(specialGroup.name.toLowerCase())
                  );
                })
                .map((specialGroup, idx) => {
                  return (
                    <li
                      className={`my-1 flex flex-row rounded-lg px-2 py-1 ${
                        isGroupAlreadyRegisteredForEvent(specialGroup)
                          ? "bg-softGrayWhite"
                          : "hover:cursor-pointer hover:bg-softGrayWhite hover:brightness-110"
                      }`}
                      key={idx + specialGroup.name}
                      onClick={() => {
                        if (isGroupAlreadyRegisteredForEvent(specialGroup)) {
                          return;
                        }
                        setSearchQuery(specialGroup.name);
                        setGroup({ ...specialGroup, isNewSpecialGroup: false });
                      }}
                    >
                      <img className="mr-2 w-4" src={plus} alt="plus-icon" />
                      {specialGroup.name}
                    </li>
                  );
                })}

            <li
              className="flex flex-row rounded-lg px-2 hover:cursor-pointer hover:bg-softGrayWhite"
              onClick={() => {
                if (searchQuery.length === 0) return;
                setGroup({
                  id: "NEW GROUP, PLACEHOLDER ID",
                  name: searchQuery,
                  events: [],
                  isNewSpecialGroup: true,
                });
              }}
            >
              Create:
              <p className="pl-2 text-[#0E7575]">{searchQuery}</p>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
