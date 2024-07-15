export interface ProcessedEvent {
  id: string;
  dateDisplay: string;
  date: Date;
  time: string;
  mainLocation: string;
  numDrivers: number;
  numPackers: number;
  numTotalParticipants: number;
  numOnlyDrivers: number;
  numOnlyPackers: number;
  numBothDriversAndPackers: number;
  numSpecialGroups: number;
  scheduledSlots: string[];
  supplierId: string;
  allEventIds: string[];
}

export interface ProcessedScheduledSlot {
  id: string;
  firstName: string;
  lastName: string;
  totalDeliveries?: number;
  cantCome: boolean;
  timeSlot: string;
  participantType: string;
  confirmed: boolean;
  volunteerStatus: string;
  email: string;
  phoneNumber: string;
  specialGroup: string | null;
  guestCount: number;
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
  phoneNumber: string;
  email: string;
}

export interface ProcessedDropoffLocation {
  id: string;
  siteName: string;
  address: string;
  neighborhoods: string[];
  startTime: string | null;
  endTime: string | null;
  deliveriesNeeded: number;
  pocNameList: string[];
  pocPhoneNumberList: string[];
  locationEmail: string;
  deliveriesAssigned: number;
  matchedDrivers: string[];
  notavailable: boolean;
}

export interface ProcessedTextAutomation {
  "Text Type": string;
  "Sent by": string;
  "Triggered by": string;
  "Successful Executions": number;
  "Failed Executions": number;
  Date: Date;
}

export interface ProcessedSpecialGroup {
  id: string;
  name: string;
  events: string[];
}

export interface Neighborhood {
  id: string;
  Name: string;
}

export interface ProcessedSpecialEvent {
  id: string;
  specialGroupId: string;
  eventSignUpLink: string;
}
