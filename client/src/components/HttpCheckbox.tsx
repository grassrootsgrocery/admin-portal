import { Checkbox } from "./Checkbox";
import { useState } from "react";
import { useMutation } from "react-query";
import { Loading } from "./Loading";

/* 
A checkbox that makes an http request when checked using. Keeps track of a loading state. 
*/
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

  //UI
  return (
    <div className="r relative flex h-full w-full items-center justify-center">
      {httpRequest.status !== "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <Checkbox isChecked={isChecked} onClick={() => httpRequest.mutate()} />
      )}
    </div>
  );
};
