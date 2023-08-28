import toast from "react-hot-toast";

type toast = "success" | "failure" | "alert";
export function toastNotify(message: string, toastType?: toast) {
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

export function cn(...inputs: string[]) {
  const a = inputs.join(" ");
  console.log("a", a);
  return inputs.join(" ");
}

