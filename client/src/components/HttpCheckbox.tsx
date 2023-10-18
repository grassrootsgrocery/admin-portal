import { useMutation, useQuery } from "react-query";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import check_icon from "../assets/checkbox-icon.svg";

interface HttpCheckboxProps {
  checked: boolean;
  mutationFn: any; //This needs to be generic enough
  onSuccess: () => void;
  onError: () => void;
}
export const HttpCheckbox: React.FC<HttpCheckboxProps> = ({
  checked,
  mutationFn,
  onSuccess,
  onError,
}: HttpCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(checked);
  const httpRequest = useMutation({
    mutationFn: mutationFn,
    onSuccess(data, variables, context) {
      setIsChecked((prevVal) => !prevVal);
      onSuccess();
    },
    onError(error, variables, context) {
      console.error(error);
      onError();
    },
  });

  // fixes state issue in react-table
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  //UI
  return (
    <div className="relative flex h-full items-center justify-center">
      {httpRequest.status === "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <RadixCheckbox.Root
          className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
          checked={isChecked}
          onClick={() => httpRequest.mutate()}
        >
          <RadixCheckbox.Indicator className="CheckboxIndicator">
            <img src={check_icon} alt="" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
      )}
    </div>
  );
};
