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
        <div className='vertical'>
          <Date date = {date}/>
          <div className='container'>
            <EventInfo type = 'Volunteer Group' value= {vol_group}/>
            <EventInfo type = 'Pickup Location' value= {pickup_loc}/>
            <EventInfo type = 'Drivers Needed' value= {num_drivers_needed}/>
          </div>
        </div>
      
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
      <h2>No active events</h2>
      </div>
      )
    } else {
      return(<div className='rowC'>
      <div className='Gcircle'></div>
      <h2>An event is currently active</h2>
      </div>)
    }

  }
}

function Date(props) {
  return(<div><h1>{props.date}</h1></div>)
}

function EventInfo(props){
  const type = props.type;
  const value = props.value;
  return(
    <div className='eventInfo'>
    <h5>{type}</h5>
    <h3>{value}</h3>
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
  return(<h5>{name}</h5>)
}

export default CurrentEvent;