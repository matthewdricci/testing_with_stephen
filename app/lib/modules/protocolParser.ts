import { TrialCriteria, Criterion } from '../types/eligibility';

export class ProtocolParser {
  private static extractCriteria(text: string, criteriaType: 'inclusion' | 'exclusion'): Criterion[] {
    // This is a placeholder for the actual GPT-4/Claude implementation
    // In the real implementation, we would use prompt engineering to extract structured criteria
    const criteria: Criterion[] = [];
    
    // Example of how the criteria would be structured
    if (criteriaType === 'inclusion') {
      criteria.push({
        field: 'age',
        operator: 'between',
        value: [18, 75],
        unit: 'years',
        waiver_allowed: false,
        notes: 'Age must be between 18 and 75 years'
      });
    } else {
      criteria.push({
        field: 'medications',
        operator: 'not_contains',
        value: ['MAOIs', 'SSRIs'],
        waiver_allowed: true,
        notes: 'No concurrent use of MAOIs or SSRIs'
      });
    }
    
    return criteria;
  }

  public static async parseProtocol(protocolText: string): Promise<TrialCriteria> {
    try {
      const inclusionCriteria = this.extractCriteria(protocolText, 'inclusion');
      const exclusionCriteria = this.extractCriteria(protocolText, 'exclusion');

      return {
        inclusion_criteria: inclusionCriteria,
        exclusion_criteria: exclusionCriteria
      };
    } catch (error) {
      console.error('Error parsing protocol:', error);
      throw new Error('Failed to parse clinical trial protocol');
    }
  }

  public static validateCriteria(criteria: TrialCriteria): boolean {
    // Basic validation of the parsed criteria
    if (!Array.isArray(criteria.inclusion_criteria) || !Array.isArray(criteria.exclusion_criteria)) {
      return false;
    }

    const validateCriterion = (criterion: Criterion): boolean => {
      return (
        typeof criterion.field === 'string' &&
        typeof criterion.operator === 'string' &&
        (typeof criterion.value === 'string' || 
         typeof criterion.value === 'number' || 
         Array.isArray(criterion.value)) &&
        typeof criterion.waiver_allowed === 'boolean'
      );
    };

    return (
      criteria.inclusion_criteria.every(validateCriterion) &&
      criteria.exclusion_criteria.every(validateCriterion)
    );
  }
} 