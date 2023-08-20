import { useMutation, useQuery } from "react-query";
import { useAuth } from "../contexts/AuthContext";
import { toastNotify } from "../utils/ui";
import { ProcessedTextAutomation } from "../types";
import * as Modal from "@radix-ui/react-dialog";
import { Popup } from "./Popup";

// TODO: This component can probably also be used on the "ViewEvent.tsx" page
interface Props {
  label: string;
  loading: boolean;
  url: string;
  successMessage: string;
  errorMessage: string;
}

const btn =
  "rounded-full bg-pumpkinOrange px-3 py-2 text-sm font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:shadow-newLeafGreen lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-newLeafGreen";

export const SendTextMessageButton: React.FC<Props> = ({
  label,
  loading,
  url,
  successMessage,
  errorMessage,
}: Props) => {
  const { token } = useAuth();

  const lastMessagesSent = useQuery(
    ["fetchLastMessagesSent"],
    async (): Promise<ProcessedTextAutomation[]> => {
      const resp = await fetch(
        `/api/messaging/last-texts-sent`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.message);
      }

      return resp.json();
    }
  );

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

  // if there was a message sent in the last 7 days show the name of it, who sent it
  // and when it was sent, otherwise just ask are you sure you want to send
  // this message
  return (
    <Popup
      trigger={<button className={btn}>{label}</button>}
    >
      <>
        <p className="ma text-xl font-semibold text-newLeafGreen">
          {lastMessagesSent.data?.length
            ? "Last Messages Sent:"
            : "Are you sure you want to send this message?"}
        </p>
        <div className="flex max-h-64 flex-col gap-4 overflow-y-scroll ">
          {lastMessagesSent.data?.length
            ? [...lastMessagesSent.data]
              .sort((a, b) => {
                return (
                  new Date(b["Date"]).getTime() -
                  new Date(a["Date"]).getTime()
                );
              })
              .map((message, index) => {
                const date = new Date(message["Date"]);
                const localTimeNoSeconds = date.toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "numeric",
                  }
                );
                return (
                  <div
                    key={index}
                    className="flex flex-col items-start gap-2 text-base lg:text-lg"
                  >
                    <p className="font-semibold text-newLeafGreen">
                      {message["Text Type"]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {`Sent by ${message["Triggered by"]
                        } from the number ${message["Sent by"]
                        } on ${date.toLocaleDateString()} at ${localTimeNoSeconds}`}
                    </p>
                  </div>
                );
              })
            : null}
        </div>
        <div className="row-auto flex justify-center space-x-2">
          <Modal.Close className="rounded-full bg-red-700 px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base">
            Cancel Send
          </Modal.Close>
          <Modal.Close
            className="rounded-full bg-newLeafGreen px-2 py-1 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen outline-none transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-newLeafGreen md:px-4 md:py-2 lg:text-base"
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
