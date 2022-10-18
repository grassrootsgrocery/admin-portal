import "./Events.css";

function EventCard(props) {
  return (
    <div class="card">
      <div class="date">{props.date}</div>

      <div class="middle-row">
        <div class="left">
          <div class="mid-section">
            <div class="text-label">Time</div>
            <div class="info">{props.time}</div>
          </div>
          <div class="mid-section">
            <div class="text-label">Main Location</div>
            <div class="info">{props.location}</div>
          </div>
          <div class="mid-section">
            <div class="text-label">Total Participants:</div>
            <div class="info">{props.participants}</div>
          </div>
        </div>

        <button class="button">View Event</button>
      </div>

      <div class="bottom-row">
        <div class="section">
          <div class="text-label">Drivers:</div>
          <div class="info">{props.drivers}</div>
        </div>

        <div class="section">
          <div class="text-label">Packers:</div>
          <div class="info">{props.packers}</div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
