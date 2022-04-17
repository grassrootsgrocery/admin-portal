import React, {useState} from 'react';
import './CurrentEvent.css'

function CurrentEvent(props){
  const [volunteerGroup, setVolunteerGroup] = useState('Hack4Impact');
  const [pickupLoc, setPickUpLoc] = useState('Start Lighthouse');
  const [driversNeeded, setDriversNeeded] = useState(25);
  const [date, setDate] = useState('Monday, March 14th');
  const [driverCount, setDriverCount] = useState(16);
  const [volunteerCount, setVolunteerCount] = useState(14);
  const [isActive, setIsActive] = useState(true);

  return (
    <div>
      {isActive
      ? <div className="activeText">
          <div>This event is currently active</div>
        </div>
      : <div className="activeText">
          <div>No active events</div>
        </div>
      }
      <div className='eventBox'>
        <div className='currentEventDate'>{date}</div>
        <div className='eventAttributes'>
          <div className='eventAttributesLeft'>
            <div>
              <p className="attributeTitle">Volunteer Group</p>
              <p className="attributeValue">{volunteerGroup}</p>
            </div>
            <div>
              <p className="attributeTitle">Pickup Location</p>
              <p className="attributeValue">{pickupLoc}</p>
            </div>
            <div>
              <p className="attributeTitle">Drivers Needed</p>
              <p className="attributeValue">{driversNeeded}</p>
            </div>
          </div>
          <div className='eventAttributesRight'>
            Hi
          </div>
        </div>
      </div>
    </div>
  );

  // return( 
  //   <div style={{padding: 10}}>
  //     <Active />
  //     <div className='Mcontainer'>
  //         <div className='date'>{date}</div>
  //         <EventInfo org = {volGroup} loc = {pickupLoc} drivers_needed = {numDriversNeeded}/>
  //     <div className = 'container'>
  //       <h5>Participants: </h5>
  //       <Counter name= 'Drivers' num={driverCount}/>
  //       <Counter name= 'Volunteers' num={volunteerCount}/>
  //     </div>
  //     <VolunteerTable/>
  //     <div className='container'>
  //     <Link to="/" className="currentEventOptions">Manage This Event</Link>
  //     <Link className="currentEventOptions" name = 'Manage This Event'>Manage This Event</Link>
  //     <Link className="currentEventOptions" name = 'Recruit'/>
  //     <Link className="currentEventOptions" name = 'Visit Webpage'/>
  //     </div>
  //     </div>
  //   </div>
  // );
}

function EventInfo(props){
  const org = props.org;
  const loc = props.loc;
  const drivers_needed = props.drivers_needed
  return(
    <div className='grid'>
        <text style={{gridColumn: 1, gridRow: 1}}>Volunteer Group</text>
        <text style={{gridColumn: 2, gridRow: 1}}>Pickup Location</text>
        <text style={{gridColumn: 3, gridRow: 1}}>Drivers Needed</text>
        <text style={{gridColumn: 1, gridRow: 2, fontSize: 20, fontWeight: 'bold'}}>{org}</text>
        <text style={{gridColumn: 2, gridRow: 2, fontSize: 20, fontWeight: 'bold'}}>{loc}</text>
        <text style={{gridColumn: 3, gridRow: 2, fontSize: 20, fontWeight: 'bold'}}>{drivers_needed}</text>
    </div>
  )
}

function VolunteerTable(props){
  return(
    <div className='table'>I am a table</div>
  )
}

function Link(props) {
  const name = props.name;
  return(<text style={{fontSize: 12, paddingTop: 15}}>{name}</text>)
}

export default CurrentEvent;