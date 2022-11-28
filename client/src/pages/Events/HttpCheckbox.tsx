import * as Checkbox from "@radix-ui/react-checkbox";
import { useState } from "react";
import { useMutation } from "react-query";
import { Loading } from "../../components/Loading";
import { API_BASE_URL } from "../../httpUtils";
import check_icon from "../../assets/checkbox-icon.svg";

interface Props {
  checked: boolean;
  mutationFn: () => Promise<any>;
  onSuccess: () => void;
  onError: () => void;
}
export const HttpCheckbox: React.FC<Props> = ({
  checked,
  mutationFn,
  onSuccess,
  onError,
}: Props) => {
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
  if (httpRequest.isError) {
    console.log("IT'S AN ERROR");
  }
  return (
    <div className="relative flex h-full justify-center">
      {httpRequest.status === "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <Checkbox.Root
          className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
          checked={isChecked}
          id="c1"
          onClick={() => httpRequest.mutate()}
        >
          <Checkbox.Indicator className="CheckboxIndicator">
            <img src={check_icon} alt="" />
          </Checkbox.Indicator>
        </Checkbox.Root>
      )}
    </div>
  );
};
