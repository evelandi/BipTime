/**
 * Utilidades para parsear y validar archivos Excel
 */

import type { RaceResult, ExcelValidationResult, ExcelValidationError } from '../types';

// Columnas mínimas requeridas (presentes en todos los registros del archivo de chip)
const REQUIRED_COLUMNS = [
  'Item',
  'Bib',
  'Name',
  'Gender',
  'Status',
] as const;

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

  // Verificar columnas requeridas
  const firstRowKeys = Object.keys(rawData[0]);
  const missingColumns = REQUIRED_COLUMNS.filter(col => !firstRowKeys.includes(col));

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
      const status = String(row['Status'] ?? '').trim();

      // Columns from chip machine (use Chip Time variants: O, Q, T, V)
      const gunTimeRaw = row['Gun Time'] ?? row['GunTime'];
      const netTimeRaw = row['Net Time'] ?? row['NetTime'];                        // col O
      const overallRankRaw = row['Overall Rank (Chip Time)'] ?? row['Overall Rank'];   // col T
      const ageGroupRankRaw = row['Age Group Rank(Chip Time)'] ?? row['Age Group Rank']; // col V
      const genderRankRaw = row['Gender Rank (Chip Time)'] ?? row['Gender Rank'];      // col Q

      const gunTime = gunTimeRaw != null ? String(gunTimeRaw).trim() : '';
      const netTime = netTimeRaw != null ? String(netTimeRaw).trim() : '';
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
      if (!status) {
        errors.push({ row: rowNumber, column: 'Status', value: status, error: 'Status cannot be empty' });
        return;
      }
      // Only validate times/ranks for finishers
      if (isFinisher && timeStringToSeconds(netTime) === null) {
        errors.push({ row: rowNumber, column: 'Net Time', value: netTime, error: 'Invalid time format. Use HH:MM:SS' });
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


