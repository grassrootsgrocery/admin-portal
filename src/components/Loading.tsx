import "./Loading.css";
interface Props {
  size: "xsmall" | "small" | "medium" | "large";
  thickness: "thin" | "thicc" | "extra-thicc";
}

function getClassNames({ size, thickness }: Props) {
  let classes = "";
  switch (size) {
    case "xsmall":
      classes += "after:w-4 after:h-4";
      break;
    case "small":
      classes += "after:w-8 after:h-8";
      break;
    case "medium":
      classes += "after:w-12 after:h-12";
      break;
    case "large":
      classes += "after:w-16 after:h-16";
      break;
    default:
      break;
  }
  classes += " ";
  switch (thickness) {
    case "thin":
      classes += "after:border-2";
      break;
    case "thicc":
      classes += "after:border-4";
      break;
    case "extra-thicc":
      classes += "after:border-8";
      break;
    default:
      break;
  }
  return classes;
}
export const Loading: React.FC<Props> = (props) => {
  const tailwindClasses = getClassNames(props);
  return <div className={"loading " + tailwindClasses}></div>;
};
