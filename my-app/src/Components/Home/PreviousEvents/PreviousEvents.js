import React, {useState, useEffect} from 'react';
import Airtable from 'airtable';
import "./Prev.css";
import { Link } from "react-router-dom";

function Event(props) {
  return (
    <div className="event">
      <div className="left_col">
        <div className="date">
          <p> {props.date} </p>
        </div>
        <div className="group">
          <p>Volunteer Group</p>
          <p>
            <span className="group_name">{props.group}</span>
          </p>
        </div>
        <div className="pickup">
          <p>Pickup Location</p>
          <p>
            <span className="pickup_name">{props.pickup}</span>
          </p>
        </div>
      </div>
      <div className="right_col">
        <div className="turnout">
          <p>Participant Turnout</p>
        </div>
        <div className="group_drivers">
          <p>
            <span className="driver_amount">{props.group_drivers}</span>{" "}
            {props.group} Drivers
          </p>
        </div>
        <div className="general_drivers">
          <p>
            <span className="driver_amount">{props.general_drivers}</span>{" "}
            General Drivers
          </p>
        </div>
        <div className="total_drivers">
          <p>
            <span className="needed_background">
              <span className="driver_amount">{props.total_drivers}</span>
              <span className="needed_text">
                Total of <span>{props.needed_drivers} Needed</span>
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
function PreviousEvents() {
  const [events, setEvents] = useState([
    // {
    //   date: "March 10th, 2022",
    //   group: "Hack4Impact",
    //   pickup: "Start Lighthouse",
    //   group_drivers: 8,
    //   general_drivers: 17,
    //   total_drivers: 25,
    //   needed_drivers: 25,
    // },
    // {
    //   date: "February 24th, 2022",
    //   group: "Hack4Impact",
    //   pickup: "Start Lighthouse",
    //   group_drivers: 8,
    //   general_drivers: 17,
    //   total_drivers: 25,
    //   needed_drivers: 25,
    // },
  ]);

  const api_key = process.env.REACT_APP_API_KEY;

  const getRecords = () => {
    base("🚛 Supplier Pickup Events")
      .select({
        // Selecting the first 3 records in 🗄 All Records: Supplier Pickup Events:
        maxRecords: 2,
        view: "🗄 All Records: Supplier Pickup Events",
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.

          records.forEach(function (record) {

            if (record.fields["Volunteer Group"]) {
              base("Volunteer Groups").find(
                record.fields["Volunteer Group"],
                function (err, group) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  record.fields["Volunteer Group"] = group.fields["Name"];
                  console.log("Group " + record.fields["Volunteer Group"]);
                }
              );
            } else {
              record.fields["Name of Group"] = "NA";
            }

            if (record.fields["Supplier"]) {
              base("🥑 Supplier CRM").find(
                record.fields["Supplier"],
                function (err, group) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  record.fields["Supplier"] = group.fields["Name"];
                  console.log("Sup " + record.fields["Supplier"]);
                }
              )
            }
          });

          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
          setEvents(records);

          console.log(events[0].fields);
        },
        function done(err) {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
  };

  const base = new Airtable({ apiKey: api_key }).base("appCVXBrL5oceApI4");
  useEffect(() => {
    getRecords();
  }, []);

  return (
    <div className="prev_events">
      <div className="title">
        <p>Previous Events</p>
      </div>
      {events.map((event) => (
        <Event
          date={event.fields["Date"]}
          group={event.fields["Volunteer Group"]}
          pickup={event.fields["Supplier"]}
          group_drivers={event.group_drivers}
          general_drivers={event.general_drivers}
          total_drivers={event.fields["Total Count of Drivers for Event"]}
          needed_drivers={event.fields["Count of Driving Slots Available"]}
        />
      ))}
      <Link className="prev_see_more" to="/">
        See More
      </Link>
    </div>
  );
}

export default PreviousEvents;
