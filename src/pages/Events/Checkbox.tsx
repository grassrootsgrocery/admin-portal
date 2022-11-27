import * as Check from "@radix-ui/react-checkbox";
// import { CheckIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { Loading } from "../../components/Loading";

const key = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID_DEV = "app18BBTcWqsoNjb2";

interface Props {
  volunteerId: string;
  fieldId: string;
  checked: boolean;
  onSuccess: () => void;
  onError: () => void;
}
export const Checkbox: React.FC<Props> = ({
  volunteerId,
  fieldId,
  checked,
  onSuccess,
  onError,
}: Props) => {
  const [isChecked, setIsChecked] = useState(checked);
  const applyPatch = useMutation({
    mutationFn: async () => {
      const data = {
        records: [
          {
            id: volunteerId,
            fields: { [fieldId]: !checked },
          },
        ],
      };
      const json = JSON.stringify(data);
      const resp = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID_DEV}/%F0%9F%93%85%20Scheduled%20Slots`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: json,
        }
      );
      return resp.json();
    },
    onSuccess(data, variables, context) {
      setIsChecked((prevVal) => !prevVal);
      onSuccess();
    },
    onError(error, variables, context) {
      console.error(error);
      onError();
    },
  });

  return (
    <div className="relative flex h-full justify-center">
      {applyPatch.status === "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <Check.Root
          className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
          checked={isChecked}
          id="c1"
          onClick={() => applyPatch.mutate()}
        >
          <Check.Indicator className="CheckboxIndicator">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </Check.Indicator>
        </Check.Root>
      )}
    </div>
  );
};
