export type DrinkType = 'water' | 'sparkling' | 'tea' | 'electrolyte' | 'infused' | 'coffee';

export interface IntakeLog {
  id: string;
  amount: number; // in milliliters (ml)
  drinkType: DrinkType;
  timestamp: string; // ISO date string
  note?: string;
}

export type UnitType = 'ml' | 'oz';

export interface UserGoalConfig {
  dailyGoalMl: number;
  unit: UnitType;
  weightKg?: number;
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'athlete';
  climate: 'temperate' | 'warm' | 'hot';
}

export interface ReminderConfig {
  enabled: boolean;
  intervalMinutes: number;
  soundEnabled: boolean;
  quietStart: string; // "22:00"
  quietEnd: string;   // "07:00"
}

export interface DayHistory {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  totalMl: number;
  goalMl: number;
  percentage: number;
  logsCount: number;
}
