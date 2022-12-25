export interface AirtableResponse<FieldsType> {
  records: Record<FieldsType>[];
}
export interface Record<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface Event {
  "Start Time": string | undefined;
  "Pickup Address": string[] | undefined;
  "Total Count of Drivers for Event": number | undefined;
  "Total Count of Distributors for Event": number | undefined;
  "Total Count of Volunteers for Event": number | undefined;
  "Special Event": boolean | undefined;
  Supplier: string[] | undefined;
  "📅 Scheduled Slots": string[] | undefined;
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
  allEventIds: string[];
}

export interface ScheduledSlot {
  "First Name": string[];
  "Last Name": string[];
  "Total Deliveries": number;
  "Can't Come": boolean;
  "Correct slot time": any;
  Type: string[];
  "Confirmed?": boolean;
  "Volunteer Status": string[];
  Email: string[];
  "Volunteer Group (for MAKE)": string;
}

export interface Driver {
  "First Name": string;
  "Last Name": string;
  "Driving Slot Time": string;
  "Total Deliveries": number;
  "Zip Code": string;
  "Transportation Types": string;
  "Restricted Neighborhoods": string[];
  "📍 Drop off location": string[];
}
export interface ProcessedDriver {
  id: string;
  firstName: string;
  lastName: string;
  timeSlot: string;
  deliveryCount: number;
  zipCode: string;
  vehicle: string;
  restrictedLocations: string[];
  dropoffLocations: string[];
}

export interface Neighborhood {
  Name: string;
}

export interface DropoffLocation {
  "Drop off location": string;
  "Drop-off Address": string;
  "Neighborhood (from Zip Code)": string[];
  "Starts accepting at": string;
  "Stops accepting at": string;
  // TODO: update with correct airtable field for deliveriesAssigned
  // TODO: update with correct airtable field for matchedDrivers
}

export interface ProcessedDropoffLocation {
  id: string;
  dropOffLocation: string;
  address: string;
  neighborhoods: string[];
  startTime: string;
  endTime: string;
  deliveriesAssigned: number;
  matchedDrivers: string[];
}

export interface SpecialGroup {
  Name: string;
  "🚛 Supplier Pickup Events": string[];
}

export interface ProcessedSpecialGroup {
  name: string;
  events: string[];
}
