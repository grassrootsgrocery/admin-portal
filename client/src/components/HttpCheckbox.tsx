import { Checkbox } from "./Checkbox";
import { useState } from "react";
import { useMutation } from "react-query";
import { Loading } from "./Loading";

/* 
A checkbox that makes an http request when checked using. Keeps track of a loading state. 
*/
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

  //UI
  return (
    <div className="relative flex h-full justify-center">
      {httpRequest.status === "loading" ? (
        <Loading size="xsmall" thickness="thin" />
      ) : (
        <Checkbox isChecked={isChecked} onClick={() => httpRequest.mutate()} />
      )}
    </div>
  );
};
