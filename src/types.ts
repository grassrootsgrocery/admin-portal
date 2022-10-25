export interface AirtableResponse<FieldsType> {
  records: Record<FieldsType>[]
}
export interface Record<T> {
  id: string,
  fields: T,
  createdTime: string
}

export interface Event {
  "Start Time": string,
  "Pickup Address": string[],
  "Driver and Distributor Count": number,
  "Only Driver Count": number,
  "Only Distributor Count": number,
  "📅 Scheduled Slots": string[]
}
export interface ProcessedEvent {
  id: string;
  day: string;
  time: string;
  mainLocation: string;
  numDrivers: string;
  numPackers: number;
  numtotalParticipants: number;
  scheduledSlots: string[];
}

export interface ScheduledSlot {
  "First Name": string,
  "Last Name": string,
  "Correct slot time": any,
  "Type": string[],
  "Confirmed?": boolean,
  "Volunteer Status": string,
  "Email": string
}
