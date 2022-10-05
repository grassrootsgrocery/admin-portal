import "./DataTable.css";
import React, { useState, useEffect } from "react";

function DataTable() {
  const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
  const [records, setRecords] = useState([]);

  // Pull data from the Scheduled Slots table
  const fetchSchedSlotsData = () => {
    fetch(
      `https://api.airtable.com/v0/app7zige4DRGqIaL2/%F0%9F%93%85%20Scheduled%20Slots?api_key=${AIRTABLE_API_KEY}`
    )
      .then((resp) => resp.json())
      .then((data) => {
        setRecords(data.records);
        console.log("SCHEDULED SLOTS:");
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchSchedSlotsData();
  }, [AIRTABLE_API_KEY]);

  // Pull data from the Volunteer CRM table
  const fetchVolunteerData = () => {
    fetch(
      `https://api.airtable.com/v0/app7zige4DRGqIaL2/%F0%9F%99%8B%F0%9F%8F%BDVolunteers%20CRM?api_key=${AIRTABLE_API_KEY}`
    )
      .then((resp) => resp.json())
      .then((data) => {
        setRecords(data.records);
        console.log("VOLUNTEERS CRM:");
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchVolunteerData();
  }, [AIRTABLE_API_KEY]);

  // Prints Records with First Name "Julie"
  records.map((record) => {
    if (record.fields["First Name"] === "Julie") {
      console.log(
        "Full Name: " +
          record.fields["Full Name"] +
          "\nPhone Number: " +
          record.fields["Phone Number"]
      );
    }
  });

  // Get Volunteer CRM DataTable Fields
  //   const DisplayData = records.map((record) => {
  //     return (
  //       <tr>
  //         <td>{record.fields["Full Name"]}</td>
  //         <td>{record.fields["Email Address"]}</td>
  //         <td>{record.fields["Phone Number"]}</td>
  //         <td>{record.fields["Notes from Volunteer"]}</td>
  //       </tr>
  //     );
  //   });

  return null;

  // Display Volunteer CRM DataTable
  //   return (
  //     <div className="DataTable">
  //       <table>
  //         <thead style={{ backgroundColor: "#E6E6F0" }}>
  //           <tr>
  //             <th>Full Name</th>
  //             <th>Email Address</th>
  //             <th>Phone Number</th>
  //             <th style={{ width: "40%" }}>Notes</th>
  //           </tr>
  //         </thead>

  //         <tbody>{DisplayData}</tbody>
  //       </table>
  //     </div>
  //   );
}

export default DataTable;
