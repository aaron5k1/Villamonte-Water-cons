import { UnitType } from './index';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarSeed: string; // for avatar initials/gradient
  weightKg: number;
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'athlete';
  climate: 'temperate' | 'warm' | 'hot';
  dailyGoalMl: number;
  unit: UnitType;
  joinedDate: string;
}

export type AuthMode = 'login' | 'register';
export type ActiveTab = 'dashboard' | 'profile' | 'settings';
