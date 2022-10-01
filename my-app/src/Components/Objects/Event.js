import React from "react";
class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      volunteerGroup: null,
      pickupLocation: null,
      date: null,
      active: false,
      webpage: null,
      driversNeeded: 0,
      drivers: Array(0),
      volunteers: Array(0),
    };
  }
}
