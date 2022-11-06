export interface AirtableResponse<FieldsType> {
  records: Record<FieldsType>[];
}
export interface Record<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface Event {
  "Start Time": string;
  "Pickup Address": string[];
  "Total Count of Drivers for Event": number;
  "Total Count of Distributors for Event": number;
  "Total Count of Volunteers for Event": number;
  "Special Event": boolean;
  "📅 Scheduled Slots": string[];
}
export interface ProcessedEvent {
  id: string;
  dateDisplay: string;
  date: Date;
  time: string;
  mainLocation: string;
  numDrivers: number;
  numPackers: number;
  numtotalParticipants: number;
  numOnlyDrivers: number;
  numOnlyPackers: number;
  numBothDriversAndPackers: number;
  numSpecialGroups: number;
  scheduledSlots: string[];
}

export interface ScheduledSlot {
  "First Name": string;
  "Last Name": string;
  "Correct slot time": any;
  Type: string[];
  "Confirmed?": boolean;
  "Volunteer Status": string;
  Email: string;
}
