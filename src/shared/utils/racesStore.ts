import { supabase } from '../../lib/supabase';
import type { HomeScheduleItem, Race, RaceResult } from '../types';

interface RaceRow {
  id: string;
  name: string;
  date: string;
  location: string;
  hours: string;
  modalities: string;
  cover_image: string | null;
  schedule: HomeScheduleItem[];
  results: RaceResult[];
}

function rowToRace(row: RaceRow): Race {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    location: row.location,
    hours: row.hours,
    modalities: row.modalities,
    coverImage: row.cover_image ?? undefined,
    schedule: row.schedule ?? [],
    results: row.results ?? [],
  };
}

function raceToRow(race: Race): RaceRow {
  return {
    id: race.id,
    name: race.name,
    date: race.date,
    location: race.location,
    hours: race.hours ?? '',
    modalities: race.modalities ?? '',
    cover_image: race.coverImage ?? null,
    schedule: race.schedule ?? [],
    results: race.results ?? [],
  };
}

export async function loadRaces(): Promise<Race[]> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data as RaceRow[]).map(rowToRace);
}

export async function upsertRace(race: Race): Promise<void> {
  const { error } = await supabase
    .from('races')
    .upsert(raceToRow(race), { onConflict: 'id' });
  if (error) throw error;
}

export async function deleteRace(id: string): Promise<void> {
  const { error } = await supabase.from('races').delete().eq('id', id);
  if (error) throw error;
}

export async function updateRaceResults(id: string, results: RaceResult[]): Promise<void> {
  const { error } = await supabase
    .from('races')
    .update({ results })
    .eq('id', id);
  if (error) throw error;
}
