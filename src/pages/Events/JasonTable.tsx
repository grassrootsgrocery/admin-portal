import { AirtableResponse, ScheduledSlot } from "../../types";

import "./JasonTable.css";

interface Props {
  headings: string[];
  scheduledSlots: AirtableResponse<ScheduledSlot>;
}
export const JasonTable: React.FC<Props> = ({
  headings,
  scheduledSlots,
}: Props) => {
  const tdClasses =
    "border border-newLeafGreen bg-softBeige text-newLeafGreen p-4 text-center align-middle";
  return (
    <div className="hide-scroll h-1/3 w-fit overflow-auto rounded-lg border-4 border-softGrayWhite">
      <table className="table border-separate border-spacing-0 rounded-lg">
        <thead className="sticky top-0  border-b-2 border-newLeafGreen bg-softBeige ">
          {headings.map((h, i) => {
            return (
              <th
                key={i}
                className="border-b-2 border-newLeafGreen bg-softBeige p-4 text-newLeafGreen"
              >
                {h}
              </th>
            );
          })}
        </thead>
        <tbody>
          {scheduledSlots.records.map((scheduledSlot, idx) => {
            return (
              <tr key={scheduledSlot.id} className="">
                <td className={tdClasses}>{idx + 1}</td>
                <td className={tdClasses}>
                  {scheduledSlot.fields["First Name"]}
                </td>
                <td className={tdClasses}>
                  {scheduledSlot.fields["Last Name"]}
                </td>
                <td className={tdClasses}>
                  {scheduledSlot.fields["Correct slot time"]["error"]
                    ? "None"
                    : scheduledSlot.fields["Correct slot time"]}
                </td>
                <td className={tdClasses}>
                  {scheduledSlot.fields["Type"].length}
                </td>
                <td className={tdClasses}>
                  {scheduledSlot.fields["Confirmed?"] ? "Yes" : "No"}
                </td>
                <td className={tdClasses}>
                  {scheduledSlot.fields["Volunteer Status"]}
                </td>
                <td className={tdClasses}>IDK</td>
                <td className={tdClasses}>{scheduledSlot.fields["Email"]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
