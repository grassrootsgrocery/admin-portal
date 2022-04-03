import React from 'react';
import EventOverview from './EventOverview';
import EventSchedule from './EventSchedule';
import EventParticipants from './EventParticipants';
import EventButton from './EventButton';
import "./Events.css";

function Events() {
  return (
    <div className="events">
        <EventOverview/>
        <EventSchedule/>
        <EventParticipants/>
        <EventButton/>
    </div>
  )
}

export default Events;