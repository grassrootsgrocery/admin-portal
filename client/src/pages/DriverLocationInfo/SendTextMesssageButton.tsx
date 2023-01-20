import { useMutation } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import { toastNotify } from "../../uiUtils";

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
}: Props) => {
  const { token } = useAuth();

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
    <button
      onClick={() => sendTextMessage.mutate()}
      disabled={loading || sendTextMessage.status === "loading"}
      className={`rounded-full bg-pumpkinOrange px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-newLeafGreen  lg:px-5 lg:py-3 lg:text-base lg:font-bold ${
        loading
          ? "opacity-50"
          : "transition-all hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-md hover:shadow-newLeafGreen"
      }`}
    >
      {label}
    </button>
  );
};
