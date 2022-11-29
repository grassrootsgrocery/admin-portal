import * as RadixCheckbox from "@radix-ui/react-checkbox";
//Assets
import check_icon from "../assets/checkbox-icon.svg";

interface Props {
  isChecked: boolean;
  onClick: () => void;
}
export const Checkbox: React.FC<Props> = ({ isChecked, onClick }: Props) => {
  return (
    <RadixCheckbox.Root
      className="flex h-5 w-5 items-center justify-center rounded border-2 border-newLeafGreen bg-softGrayWhite shadow-md hover:brightness-110"
      checked={isChecked}
      id="c1"
      onClick={onClick}
    >
      <RadixCheckbox.Indicator className="CheckboxIndicator">
        <img src={check_icon} alt="" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
};
