/**
 * Utilidades para parsear y validar archivos Excel
 */

import type { RaceResult, ExcelValidationResult, ExcelValidationError } from '../types';

// Columnas mínimas requeridas (presentes en todos los registros del archivo de chip).
// Status no entra aquí: Feibot la deja vacía mientras el corredor sigue sin resolver,
// así que se deduce del resto de la fila (ver inferStatus).
const REQUIRED_COLUMNS = [
  'Item',
  'Bib',
  'Name',
  'Gender',
] as const;

// Excel stores times as fractions of a day (e.g. 2h6m47s = 0.08804...).
// This converts that serial to HH:MM:SS, or returns the value as-is if already a string.
function normalizeTimeValue(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'number' && val >= 0 && val < 1) {
    const total = Math.round(val * 86400);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return String(val).trim();
}

/**
 * Convierte string de tiempo (HH:MM:SS) a segundos
 */
export function timeStringToSeconds(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const parts = timeStr.trim().split(':');
  if (parts.length !== 3) return null;

  const [hours, minutes, seconds] = parts.map(p => parseInt(p, 10));

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
  if (minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Convierte segundos a formato HH:MM:SS
 */
export function secondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map(v => String(v).padStart(2, '0'))
    .join(':');
}

/**
 * Deduce el Status cuando la columna viene vacía en el export de Feibot.
 * Allá un corredor sin resolver queda en finisher = 0 y exporta la celda en blanco;
 * antes eso rechazaba el archivo entero, ahora se resuelve con el resto de la fila.
 *
 *   tiene tiempo de meta              -> Finished
 *   tiene hora de salida pero no meta -> DNF
 *   no tiene ninguno de los dos       -> DNS
 */
function inferStatus(gunTime: string, netTime: string, startTime: string): string {
  if (timeStringToSeconds(netTime) !== null || timeStringToSeconds(gunTime) !== null) {
    return 'Finished';
  }
  return startTime ? 'DNF' : 'DNS';
}

/**
 * Parsea y valida datos desde un array de objetos (Excel)
 */
export function parseRaceResults(rawData: any[]): ExcelValidationResult {
  const errors: ExcelValidationError[] = [];
  const data: RaceResult[] = [];

  if (!Array.isArray(rawData) || rawData.length === 0) {
    return {
      valid: false,
      errors: [{ row: 0, column: 'general', value: null, error: 'No data provided' }],
    };
  }

  // Verificar columnas requeridas.
  // Se recorre el archivo completo y no solo la primera fila: sheet_to_json omite la
  // clave cuando la celda viene vacía, así que un primer corredor con algún dato en
  // blanco hacía reportar como "columna faltante" un encabezado que sí existía.
  const presentColumns = new Set<string>();
  rawData.forEach(row => {
    if (row) Object.keys(row).forEach(key => presentColumns.add(key));
  });
  const missingColumns = REQUIRED_COLUMNS.filter(col => !presentColumns.has(col));

  if (missingColumns.length > 0) {
    return {
      valid: false,
      errors: [{
        row: 0,
        column: 'headers',
        value: missingColumns,
        error: `Missing required columns: ${missingColumns.join(', ')}`,
      }],
    };
  }

  rawData.forEach((row, index) => {
    const rowNumber = index + 2;

    try {
      // Combine Name + Surname (chip machine sometimes splits them)
      const firstName = String(row['Name'] ?? '').trim();
      const surname = row['Surname'] ? String(row['Surname']).trim() : '';
      const nombreCompleto = surname ? `${firstName} ${surname}` : firstName;

      const dorsal = parseInt(String(row['Bib']), 10);
      const distancia = String(row['Item'] ?? '').trim();
      const genero = String(row['Gender'] ?? '').trim();
      const pais = row['Country'] ? String(row['Country']).trim() : undefined;
      const categoria = row['Age Group'] ? String(row['Age Group']).trim() : '';
      const statusOriginal = String(row['Status'] ?? '').trim();

      // Columns from chip machine (use Chip Time variants: O, Q, T, V)
      const gunTimeRaw = row['Gun Time'] ?? row['GunTime'];
      const netTimeRaw = row['Net Time'] ?? row['NetTime'];                        // col O
      const overallRankRaw = row['Overall Rank (Chip Time)'] ?? row['Overall Rank'];   // col T
      const ageGroupRankRaw = row['Age Group Rank(Chip Time)'] ?? row['Age Group Rank']; // col V
      const genderRankRaw = row['Gender Rank (Chip Time)'] ?? row['Gender Rank'];      // col Q
      const startTimeRaw = row['Start Time'] ?? row['StartTime'];

      const gunTime = normalizeTimeValue(gunTimeRaw);
      const netTime = normalizeTimeValue(netTimeRaw);
      const startTime = normalizeTimeValue(startTimeRaw);
      const status = statusOriginal || inferStatus(gunTime, netTime, startTime);
      const posicionGeneral = overallRankRaw != null ? parseInt(String(overallRankRaw), 10) : 0;
      const posicionCategoria = ageGroupRankRaw != null ? parseInt(String(ageGroupRankRaw), 10) : 0;
      const posicionGenero = genderRankRaw != null && genderRankRaw !== ''
        ? parseInt(String(genderRankRaw), 10)
        : undefined;

      // Determine if this is a finisher based on status (not time presence)
      const isFinisher = /^finish/i.test(status);

      if (!nombreCompleto) {
        errors.push({ row: rowNumber, column: 'Name', value: nombreCompleto, error: 'Name cannot be empty' });
        return;
      }
      if (isNaN(dorsal) || dorsal <= 0) {
        errors.push({ row: rowNumber, column: 'Bib', value: row['Bib'], error: 'Invalid bib number' });
        return;
      }
      if (!distancia) {
        errors.push({ row: rowNumber, column: 'Item', value: distancia, error: 'Item (distance) cannot be empty' });
        return;
      }
      // Solo se validan tiempos para finishers. Basta con que uno de los dos sea
      // válido: en Feibot un finisher puede quedar sin Net Time cuando la hora de
      // salida se asignó a mano y el neto nunca se recalculó.
      if (isFinisher && timeStringToSeconds(netTime) === null && timeStringToSeconds(gunTime) === null) {
        errors.push({
          row: rowNumber,
          column: 'Net Time',
          value: netTime,
          error: 'Finisher sin Gun Time ni Net Time válidos. Use HH:MM:SS',
        });
        return;
      }

      data.push({
        id: `${dorsal}-${nombreCompleto.replace(/\s+/g, '_')}`,
        nombreCompleto,
        dorsal,
        distancia,
        genero,
        pais,
        categoria,
        status,
        gunTime,
        netTime,
        posicionGeneral,
        posicionCategoria,
        posicionGenero,
      });
    } catch (error) {
      errors.push({
        row: rowNumber,
        column: 'unknown',
        value: row,
        error: `Error processing row: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  return {
    valid: errors.length === 0,
    data: data.length > 0 ? data : undefined,
    errors,
  };
}


