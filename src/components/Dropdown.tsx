import { useEffect, useState } from "react";
import { FilterScheduledSlot } from "../App";

interface Props {}
const items = [
  "Confirmed",
  "Not Confirmed",
  "Only Drivers",
  "Only Packers",
  "Packers & Drivers",
];

const FilterItem: React.FC<{ onSelect: () => void; item: string }> = (props: {
  onSelect: () => void;
  item: string;
}) => {
  const [selected, setSelected] = useState(false);
  const handleClick = () => {
    console.log("Here");
    setSelected((prev) => !prev);
    props.onSelect();
  };
  return (
    <li
      className={`rounded-lg border border-pumpkinOrange px-2 font-semibold shadow-md hover:cursor-pointer hover:brightness-110 ${
        selected ? "bg-pumpkinOrange text-white" : "bg-white text-pumpkinOrange"
      }`}
      onClick={handleClick}
    >
      {props.item}
    </li>
  );
};

interface Props {
  filterProps: { label: string; filter: (e: FilterScheduledSlot) => boolean }[];
  ss: FilterScheduledSlot[];
}

export const Dropdown: React.FC<Props> = ({ filterProps, ss }) => {
  const [watchers, setWatchers] = useState(
    Array(filterProps.length).fill(false)
  );
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(ss);
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("Use Effect");
    let filtered = ss;
    for (let i = 0; i < watchers.length; i++) {
      if (watchers[i]) {
        filtered = filtered.filter(filterProps[i].filter);
      }
    }
    setFiltered(filtered);
    setCount((count) => count + 1);
  }, watchers);

  return (
    <>
      <div className="flex justify-center">
        <div className="rounded-lg border border-red-500 bg-softBeige">
          <h1
            className="flex w-40 select-none items-center rounded-lg border bg-pumpkinOrange px-2 py-1 font-semibold text-white hover:cursor-pointer hover:brightness-110"
            onClick={() => setOpen(!open)}
          >
            Filter
          </h1>
          {
            <ul className={`flex flex-col gap-2 p-2 ${!open ? "hidden" : ""}`}>
              {filterProps.map((item, i) => (
                <FilterItem
                  key={i}
                  onSelect={() => {
                    console.log("On select", i);
                    let newWatchers = [...watchers];
                    newWatchers[i] = !watchers[i];
                    setWatchers(newWatchers);
                  }}
                  item={item.label}
                />
              ))}
            </ul>
          }
        </div>
      </div>
      <div className="m-16 w-36 rounded border">
        <ul>
          {filtered.map((item, idx) => {
            return <li key={idx}>{item.name}</li>;
          })}
        </ul>
        {/* <div>{count}</div> */}
      </div>
    </>
  );
};
