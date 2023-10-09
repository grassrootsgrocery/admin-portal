import { DataTable } from "../../components/DataTable";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "../../components/Popup";
import {
  ProcessedEvent,
  ProcessedSpecialEvent,
  ProcessedSpecialGroup,
} from "../../types";
import { useQuery, useQueryClient } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  SPECIAL_EVENTS_QUERY_KEYS,
  useSpecialEventsForEvent,
  useSpecialGroups,
} from "./hooks";
import { cn } from "../../utils/ui";

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

    /* example of array
      0 "recmIJYvF6wK71RnJ"
      1 "St. Augustine's"
      2 "https://bit.ly/3HohS3x"
    */
    return [
      se.id,
      groupName,
      <a
        href={se.eventSignUpLink}
        target="_blank"
        className="text-blue-500 underline"
      >
        Link
      </a>,
    ];
  });
}

export const ViewSpecialGroups: React.FC<Props> = ({ event }: Props) => {
  const queryClient = useQueryClient();
  const specialEventsForEventQuery = useSpecialEventsForEvent({
    eventId: event.id,
    allEventIds: event.allEventIds,
  });
  const specialGroupsQuery = useSpecialGroups();

  const disabled =
    specialEventsForEventQuery.status === "loading" ||
    specialEventsForEventQuery.status === "idle" ||
    specialEventsForEventQuery.status === "error" ||
    specialGroupsQuery.status === "loading" ||
    specialGroupsQuery.status === "idle" ||
    specialGroupsQuery.status === "error";

  return (
    <Popup
      className={cn(
        "fixed left-[50%] top-[50%] w-full w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-softBeige px-3 py-4",
        "md:w-[40rem] md:py-6 md:px-8"
      )}
      onOpenChange={() => {
        queryClient.invalidateQueries(
          SPECIAL_EVENTS_QUERY_KEYS.fetchSpecialEventsForEvent(event.id)
        );
      }}
      trigger={
        <button
          className={cn(
            "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white outline-none",
            "lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:shadow-newLeafGreen lg:transition-all",
            disabled
              ? "opacity-50"
              : "lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen"
          )}
          disabled={disabled}
          type="button"
        >
          View Special Groups
        </button>
      }
    >
      <>
        <Modal.Title className="m-0 flex justify-center text-xl font-bold text-newLeafGreen lg:px-16 lg:text-3xl">
          View Event Special Groups
        </Modal.Title>
        <div className="h-3 md:h-6" />
        {!disabled &&
          specialEventsForEventQuery.data &&
          specialGroupsQuery.data && (
            <div className="h-96">
              <DataTable
                borderColor="newLeafGreen"
                columnHeaders={["Name", "Sign-up Link"]}
                dataRows={processSpecialGroups(
                  specialEventsForEventQuery.data,
                  specialGroupsQuery.data
                )}
              />
            </div>
          )}
        <div className="h-4" />
        <div className="flex justify-center">
          <Modal.Close
            className={cn(
              "rounded-full bg-newLeafGreen px-3 py-2 text-xs font-semibold text-white hover:brightness-150 focus:brightness-150",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            )}
          >
            Done
          </Modal.Close>
        </div>
      </>
    </Popup>
  );
};
