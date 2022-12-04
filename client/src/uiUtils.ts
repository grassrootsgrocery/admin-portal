import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

//Taken from y-knot code base. Used to track click event outside of dropdowns.
//12/2/2022 - This hook is incredibly cursed and should not be used.
export const useClickOutside = (onClickOutside: () => void) => {
  const domNodeRef = useRef<any>(null);

  const clickedOutsideDomNodes = (e: any) => {
    return !domNodeRef.current || !domNodeRef.current.contains(e.target);
  };
  //Because I gave up on trying to get the types to work.
  const handleClick = (e: any) => {
    if (clickedOutsideDomNodes(e)) {
      onClickOutside();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return [domNodeRef];
};

type toast = "success" | "failure" | "alert";
export function toastNotify(message: string, toastType: toast) {
  let icon = "";
  switch (toastType) {
    case "success":
      icon = "✅";
      break;
    case "failure":
      icon = "❌";
      break;
    case "alert":
      icon = "❗";
      break;
    default:
      //Because why not
      icon = "🥴";
      break;
  }
  toast(message, {
    duration: 3000,
    position: "top-center",
    icon: icon,
    ariaProps: {
      role: "status",
      "aria-live": "polite",
    },
  });
}
