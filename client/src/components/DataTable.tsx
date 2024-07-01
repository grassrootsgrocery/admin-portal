import React from "react";
import { cn } from "../utils/ui";

interface Props {
  columnHeaders: string[];
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
      className={cn(
        "hide-scroll h-full w-full overflow-scroll rounded-lg border-4",
        getBorderColorClassName(borderColor)
      )}
    >
      
      {/* Note that you cannot do border-${borderColor} above because of how Tailwind purges classes at build time*/}
      <table className="table w-full border-separate border-spacing-0  rounded-lg">
        <thead className="sticky top-0 z-10 border-b-2 border-newLeafGreen bg-softBeige">
          <tr>
            {columnHeaders.map((h, i) => {
              return (
                <th
                  key={i}
                  className="border-b-2 border-newLeafGreen bg-softBeige p-4 text-newLeafGreen text-sm md:text-base"
                >
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        
        <tbody>
          {dataRows.length === 0?(
            
            <tr>
              <td colSpan={columnHeaders.length} className="text-center py-4 text-2xl font-sans " >
                NO DATA AVAILABLE
              </td>
            </tr>
          ) : 
          ( 
            dataRows.map((row) => {
              const [id, ...data] = row;
              if (typeof id !== "string" && typeof id !== "number") {
                console.error(
                  "Please provide an ID of type 'string' or 'number' as the first entry of each row."
                );
                return;
              }
              return (
                <tr key={id}>
                  {data.map((datum, idx) => {
                    return (
                      <td
                        key={idx}
                        className="border border-newLeafGreen bg-softBeige px-2 py-2 text-center align-middle text-newLeafGreen text-sm md:text-base"
                      >
                        {datum}
                      </td>
                    );
                  })}
                </tr>
              );
            })
            )}
        </tbody>
      </table>
    </div>
  );
};
