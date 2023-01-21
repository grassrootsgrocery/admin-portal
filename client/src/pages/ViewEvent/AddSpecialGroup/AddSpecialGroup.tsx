import { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { API_BASE_URL } from "../../../httpUtils";
import { useAuth } from "../../../contexts/AuthContext";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../../components/Popup";
import { SpecialGroupDropdown } from "./SpecialGroupDropdown";
import { toastNotify } from "../../../uiUtils";
import { ProcessedEvent, ProcessedSpecialGroup } from "../../../types";
import check from "../../../assets/check.svg";
import { useSpecialGroups } from "../specialGroupsHooks";

interface Props {
  event: ProcessedEvent;
  refetchEvent: () => void;
}

export const AddSpecialGroup: React.FC<Props> = ({
  event,
  refetchEvent,
}: Props) => {
  const { token } = useAuth();

  const {
    data: specialGroups,
    refetch: refetchGroups,
    status: specialGroupsStatus,
    error: specialGroupsError,
  } = useSpecialGroups();

  const createSpecialGroupAndAddToEvent = useMutation({
    mutationFn: async ({ specialGroupName }: { specialGroupName: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/special-groups/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ specialGroupName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      return response.json();
    },
    onSuccess: (data, variables, context) => {
      console.log("Data returned from POST /api/special-groups/", data);
      //TODO: We should maybe type the response?
      addSpecialGroupToEvent.mutate({ specialGroupId: data.records[0].id });
    },
    onError: (error, variables, context) => {
      console.error(error);
      toastNotify("Unable to create special group", "failure");
    },
  });

  const addSpecialGroupToEvent = useMutation({
    mutationFn: async ({ specialGroupId }: { specialGroupId: string }) => {
      const response = await fetch(
        `${API_BASE_URL}/api/special-groups/add-special-group-to-event`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventId: event.id, specialGroupId }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      return response.json();
    },
    onSuccess: (data, variables, context) => {
      console.log(
        "Data returned from POST /api/special-groups/add-special-group-to-event",
        data
      );
      //TODO: We should maybe type the response?
      setNewlyAddedGroupSignUpLink(
        data.records[0].fields["Shortened Link to Special Event Signup Form"] ||
          data.records[0].fields["Link to Special Event Signup Form"] ||
          "Uh oh, where is the link?"
      );
      refetchGroups();
      refetchEvent();
    },
    onError: (error, variables, context) => {
      toastNotify("Unable to add special group to event", "failure");
    },
  });

  const [selectedGroup, setSelectedGroup] = useState<
    (ProcessedSpecialGroup & { isNewSpecialGroup: boolean }) | null
  >(null);
  const [newlyAddedGroupSignUpLink, setNewlyAddedGroupSignUpLink] =
    useState("");

  const isGroupRegisteredForEvent = (
    specialGroup: ProcessedSpecialGroup | null,
    allEventIds: string[]
  ) => {
    if (specialGroup === null) {
      return false;
    }
    // Determine if special group's event list includes an id associated with event
    return allEventIds.some((id) => specialGroup.events.includes(id));
  };

  const addSpecialGroup = () => {
    if (selectedGroup === null) {
      return;
    }
    if (selectedGroup.isNewSpecialGroup) {
      createSpecialGroupAndAddToEvent.mutate({
        specialGroupName: selectedGroup.name,
      });
    } else {
      addSpecialGroupToEvent.mutate({ specialGroupId: selectedGroup.id });
    }
  };

  const getSpecialGroupPopupContent = () => {
    const hasGroupJustBeenAddedToEvent = newlyAddedGroupSignUpLink.length > 0;
    if (hasGroupJustBeenAddedToEvent) {
      return (
        <div>
          <Modal.Title className="m-0 flex justify-center font-bold text-newLeafGreen lg:text-3xl">
            Special Group Sign Up Link
          </Modal.Title>
          <div className="h-4" />
          <div className="overflow-auto">
            <p className="text-emerald-800 hover:text-emerald-700">
              <a
                href={newlyAddedGroupSignUpLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {newlyAddedGroupSignUpLink}
              </a>
            </p>
          </div>
          <div className="h-4" />
          <div className="flex justify-center">
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-md shadow-newLeafGreen transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl">
              Done
            </Modal.Close>
          </div>
        </div>
      );
    }

    const addGroupAndGenerateLinkDisabled =
      createSpecialGroupAndAddToEvent.status === "loading" ||
      addSpecialGroupToEvent.status === "loading" ||
      !selectedGroup;

    return (
      <div className="w-full">
        <Modal.Title asChild>
          <div className="m-0 flex justify-center text-lg font-bold text-newLeafGreen lg:text-3xl">
            Add Special Group to Event
          </div>
        </Modal.Title>
        <div className="h-1 lg:h-4" />

        <div className="h-64 w-full lg:h-96">
          <SpecialGroupDropdown
            specialGroupsList={specialGroups}
            isGroupAlreadyRegisteredForEvent={(specialGroup) =>
              isGroupRegisteredForEvent(specialGroup, event.allEventIds)
            }
            isGroupSelected={!!selectedGroup}
            setGroup={setSelectedGroup}
          />
          <div className="h-8" />
          {selectedGroup && (
            <div className="flex items-center">
              <img
                className="mt-1 w-4 md:w-6 lg:w-7"
                src={check}
                alt="check-icon"
              />
              <p className="px-4 text-lg font-semibold leading-5 text-newLeafGreen">
                Ready to generate link!
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-5">
          <Modal.Close
            className="rounded-full bg-pumpkinOrange px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            Cancel
          </Modal.Close>
          <button
            onClick={addSpecialGroup}
            disabled={addGroupAndGenerateLinkDisabled}
            className={`rounded-full bg-newLeafGreen px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen  lg:px-5 lg:py-3 lg:text-base lg:font-bold ${
              addGroupAndGenerateLinkDisabled
                ? "opacity-50"
                : "transition-all hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-md hover:shadow-newLeafGreen"
            }`}
            type="button"
          >
            Add Group and Generate Link
          </button>
        </div>
      </div>
    );
  };

  const addSpecialGroupButtonDisabled =
    specialGroupsStatus === "error" ||
    specialGroupsStatus === "loading" ||
    specialGroupsStatus === "idle";

  return (
    <Popup
      shouldDodgeKeyboard
      trigger={
        <button
          className={
            "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all lg:px-5 lg:py-3 lg:text-base lg:font-bold " +
            (addSpecialGroupButtonDisabled
              ? "opacity-50"
              : "hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen")
          }
          disabled={addSpecialGroupButtonDisabled}
          type="button"
        >
          + Add Special Group
        </button>
      }
      onOpenChange={() => {
        setNewlyAddedGroupSignUpLink("");
        setSelectedGroup(null);
      }}
      content={getSpecialGroupPopupContent()}
    />
  );
};
