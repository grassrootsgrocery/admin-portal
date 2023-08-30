import { DataTable } from "../../components/DataTable";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import {
  ProcessedEvent,
  ProcessedSpecialEvent,
  ProcessedSpecialGroup,
} from "../../types";
import { useQuery } from "react-query";
import { API_BASE_URL } from "../../httpUtils";
import { useAuth } from "../../contexts/AuthContext";
import { useSpecialGroups } from "./specialGroupsHooks";

interface Props {
  event: ProcessedEvent;
}

function processSpecialGroups(
  specialEvents: ProcessedSpecialEvent[],
  specialGroups: ProcessedSpecialGroup[]
) {
  return specialEvents.map((se) => {
    const specialGroupsFiltered = specialGroups.filter(
      (sg) => sg.id === se.specialGroupId
    );
    if (specialGroupsFiltered.length === 0) {
      console.log(
        `No special group found with matching id for special event with id ${se.specialGroupId}`
      );
      return [se.id, "NO NAME", se.eventSignUpLink];
    }
    if (specialGroupsFiltered.length > 1) {
      //This should not happen...
      console.log(
        `Multiple special groups found with matching ids for special event with id ${se.specialGroupId}`,
        specialGroupsFiltered
      );
    }
    const groupName = specialGroupsFiltered[0].name;
    return [se.id, groupName, se.eventSignUpLink];
  });
}

export const ViewSpecialGroups: React.FC<Props> = ({ event }: Props) => {
  const { token } = useAuth();
  const {
    data: specialEvents,
    refetch: refetchSpecialEvents,
    status: specialEventsStatus,
    error: specialEventsError,
  } = useQuery(["fetchViewEventSpecialEvents", event.id], async () => {
    const eventIds = event.allEventIds.join(",");
    const response = await fetch(
      `${API_BASE_URL}/api/events/view-event-special-groups?eventIds=${eventIds}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedSpecialEvent[]>;
  });

  const {
    data: specialGroups,
    status: specialGroupsStatus,
    error: specialGroupsError,
  } = useSpecialGroups();

  const disabled =
    specialEventsStatus === "loading" ||
    specialEventsStatus === "idle" ||
    specialEventsStatus === "error" ||
    specialGroupsStatus === "loading" ||
    specialGroupsStatus === "idle" ||
    specialGroupsStatus === "error";

  return (
    <Popup
      onOpenChange={() => refetchSpecialEvents()}
      trigger={
        <button
          className={
            "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white outline-none lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:shadow-newLeafGreen lg:transition-all " +
            (disabled
              ? "opacity-50"
              : "lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen")
          }
          type="button"
        >
          View Special Groups
        </button>
      }
      content={
        <div>
          <Modal.Title className="m-0 flex justify-center px-16 text-3xl font-bold text-newLeafGreen">
            View Event Special Groups
          </Modal.Title>
          <div className="h-6" />
          {!disabled && specialEvents && specialGroups && (
            <div className="h-96">
              <DataTable
                borderColor="newLeafGreen"
                columnHeaders={["Name", "Sign-up Link"]}
                dataRows={processSpecialGroups(
                  specialEvents,
                  specialGroups
                ).map((row) => {
                  /* example of array
                    0 "recmIJYvF6wK71RnJ"
                    1 "St. Augustine's"
                    2 "https://bit.ly/3HohS3x"
                  */

                  return [
                    row[0],
                    row[1],
                    <a
                      href={row[2]}
                      target={"_blank"}
                      className={"text-blue-500 underline"}
                    >
                      {row[2]}
                    </a>,
                  ];
                })} // dataRows={[
              />
            </div>
          )}
          <div className="h-4" />
          <div className="flex justify-center">
            <Modal.Close className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white outline-none md:px-4 md:py-2 lg:px-8 lg:py-4 lg:text-xl lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen">
              Done
            </Modal.Close>
          </div>
        </div>
      }
    />
  );
};
