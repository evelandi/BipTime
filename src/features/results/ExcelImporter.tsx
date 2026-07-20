/**
 * Excel Importer Component
 * Permite cargar archivos .xlsx con los resultados de carreras
 */

import type { FC } from 'react';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { parseRaceResults } from '../../shared/utils/parseExcel';
import type { RaceResult, ExcelValidationError } from '../../shared/types';
import styles from './ExcelImporter.module.css';

interface ExcelImporterProps {
  onDataLoaded: (data: RaceResult[]) => void;
  onError: (errors: ExcelValidationError[]) => void;
}

const TEMPLATE_ROWS = [
  {
    'Item': '5 KILOMETROS',
    'Bib': 523,
    'chip': '000000000000000807',
    'Name': 'OSCAR ANDRES SARMIENTO JIMENEZ',
    'Surname': '',
    'Gender': 'M',
    'Age': '',
    'Age Group': 'Unica Masculino',
    'Age Group 2': '',
    'Team': '',
    'Team Index': '',
    'Id Card': '',
    'Phone': '',
    'Gun Time': '00:22:34',
    'Net Time': '00:22:33',
    'Gender Rank (Gun Time)': 1,
    'Gender Rank (Chip Time)': 1,
    'Start Time': '00:00:01',
    'Overall Rank (Gun Time)': 1,
    'Overall Rank (Chip Time)': 1,
    'Age Group Rank(Gun Time)': 1,
    'Age Group Rank(Chip Time)': 1,
    'Status': 'Finished',
  },
  {
    'Item': '5 KILOMETROS',
    'Bib': 524,
    'chip': '000000000000000808',
    'Name': 'NERY ANDREA PINEDA ARANGO',
    'Surname': '',
    'Gender': 'F',
    'Age': '',
    'Age Group': 'Unica Femenina',
    'Age Group 2': '',
    'Team': '',
    'Team Index': '',
    'Id Card': '',
    'Phone': '',
    'Gun Time': '',
    'Net Time': '',
    'Gender Rank (Gun Time)': '',
    'Gender Rank (Chip Time)': '',
    'Start Time': '',
    'Overall Rank (Gun Time)': '',
    'Overall Rank (Chip Time)': '',
    'Age Group Rank(Gun Time)': '',
    'Age Group Rank(Chip Time)': '',
    'Status': 'DNS',
  },
];

const handleDownloadTemplate = () => {
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_ROWS);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
  XLSX.writeFile(wb, 'template-resultados-biptime.xlsx');
};

export const ExcelImporter: FC<ExcelImporterProps> = ({ onDataLoaded, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });

        const result = parseRaceResults(rawData);

        if (result.valid && result.data) {
          onDataLoaded(result.data);
          setSuccessCount(result.data.length);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setSuccessCount(null);
          onError(result.errors);
        }
      } catch (error) {
        onError([
          {
            row: 0,
            column: 'file',
            value: file.name,
            error: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className={styles.importer}>
      <button type="button" className={styles.templateBtn} onClick={handleDownloadTemplate}>
        ↓ Descargar plantilla Excel
      </button>
      <label htmlFor="excelFile" className={styles.label}>
        Cargar resultados desde Excel (.xlsx)
      </label>
      <input
        ref={fileInputRef}
        id="excelFile"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className={styles.input}
        aria-label="Upload Excel results file"
      />
      <p className={styles.hint}>Columnas requeridas: Item, Bib, Name, Gender, Status — y para finishers: Gun Time, Net Time, Overall Rank, Age Group Rank</p>
      {successCount !== null && (
        <p className={styles.successMsg}>✅ {successCount} corredores cargados exitosamente</p>
      )}
    </div>
  );
};
