import { useMutation, useQuery } from "react-query";
import { useAuth } from "../contexts/AuthContext";
import { cn, toastNotify } from "../utils/ui";
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
  "bg-pumpkinOrange lg:shadow-newLeafGreen lg:hover:shadow-newLeafGreen rounded-full px-3 py-2 text-sm font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold lg:shadow-md lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg";

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
      className={cn(
        "bg-softBeige fixed left-[50%] top-[50%] w-full w-full -translate-x-1/2 -translate-y-1/2 rounded-lg px-3 py-4",
        "md:w-[40rem] md:py-6 md:px-8"
      )}
    >
      <>
        <p className="ma text-newLeafGreen text-xl font-semibold">
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
                    <p className="text-newLeafGreen font-semibold">
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
          <Modal.Close
            className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:brightness-110 focus:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
          >
            Cancel Send
          </Modal.Close>
          <Modal.Close
            className={cn("bg-newLeafGreen rounded-full px-3 py-2 text-xs font-semibold text-white",
              "lg:px-5 lg:py-3 lg:text-base lg:font-bold",
              "hover:cursor-pointer hover:brightness-150",
              "focus:brightness-200")}
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
