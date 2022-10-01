import React, { useState, useEffect } from "react";
import "./EventOverview.css";
import ProgressBar from "react-bootstrap/ProgressBar";
import Airtable from "airtable";

function EventOverview() {
  // state variables
  const [date, setDate] = useState("");
  const [group, setGroup] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");
  const [general, setGeneral] = useState("");
  const [needed, setNeeded] = useState("");

  const api_key = process.env.REACT_APP_API_KEY;

  // make a api call to get a sample event 'recJgNdhgq8BlqcBj' and set the state variables declared above.
  // the variables record contains the returned sample event
  const getRecord = () => {
    base("🚛 Supplier Pickup Events").find(
      "recJgNdhgq8BlqcBj",
      function (err, record) {
        if (err) {
          console.error(err);
          return;
        }

        setLocation(record.fields["Pickup Address (from 🥑 Supplier CRM)"]);
        setDate(record.fields["Date"]);
        setLink(record.fields["Shortened Link to Special Event Signup Form"]);
        setGeneral(record.fields["Total Count of Drivers for Event"]);
        // Turn the date from a string to a date object and format it
        var [month, day, year] = String(record.fields["Date"]).split("/");
        var date_object = new Date(+year, month - 1, +day);
        setNeeded(record.fields["Count of Driving Slots Available"]);
        setDate(date_object.toDateString());
        console.log("Retrieved", record.id);

        /* If the record has an associated volunteer group make an api call to get the volunteer
        group name */
        if (record.fields["Volunteer Group"]) {
          base("Volunteer Groups").find(
            record.fields["Volunteer Group"],
            function (err, group) {
              if (err) {
                console.error(err);
                return;
              }
              setGroup(group.fields["Name"]);
              console.log("Retrieved", group.id[0]);
            }
          );
        }
      }
    );
  };

  const base = new Airtable({ apiKey: api_key }).base("appCVXBrL5oceApI4");

  /* run getRecord on page load, the second argument [] specifies that we only want to use
   an effect and clean it up only once (on mount and unmount) */
  useEffect(() => {
    getRecord();
  }, []);

  return (
    <div className="event-container">
      <div className="event-title">
        <h1>Overview</h1>
      </div>
      <div className="overview">
        <div className="overview-info">
          <div className="info">
            Event Date
            <br />
            <b>{date}</b>
          </div>
          <div className="info">
            Group
            <br />
            <b>{group}</b>
          </div>
          <div className="info">
            Pickup Location
            <br />
            <b>{location}</b>
          </div>
          <div className="info">
            Event Website Link
            <br />
            <b>
              <a href={link}>{link}</a>
            </b>
          </div>
        </div>
        <div className="graphic">
          <p>Current Drivers</p>
          <ProgressBar>
            {/* Logic for creating a progress bar that is spaced out proportional to driver amounts*/}
            <ProgressBar variant={"special"} label={0} now={0} key={1} />
            <ProgressBar
              variant={"general"}
              label={general}
              now={(general / (general + needed)) * 100}
              key={2}
            />
            <ProgressBar
              variant={"needed"}
              label={needed}
              now={(needed / (general + needed)) * 100}
              key={3}
            />
          </ProgressBar>
          <div className="legend">
            <div className="label special"></div>
            <p>Special Group Drivers</p>
          </div>
          <div className="legend">
            <div className="label general"></div>
            <p>General Volunteer Drivers</p>
          </div>
          <div className="legend">
            <div className="label needed"></div>
            <p>Drivers Still Needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventOverview;
