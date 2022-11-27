import * as Checkbox from "@radix-ui/react-checkbox";
import { useState } from "react";
import { useMutation } from "react-query";
import { Loading } from "../../components/Loading";

interface Props {
  volunteerId: string;
  checked: boolean;
  onSuccess: () => void;
  onError: () => void;
}
export const ConfirmVolunteerCheckbox: React.FC<Props> = ({
  volunteerId,
  checked,
  onSuccess,
  onError,
}: Props) => {
  const [isChecked, setIsChecked] = useState(checked);

  const confirmVolunteer = useMutation({
    mutationFn: async () => {
      const resp = await fetch(
        `http://localhost:5000/api/volunteers/confirm/${volunteerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newConfirmationStatus: !checked }),
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
      {confirmVolunteer.status === "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <Checkbox.Root
          className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
          checked={isChecked}
          id="c1"
          onClick={() => confirmVolunteer.mutate()}
        >
          <Checkbox.Indicator className="CheckboxIndicator">
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
          </Checkbox.Indicator>
        </Checkbox.Root>
      )}
    </div>
  );
};
