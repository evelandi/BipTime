/**
 * Results Filters Component
 */

import type { FC } from 'react';
import type { ResultsFilters as ResultsFiltersType, RaceResult } from '../../shared/types';
import styles from './ResultsFilters.module.css';

interface ResultsFiltersProps {
  filters: ResultsFiltersType;
  onFiltersChange: (filters: ResultsFiltersType) => void;
  data: RaceResult[];
}

export const ResultsFilters: FC<ResultsFiltersProps> = ({ filters, onFiltersChange, data }) => {
  const distances = Array.from(new Set(data.map(r => r.distancia))).sort();
  const genders = Array.from(new Set(data.map(r => r.genero))).sort();
  const categories = Array.from(new Set(data.map(r => r.categoria))).sort();

  const toggle = <T extends string>(current: T[] | null, value: T): T[] | null => {
    const list = current ?? [];
    const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
    return next.length > 0 ? next : null;
  };

  const handleReset = () => onFiltersChange({
    distancia: null, genero: null, categoria: null, dorsal: null, nombre: null, orderBy: 'gunTime',
  });

  return (
    <div className={styles.filters}>
      <div className={styles.filterSection}>
        <h4>Distancia</h4>
        <div className={styles.buttonGroup}>
          <button onClick={() => onFiltersChange({ ...filters, distancia: null })} className={`${styles.btn} ${!filters.distancia ? styles.active : ''}`}>Todas</button>
          {distances.map(d => (
            <button key={d} onClick={() => onFiltersChange({ ...filters, distancia: toggle(filters.distancia, d) })} className={`${styles.btn} ${filters.distancia?.includes(d) ? styles.active : ''}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4>Género</h4>
        <div className={styles.buttonGroup}>
          <button onClick={() => onFiltersChange({ ...filters, genero: null })} className={`${styles.btn} ${!filters.genero ? styles.active : ''}`}>Todos</button>
          {genders.map(g => (
            <button key={g} onClick={() => onFiltersChange({ ...filters, genero: toggle(filters.genero, g) })} className={`${styles.btn} ${filters.genero?.includes(g) ? styles.active : ''}`}>{g}</button>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <h4>Categoría</h4>
        <select value={filters.categoria || ''} onChange={e => onFiltersChange({ ...filters, categoria: e.target.value || null })} className={styles.select}>
          <option value="">Todas</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className={styles.filterSection}>
        <h4>Dorsal</h4>
        <input type="text" placeholder="Buscar dorsal..." value={filters.dorsal || ''} onChange={e => onFiltersChange({ ...filters, dorsal: e.target.value || null })} className={styles.input} />
      </div>

      <div className={styles.filterSection}>
        <h4>Nombre</h4>
        <input type="text" placeholder="Buscar nombre..." value={filters.nombre || ''} onChange={e => onFiltersChange({ ...filters, nombre: e.target.value || null })} className={styles.input} />
      </div>

      <div className={styles.filterSection}>
        <h4>Ordenar por</h4>
        <div className={styles.buttonGroup}>
          <button onClick={() => onFiltersChange({ ...filters, orderBy: 'netTime' })} className={`${styles.btn} ${filters.orderBy === 'netTime' ? styles.active : ''}`}>Tiempo de Carrera</button>
          <button onClick={() => onFiltersChange({ ...filters, orderBy: 'posicionGeneral' })} className={`${styles.btn} ${filters.orderBy === 'posicionGeneral' ? styles.active : ''}`}>Pos. General</button>
          <button onClick={() => onFiltersChange({ ...filters, orderBy: 'posicionCategoria' })} className={`${styles.btn} ${filters.orderBy === 'posicionCategoria' ? styles.active : ''}`}>Pos. Categoría</button>
          <button onClick={() => onFiltersChange({ ...filters, orderBy: 'posicionGenero' })} className={`${styles.btn} ${filters.orderBy === 'posicionGenero' ? styles.active : ''}`}>Pos. Género</button>
        </div>
      </div>

      <button onClick={handleReset} className={styles.resetBtn}>Limpiar filtros</button>
    </div>
  );
};
