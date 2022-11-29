import { useEffect, useRef, useState } from "react";
//Assets
import chevron_up from "../assets/chevron-up.svg";
import chevron_down from "../assets/chevron-down.svg";

interface DropdownItemProps {
  isSelected: boolean;
  onSelect: () => void;
  content: JSX.Element;
}
const DropdownItem: React.FC<DropdownItemProps> = ({
  isSelected,
  onSelect,
  content,
}: DropdownItemProps) => {
  return (
    <li
      className={`flex min-w-fit shrink-0 items-center gap-1 rounded-lg border border-newLeafGreen px-2 text-left font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        isSelected ? "bg-newLeafGreen text-white" : "bg-white text-newLeafGreen"
      }`}
      onClick={onSelect}
    >
      {content}
      {/* <div className="w-10/12">{filterLabel}</div>
      <Checkbox.Root
        className={`ml-auto flex h-4 w-4 items-end justify-end rounded border border-newLeafGreen hover:brightness-110 ${
          selected ? "bg-white" : "bg-softGrayWhite"
        }`}
        checked={selected}
        id="c1"
      >
        <Checkbox.Indicator className="CheckboxIndicator">
          <img src={checkbox_icon} alt="" />
        </Checkbox.Indicator>
      </Checkbox.Root> */}
    </li>
  );
};

//Taken from y-knot code base. Used to track click event outside of the dropdown.
const useClickOutside = (onClickOutside: () => void) => {
  const domNodeRef = useRef<any>(null);

  const clickedOutsideDomNodes = (e: any) => {
    return !domNodeRef.current || !domNodeRef.current.contains(e.target);
  };
  //Because I gave up on trying to get the types to work.
  const handleClick = (e: any) => {
    e.preventDefault();
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

interface Props {
  dropdownItems: { onSelect: () => void; content: JSX.Element }[];
}
export const MultiselectDropdown: React.FC<Props> = ({
  dropdownItems,
}: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selected, setSelected] = useState(
    Array(dropdownItems.length).fill(false)
  );
  const [dropdownRef] = useClickOutside(() => setIsDropdownOpen(false));

  const onItemSelect = (idx: number) => {
    const newSelected = [...selected];
    newSelected[idx] = !selected[idx];
    setSelected(newSelected);
    dropdownItems[idx].onSelect();
  };

  return (
    <div className="flex h-9 items-start gap-8">
      <div
        className={`flex flex-col items-start ${
          isDropdownOpen ? "z-50" : "z-0"
        }`}
        ref={dropdownRef}
      >
        {/* Dropdown */}
        <div className="relative">
          <h1
            className={
              "relative flex w-52 select-none items-center justify-between rounded-lg border bg-newLeafGreen px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110" +
              (isDropdownOpen ? " z-50 brightness-110" : "z-0")
            }
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Assign
            <img
              className="w-2 md:w-3"
              src={isDropdownOpen ? chevron_up : chevron_down}
              alt="chevron-icon"
            />
          </h1>
          {
            <ul
              className={`absolute flex flex-col gap-2 rounded-lg border bg-white shadow-md  ${
                isDropdownOpen
                  ? "hide-scroll z-50 h-36 overflow-y-scroll py-2 px-2"
                  : "z-0"
              }`}
            >
              {isDropdownOpen &&
                dropdownItems.map((item, i) => (
                  <DropdownItem
                    key={i}
                    isSelected={selected[i]}
                    onSelect={() => onItemSelect(i)}
                    content={item.content}
                  />
                ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
};
