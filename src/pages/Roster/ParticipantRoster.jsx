import { joinPaths } from "@remix-run/router";
import "./Roster.css";
import { Table } from "./Table";

export function ParticipantRoster() {
  return (
    <div class="roster-page">
      <Table />
    </div>
  );
}
