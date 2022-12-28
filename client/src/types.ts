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
  specialGroup: string | null;
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

export interface ProcessedSpecialGroup {
  id: string;
  name: string;
  events: string[];
}

export interface Neighborhood {
  id: string;
  Name: string;
}
