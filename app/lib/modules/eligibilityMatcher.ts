import { TrialCriteria, PatientProfile, CriterionMatch, EligibilityResult, Criterion } from '../types/eligibility';

export class EligibilityMatcher {
  public static async matchPatientToTrial(
    patientProfile: PatientProfile,
    trialCriteria: TrialCriteria
  ): Promise<EligibilityResult> {
    const passedCriteria: CriterionMatch[] = [];
    const failedCriteria: CriterionMatch[] = [];
    const maybeCriteria: CriterionMatch[] = [];

    // Check inclusion criteria
    for (const criterion of trialCriteria.inclusion_criteria) {
      const match = this.evaluateCriterion(criterion, patientProfile);
      if (match.result === 'pass') {
        passedCriteria.push(match);
      } else if (match.result === 'fail') {
        failedCriteria.push(match);
      } else {
        maybeCriteria.push(match);
      }
    }

    // Check exclusion criteria
    for (const criterion of trialCriteria.exclusion_criteria) {
      const match = this.evaluateCriterion(criterion, patientProfile);
      if (match.result === 'fail') {
        passedCriteria.push(match); // Patient passes if they don't meet exclusion criteria
      } else if (match.result === 'pass') {
        failedCriteria.push(match);
      } else {
        maybeCriteria.push(match);
      }
    }

    const overallResult = this.determineOverallResult(passedCriteria, failedCriteria, maybeCriteria);
    const confidenceScore = this.calculateConfidenceScore(passedCriteria, failedCriteria, maybeCriteria);

    return {
      overall_result: overallResult,
      confidence_score: confidenceScore,
      failed_criteria: failedCriteria,
      passed_criteria: passedCriteria,
      maybe_criteria: maybeCriteria
    };
  }

  private static evaluateCriterion(criterion: Criterion, profile: PatientProfile): CriterionMatch {
    const patientValue = profile[criterion.field];
    
    if (patientValue === undefined) {
      return {
        criterion,
        patient_value: null,
        result: 'maybe',
        notes: `No ${criterion.field} data available`
      };
    }

    let result: 'pass' | 'fail' | 'maybe' = 'maybe';
    let notes = '';

    switch (criterion.operator) {
      case 'equals':
        result = patientValue === criterion.value ? 'pass' : 'fail';
        break;
      case 'greater_than':
        result = Number(patientValue) > Number(criterion.value) ? 'pass' : 'fail';
        break;
      case 'less_than':
        result = Number(patientValue) < Number(criterion.value) ? 'pass' : 'fail';
        break;
      case 'between':
        if (Array.isArray(criterion.value) && criterion.value.length === 2) {
          const [min, max] = criterion.value;
          result = Number(patientValue) >= Number(min) && Number(patientValue) <= Number(max) ? 'pass' : 'fail';
        }
        break;
      case 'in':
        if (Array.isArray(criterion.value)) {
          result = criterion.value.includes(patientValue as string | number) ? 'pass' : 'fail';
        }
        break;
      case 'not_in':
        if (Array.isArray(criterion.value)) {
          result = !criterion.value.includes(patientValue as string | number) ? 'pass' : 'fail';
        }
        break;
      case 'contains':
        if (Array.isArray(patientValue)) {
          result = patientValue.some(v => 
            Array.isArray(criterion.value) && criterion.value.includes(v)
          ) ? 'pass' : 'fail';
        }
        break;
      case 'not_contains':
        if (Array.isArray(patientValue)) {
          result = !patientValue.some(v => 
            Array.isArray(criterion.value) && criterion.value.includes(v)
          ) ? 'pass' : 'fail';
        }
        break;
    }

    return {
      criterion,
      patient_value: patientValue,
      result,
      notes
    };
  }

  private static determineOverallResult(
    passed: CriterionMatch[],
    failed: CriterionMatch[],
    maybe: CriterionMatch[]
  ): 'Eligible' | 'Not eligible' | 'Maybe eligible' {
    if (failed.length > 0) {
      return 'Not eligible';
    }
    if (maybe.length > 0) {
      return 'Maybe eligible';
    }
    return 'Eligible';
  }

  private static calculateConfidenceScore(
    passed: CriterionMatch[],
    failed: CriterionMatch[],
    maybe: CriterionMatch[]
  ): number {
    const total = passed.length + failed.length + maybe.length;
    if (total === 0) return 0;
    
    // Weight passed criteria higher than failed/maybe
    const score = (passed.length * 1 + failed.length * 0 + maybe.length * 0.5) / total;
    return Math.round(score * 100) / 100;
  }
} 