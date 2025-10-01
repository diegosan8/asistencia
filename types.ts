
export interface Player {
  id: string;
  jersey: string;
  name: string;
  dni: string;
  birthDate: string;
}

// Using JavaScript's Date.getDay() standard: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export type DayOfWeekIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
