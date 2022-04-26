import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import './CurrentEvent.css'
import {FiExternalLink} from 'react-icons/fi';

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
      <Active isActive={isActive}/>
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
            <div className="countContainer">
              <p className="countText">Drivers</p>
              <p className="countValue">{driverCount}</p>
            </div>
            <div className="countContainer">
              <p className="countText">Volunteers</p>
              <p className="countValue">{volunteerCount}</p>
            </div>
          </div>
        </div>
        <div className="currentEventOptions">
          <Link to="/" className="currentEventOption">Manage This Event</Link>
          <Link to="/" className="currentEventOption">Visit Webpage<FiExternalLink className="linkIcon"/></Link>
        </div>
      </div>
    </div>
  );
}

function Active(props){
  const isActive = props.isActive
  
  return (
    <>
      {isActive
      ? <div className="activeText">
          <div className="blueCircle"></div>
          <div>This event is currently active</div>
        </div>
      : <div className="activeText">
          <div className="blueCircle"></div>
          <div>Event not currently active</div>
        </div>
      }
    </>
  )
}

export default CurrentEvent;