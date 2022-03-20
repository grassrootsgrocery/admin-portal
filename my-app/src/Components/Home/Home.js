import React from 'react';
import EventOptions from './EventOptions';
import CurrentEvent from './CurrentEvent';
import UpcomingEvents from './UpcomingEvents';
import PreviousEvents from './PreviousEvents';

function Home() {
  return (
    <div>
        <EventOptions/>
        <CurrentEvent/>
        <UpcomingEvents/>
        <PreviousEvents/>
    </div>
  )
}

export default Home;