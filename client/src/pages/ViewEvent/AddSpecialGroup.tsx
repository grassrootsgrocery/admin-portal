import { useMutation, useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";
import {
  AddSpecialGroupRequestBody,
  ProcessedEvent,
  ProcessedSpecialGroup,
} from "../../types";
import { SpecialGroupDropdown } from "./SpecialGroupDropdown";
import Popup from "../../components/Popup";
import { Loading } from "../../components/Loading";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import * as Modal from "@radix-ui/react-dialog";
import alert from "../../assets/alert.svg";
import check from "../../assets/check.svg";
interface Props {
  event: ProcessedEvent;
}

export const AddSpecialGroup: React.FC<Props> = ({ event }: Props) => {
  const { token } = useAuth();

  // Retrieve Special Groups
  const {
    data: specialGroups,
    refetch: refetchGroups,
    status: specialGroupsStatus,
    error: specialGroupsError,
  } = useQuery(["fetchSpecialGroups"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/special-groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedSpecialGroup[]>;
  });
  const createSpecialGroup = async (data: AddSpecialGroupRequestBody) => {
    const response = await fetch(`${API_BASE_URL}/api/add-special-group`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    return response.json();
  };
  const { mutate, isLoading } = useMutation(createSpecialGroup, {
    onSuccess: (data) => {
      console.log(data); // the response
    },
    onError: (error) => {
      console.log(error); // the error if that is the case
    },
  });

  const [group, setGroup] = useState<ProcessedSpecialGroup | null>(null);

  const [hasGroupJustBeenRegistered, setHasGroupJustBeenRegistered] =
    useState(false);

  if (specialGroupsStatus === "loading" || specialGroupsStatus === "idle") {
    return (
      <div className="relative h-full">
        <Loading size="large" thickness="extra-thicc" />
      </div>
    );
  }

  if (specialGroupsStatus === "error") {
    console.error(specialGroupsError);
    return <div>Error...</div>;
  }

  console.log("Logging specialGroups", specialGroups);

  // const isGroupRegisteredForEvent = (groupName: string) => {
  const isGroupRegisteredForEvent = (
    specialGroup: ProcessedSpecialGroup,
    allEventIds: string[]
  ) => {
    // Determine if special group's event list includes an id associated with event
    let registered = false;
    if (specialGroup.events != null) {
      registered = allEventIds.some((id) => specialGroup.events.includes(id));
    }
    return registered;
  };

  const getSpecialGroupPopupContent = () => {
    if (hasGroupJustBeenRegistered) {
      return (
        <div>
          <div className="m-0 flex justify-center font-bold text-newLeafGreen lg:text-3xl">
            Special Group Sign Up Link
          </div>
        </div>
      );
    }
    return (
      <div className="">
        <Modal.Title asChild>
          <div className="m-0 flex justify-center text-lg font-bold text-newLeafGreen lg:text-3xl">
            Add Special Group to Event
          </div>
        </Modal.Title>
        <div className="h-1 lg:h-4"></div>

        <div className="h-64 w-full lg:h-96">
          <SpecialGroupDropdown
            specialGroupsList={specialGroups}
            isGroupSelected={!!group}
            setIsGroupSelected={setGroup}
          />
          <div className="h-8" />
          {group &&
            (isGroupRegisteredForEvent(group, event.allEventIds) ? (
              <div className="flex items-center">
                <img
                  className="mt-1 w-4 md:w-6 lg:w-7"
                  src={alert}
                  alt="alert-icon"
                />
                <p className="flex flex-col items-center px-2 font-semibold leading-5 text-newLeafGreen lg:text-lg">
                  This group is already registered for the event!
                </p>
              </div>
            ) : (
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
            ))}
        </div>

        <div className="flex justify-center gap-5">
          <Modal.Close>
            <button
              className="rounded-full bg-pumpkinOrange px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
              type="button"
            >
              Cancel
            </button>
          </Modal.Close>
          <button
            onClick={() => {
              setHasGroupJustBeenRegistered(true);
            }}
            disabled={group ? false : true}
            className="rounded-full bg-newLeafGreen px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen transition-all hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-md hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
          >
            Add Group and Generate Link
          </button>
        </div>
      </div>
    );
  };

  return (
    <Popup
      trigger={
        <button
          className="rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white shadow-md shadow-newLeafGreen outline-none transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold"
          type="button"
        >
          + Add Special Group
        </button>
      }
      onOpenChange={() => {
        setHasGroupJustBeenRegistered(false);
        setGroup(null);
      }}
      content={getSpecialGroupPopupContent()}
    />
  );
};
