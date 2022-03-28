import React from 'react';

function CurrentEvent(props){
  return( 
    <div>
      <Active />
      <div color='blue' style= "border-style='double'">
      <Date />
      <div class='container'>
        <VolunteerGroup/>
        <PickupLocation/>
        <DriversNeeded/>
      </div>
      <div class = 'container'>
        <h5>Participants: </h5>
        <Drivers/>
        <Volunteers/>
      </div>
      {/* <VolunteerTable/>
      <div>
      <Manage/>
      <Recruit/>
      <VisitWebpage/>
      </div> */}
      </div>
    </div>
  );
}

//event will need to have an active attribute which this will use
class Active extends React.Component{
  render(){
    let active = true;
    if(active){
      return(<div><circle color='28E42A'/>
      <h2>No active events</h2>
      </div>)
    } else {
      return(<div><circle color='E82F2F'/>
      <h2>An event is currently active</h2>
      </div>)
    }

  }
}

function Date(props) {
  return(<h1 class= 'w3-container'>Monday, March 14th</h1>)
}

function VolunteerGroup(props) {
  return(
    <div id= 'leftbox'>  
    <h5>Volunteer Group</h5>
    <h3>Hack4Impact</h3>
    </div>
  )
}

function PickupLocation(props) {
  return(
    <div id= 'middlebox'>  
    <h5>Pickup Location</h5>
    <h3>Start Lighthouse</h3>
    </div>
  )
}

function DriversNeeded(props) {
  return(
    <div id= 'rightbox'>  
    <h5>Drivers Needed</h5>
    <h3>25</h3>
    </div>
  )
}

function Drivers(props){
  return(
    <div>
      <h4>Drivers</h4>
      <h4>16</h4>
    </div>
  )
}

function Volunteers(props){
  return(
    <div>
      <h4>Volunteers</h4>
      <h4>14</h4>
    </div>
  )
}

export default CurrentEvent;