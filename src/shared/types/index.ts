/**
 * Tipos compartidos de la aplicación
 */

// ============ RESULTADOS ============
export interface RaceResult {
  id: string;
  nombreCompleto: string;
  dorsal: number;
  distancia: string;        // Item  (ej. 2KM, 4KM, 8KM)
  genero: string;           // Gender (M / F / Masculino / Femenino)
  pais?: string;            // Country
  categoria: string;        // Age Group
  status: string;           // Status (finisher, DNF, DSQ…)
  gunTime: string;          // Gun Time  HH:MM:SS
  netTime: string;          // Net Time  HH:MM:SS
  posicionGeneral: number;  // Overall Rank
  posicionGenero?: number;  // Gender Rank
  posicionCategoria: number;// Age Group Rank
}

// ============ VALIDACIÓN EXCEL ============
export interface ExcelValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
}

export interface ExcelValidationResult {
  valid: boolean;
  data?: RaceResult[];
  errors: ExcelValidationError[];
}

// ============ FILTROS ============
export interface ResultsFilters {
  distancia: string[] | null;
  genero: string[] | null;
  categoria: string | null;
  dorsal: string | null;
  nombre: string | null;
  orderBy: 'gunTime' | 'netTime' | 'posicionGeneral' | 'posicionCategoria' | 'posicionGenero';
}

// ============ CERTIFICADO ============
export interface Certificate {
  corredor: RaceResult;
  eventName: string;
  eventLogo?: string;
  companyLogo?: string;
  generatedAt: Date;
}

// ============ CATÁLOGO ============
export interface CatalogProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio?: string; // Referencia o valor
  categoría: string;
  imagen?: string;
  talla?: string[];
  color?: string[];
}

// ============ EVENTOS HOME ============
export interface HomeScheduleItem {
  time: string;
  title: string;
  desc: string;
}

export interface HomeEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  hours: string;
  modalities: string;
  coverImage?: string;
  schedule: HomeScheduleItem[];
}

// ============ PAGINACIÓN ============
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// ============ CARRERAS ==========
export interface RaceEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  coverImage?: string;
  results: RaceResult[];
}
