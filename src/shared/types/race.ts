import type { HomeScheduleItem, RaceResult } from './index';

export interface Race {
  id: string;
  name: string;
  date: string;
  location: string;
  hours: string;
  modalities: string;
  coverImage?: string;
  schedule: HomeScheduleItem[];
  results: RaceResult[];
}
