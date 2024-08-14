import React, { ReactNode } from "react";
import "./Tooltip.css";
import Tooltip from "./ToolTip";

interface Props {
  columnHeaders: ReactNode[];
  dataRows: (string | number | JSX.Element)[][];
  borderColor: "softGrayWhite" | "newLeafGreen";
}

function getBorderColorClassName(
  borderColor: "softGrayWhite" | "newLeafGreen"
) {
  switch (borderColor) {
    case "newLeafGreen":
      return "border-newLeafGreen";
    case "softGrayWhite":
      return "border-softGrayWhite";
  }
}

export const DataTable: React.FC<Props> = ({
  columnHeaders,
  dataRows,
  borderColor,
}: Props) => {
  return (
    <div
      className={`hide-scroll h-full w-full overflow-scroll rounded-lg border-4 ${getBorderColorClassName(
        borderColor
      )}`}
    >
      <table className="table w-full border-separate border-spacing-0 rounded-lg">
        <thead className="sticky top-0 z-10 border-b-2 border-newLeafGreen bg-softBeige">
          <tr>
            {columnHeaders.map((h, i) => (
              <th
                key={i}
                className="border-b-2 border-newLeafGreen bg-softBeige p-4 text-sm text-newLeafGreen md:text-base"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.length === 0 ? (
            <tr>
              <td
                colSpan={columnHeaders.length}
                className="py-4 text-center text-2xl"
              >
                No Data Available
              </td>
            </tr>
          ) : (
            dataRows.map((row) => {
              const [id, ...data] = row;
              if (typeof id !== "string" && typeof id !== "number") {
                console.error(
                  "Please provide an ID of type 'string' or 'number' as the first entry of each row."
                );
                return null;
              }
              return (
                <tr key={id}>
                  {data.map((datum, idx) => (
                    <td
                      key={idx}
                      className="border border-newLeafGreen bg-softBeige px-2 py-2 text-center align-middle text-sm text-newLeafGreen md:text-base"
                    >
                      {datum}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
