import "./Roster.css";

interface Props {
  body: any;
}
export const Table: React.FC<Props> = (props) => {
  //   const headers = props.headers.map((h) => <th>{h}</th>);

  //   [
  //     "#",
  //     "First Name",
  //     "Last Name",
  //     "Time Slot",
  //     "Participant Type",
  //     "Confirmed",
  //     "Special Group",
  //     "Delivery Type",
  //     "Email",
  //     "Text",
  //   ]
  //   const data = [
  //     {
  //       "#": 1,
  //       "First Name": "John",
  //       "Last Name": "Doe",
  //       "Time Slot": "11:15 am",
  //       "Participant Type": "Driver",
  //       Confirmed: true,
  //       "Special Group": "Blackrock",
  //       "Delivery Type": 1,
  //       Email: "john@gmail.com",
  //       Text: "123-345-5678",
  //     },
  //     {
  //       "#": 2,
  //       "First Name": "Jane",
  //       "Last Name": "Doe",
  //       "Time Slot": "11:00 am",
  //       "Participant Type": "Driver",
  //       Confirmed: true,
  //       "Special Group": "Blackrock",
  //       "Delivery Type": 1,
  //       Email: "jane@gmail.com",
  //       Text: "123-345-5678",
  //     },
  //     {
  //       "#": 3,
  //       "First Name": "Jack",
  //       "Last Name": "Black",
  //       "Time Slot": "11:45 am",
  //       "Participant Type": "Driver",
  //       Confirmed: true,
  //       "Special Group": "Blackrock",
  //       "Delivery Type": 1,
  //       Email: "john@gmail.com",
  //       Text: "123-345-5678",
  //     },
  //     {
  //       "#": 4,
  //       "First Name": "Jennifer",
  //       "Last Name": "Li",
  //       "Time Slot": "11:15 am",
  //       "Participant Type": "Driver",
  //       Confirmed: true,
  //       "Special Group": "Blackrock",
  //       "Delivery Type": 1,
  //       Email: "john@gmail.com",
  //       Text: "123-345-5678",
  //     },
  //     {
  //       "#": 1,
  //       "First Name": "John",
  //       "Last Name": "Doe",
  //       "Time Slot": "11:15 am",
  //       "Participant Type": "Driver",
  //       Confirmed: true,
  //       "Special Group": "Blackrock",
  //       "Delivery Type": 1,
  //       Email: "john@gmail.com",
  //       Text: "123-345-5678",
  //     },
  //   ].map((row) => (
  //     <tr>
  //       <td>{row["#"]}</td>
  //       <td>{row["First Name"]}</td>
  //       <td>{row["Last Name"]}</td>
  //       <td>{row["Time Slot"]}</td>
  //       <td>{row["Participant Type"]}</td>
  //       <td>
  //         <input type="checkbox" id="confirmed" />
  //       </td>
  //       <td>{row["Special Group"]}</td>
  //       <td>{row["Delivery Type"]}</td>
  //       <td>{row["Email"]}</td>
  //       <td>{row["Text"]}</td>
  //     </tr>
  //   ));

  const filters = ["Confirmed", "Only Drivers"].map((filter) => (
    <option value={filter}>{filter}</option>
  ));

  return (
    <div className="">
      <div className="roster w-max">
        <table className="table-table-ugh">
          <thead>
            <tr>
              {[
                "#",
                "First Name",
                "Last Name",
                "Time Slot",
                "Participant Type",
                "Confirmed",
                "Special Group",
                "Delivery Type",
                "Email",
              ].map((h) => (
                <th>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{props.body}</tbody>
        </table>
      </div>
    </div>
  );
};
