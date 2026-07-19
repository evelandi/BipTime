/**
 * Results Table Component
 * Muestra la tabla de resultados con soporte para paginación y búsqueda de detalles
 */

import type { FC } from 'react';
import { useState } from 'react';
import type { RaceResult, ResultsFilters } from '../../shared/types';
import { timeStringToSeconds } from '../../shared/utils/parseExcel';
import styles from './ResultsTable.module.css';

interface ResultsTableProps {
  data: RaceResult[];
  filters: ResultsFilters;
  onRunnerSelect: (runner: RaceResult) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 50;

export const ResultsTable: FC<ResultsTableProps> = ({
  data,
  filters,
  onRunnerSelect,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Aplicar filtros
  let filteredData = data.filter(item => {
    if (filters.distancia && !filters.distancia.includes(item.distancia)) return false;
    if (filters.genero && !filters.genero.includes(item.genero)) return false;
    if (filters.categoria && item.categoria !== filters.categoria) return false;
    if (filters.dorsal && !item.dorsal.toString().includes(filters.dorsal)) return false;
    if (filters.nombre && !item.nombreCompleto.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
    return true;
  });

  // Ordenar
  filteredData = [...filteredData].sort((a, b) => {
    if (filters.orderBy === 'posicionGeneral') {
      const aR = a.posicionGeneral || 9999;
      const bR = b.posicionGeneral || 9999;
      return aR - bR;
    }
    if (filters.orderBy === 'posicionCategoria') {
      const aR = a.posicionCategoria || 9999;
      const bR = b.posicionCategoria || 9999;
      return aR - bR;
    }
    if (filters.orderBy === 'posicionGenero') {
      const aR = a.posicionGenero ?? 9999;
      const bR = b.posicionGenero ?? 9999;
      return aR - bR;
    }
    const aTime = timeStringToSeconds(filters.orderBy === 'gunTime' ? a.gunTime : a.netTime);
    const bTime = timeStringToSeconds(filters.orderBy === 'gunTime' ? b.gunTime : b.netTime);
    if (aTime !== null && bTime !== null) return aTime - bTime;
    if (aTime === null) return 1;
    if (bTime === null) return -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay datos cargados. Sube un archivo Excel para ver los resultados.</p>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay resultados que coincidan con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Distancia</th>
              <th>Dorsal</th>
              <th>Nombre</th>
              <th>Certificado</th>
              <th>Género</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Tiempo de Carrera</th>
              <th>Pos. Categoría</th>
              <th>Pos. General</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((result) => (
              <tr key={result.id} className={styles.row}>
                <td className={styles.item}>{result.distancia}</td>
                <td className={styles.dorsal}>{result.dorsal}</td>
                <td className={styles.name}>{result.nombreCompleto}</td>
                <td>
                  {/^finish/i.test(result.status) ? (
                    <button
                      onClick={() => onRunnerSelect(result)}
                      className={styles.certBtn}
                      title="Ver certificado"
                    >
                      Certificado
                    </button>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                  )}
                </td>
                <td className={styles.gender}>{result.genero}</td>
                <td className={styles.ageGroup}>{result.categoria}</td>
                <td>
                  <span className={`${styles.badge} ${styles[result.status.toLowerCase().replace(/\s+/g, '-')]}`}>
                    {result.status}
                  </span>
                </td>
                <td className={`${styles.time} ${styles.netTime}`}>{result.netTime || '—'}</td>
                <td className={styles.rank}>{result.posicionGenero ?? '—'}</td>
                <td className={styles.rank}>{result.posicionGeneral || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className={styles.paginationBtn}>Primera</button>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className={styles.paginationBtn}>← Anterior</button>
          <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className={styles.paginationBtn}>Siguiente →</button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className={styles.paginationBtn}>Última</button>
        </div>
      )}

      <p className={styles.stats}>Mostrando {paginatedData.length} de {filteredData.length} resultados</p>
    </div>
  );
};
