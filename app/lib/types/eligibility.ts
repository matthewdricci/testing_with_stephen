export interface Criterion {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'contains' | 'not_contains';
  value: string | number | (string | number)[];
  unit?: string;
  waiver_allowed: boolean;
  notes?: string;
}

export interface TrialCriteria {
  inclusion_criteria: Criterion[];
  exclusion_criteria: Criterion[];
}

export interface PatientProfile {
  age?: number;
  diagnosis: string[];
  medications: string[];
  mental_status?: string;
  notes?: string;
  [key: string]: any; // Allow for additional fields
}

export interface CriterionMatch {
  criterion: Criterion;
  patient_value: string | number | null;
  result: 'pass' | 'fail' | 'maybe';
  notes?: string;
}

export interface EligibilityResult {
  overall_result: 'Eligible' | 'Not eligible' | 'Maybe eligible';
  confidence_score: number;
  failed_criteria: CriterionMatch[];
  passed_criteria: CriterionMatch[];
  maybe_criteria: CriterionMatch[];
} 