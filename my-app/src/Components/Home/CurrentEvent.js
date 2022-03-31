import React from 'react';
import './CurrentEvent.css'

function CurrentEvent(props){
  const vol_group = 'Hack4Impact';
  const pickup_loc = 'Lighthouse';
  const num_drivers_needed = 25;
  const date = 'March 14th, 2022';
  const drivers_have = 16;
  const volunteers_have = 14;
  return( 
    <div style={{padding: 10}}>
      <Active />
      <div className='Mcontainer'>
          <div className='date'>{date}</div>
          <EventInfo org = {vol_group} loc = {pickup_loc} drivers_needed = {num_drivers_needed}/>
      <div className = 'container'>
        <h5>Participants: </h5>
        <Counter name= 'Drivers' num={drivers_have}/>
        <Counter name= 'Volunteers' num={volunteers_have}/>
      </div>
      <VolunteerTable/>
      <div className='container'>
      <Link name = 'Manage'/>
      <Link name = 'Recruit'/>
      <Link name = 'Visit Webpage'/>
      </div>
      </div>
    </div>
  );
}

//event will need to have an active attribute which this will use
class Active extends React.Component{
  render(){
    let active = true;
    if(!active){
      return(<div className='rowC'>
      <div className='Rcircle'></div>
      <div className='activeText'>No active events</div>
      </div>
      )
    } else {
      return(<div className='rowC'>
      <div className='Gcircle'></div>
      <div className='activeText'>An event is currently active</div>
      </div>)
    }

  }
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

function Counter(props){
  const num = props.num;
  const name = props.name;
  return(
    <div className='drivers'>
      <h4>{name}</h4>
      <div className='driversNum'>{num}</div>
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