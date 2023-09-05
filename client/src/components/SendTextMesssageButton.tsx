import { useMutation, useQuery, UseQueryResult } from "react-query";
import { useAuth } from "../contexts/AuthContext";
import { cn, toastNotify } from "../utils/ui";
import { ProcessedTextAutomation } from "../types";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "./Popup";
import { Loading } from "./Loading";

// TODO: This component can probably also be used on the "ViewEvent.tsx" page
interface Props {
  label: string;
  loading: boolean;
  url: string;
  successMessage: string;
  errorMessage: string;
}

export const SendTextMessageButton: React.FC<Props> = ({
  label,
  loading,
  url,
  successMessage,
  errorMessage,
}) => {
  const { token } = useAuth();

  const lastMessagesSent = useQuery(["fetchLastMessagesSent"], async () => {
    const resp = await fetch(`/api/messaging/last-texts-sent`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json() as Promise<ProcessedTextAutomation[]>;
  });

  const sendTextMessage = useMutation({
    mutationFn: async () => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }
      return response.json();
    },
    onSuccess(data, variables, context) {
      toastNotify(successMessage, "success");
    },
    onError(error, variables, context) {
      console.error(error);
      toastNotify(errorMessage, "failure");
    },
  });

  return (
    <Popup
      trigger={
        <button
          className={cn(
            "bg-pumpkinOrange rounded-full px-3 py-2 text-sm font-semibold text-white",
            "lg:shadow-newLeafGreen lg:hover:shadow-newLeafGreen lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg"
          )}
        >
          {label}
        </button>
      }
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full -translate-x-1/2 -translate-y-1/2 rounded-lg px-3 py-4",
        "md:w-[40rem] md:py-6 md:px-8"
      )}
    >
      <>
        <Modal.Title className="text-newLeafGreen text-center font-semibold lg:text-xl">
          {lastMessagesSent.data?.length
            ? "Last Messages Sent:"
            : "Are you sure you want to send this message?"}
        </Modal.Title>
        {getModalContent(lastMessagesSent)}
        <div className="row-auto flex justify-center space-x-2">
          <Modal.Close
            className={cn(
              "rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 focus:brightness-110",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            )}
          >
            Cancel Send
          </Modal.Close>
          <Modal.Close
            className={cn(
              "bg-newLeafGreen rounded-full px-3 py-2 text-xs font-semibold text-white",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold",
              "hover:cursor-pointer hover:brightness-150",
              "focus:brightness-200"
            )}
            disabled={loading || sendTextMessage.status === "loading"}
            onClick={() => sendTextMessage.mutate()}
          >
            Confirm Send
          </Modal.Close>
        </div>
      </>
    </Popup>
  );
};

// if there was a message sent in the last 7 days show the name of it, who sent it
// and when it was sent, otherwise just ask are you sure you want to send
// this message
function getModalContent(
  lastMessagesSent: UseQueryResult<ProcessedTextAutomation[], unknown>
) {
  const modalContentClassNames = "my-2 h-[25rem] px-1";

  if (
    lastMessagesSent.status === "loading" ||
    lastMessagesSent.status === "idle"
  ) {
    return (
      <div className={modalContentClassNames}>
        <Loading size="small" thickness="thin" />
      </div>
    );
  }
  if (lastMessagesSent.status === "error") {
    return (
      <div
        className={cn(
          modalContentClassNames,
          "flex items-center justify-center"
        )}
      >
        <div>There was an error fetching previously sent text messages...</div>
      </div>
    );
  }
  if (lastMessagesSent.data.length === 0) {
    //Spacer element
    return <div className="h-[2rem]" />;
  }
  return (
    <div
      className={cn(
        modalContentClassNames,
        "flex flex-col gap-4 overflow-scroll"
      )}
    >
      {lastMessagesSent.data
        .sort((a, b) => {
          return new Date(b["Date"]).getTime() - new Date(a["Date"]).getTime();
        })
        .map((message, index) => {
          const date = new Date(message["Date"]);
          const localTimeNoSeconds = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          });
          return (
            <div
              key={index}
              className="flex flex-col items-start gap-2 text-base lg:text-lg"
            >
              <p className="text-newLeafGreen font-semibold">
                {message["Text Type"]}
              </p>
              <p className="text-sm text-gray-500">
                {`Sent by ${message["Triggered by"]} from the number ${
                  message["Sent by"]
                } on ${date.toLocaleDateString()} at ${localTimeNoSeconds}`}
              </p>
            </div>
          );
        })}
    </div>
  );
}
