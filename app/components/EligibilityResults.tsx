import React from 'react';
import { EligibilityResult, CriterionMatch } from '../lib/types/eligibility';

interface EligibilityResultsProps {
  result: EligibilityResult;
}

const CriterionMatchDisplay: React.FC<{ match: CriterionMatch }> = ({ match }) => {
  const getStatusIcon = (result: string) => {
    switch (result) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'maybe':
        return '⚠️';
      default:
        return '❓';
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{getStatusIcon(match.result)}</span>
        <h3 className="font-semibold">{match.criterion.field}</h3>
      </div>
      <div className="text-sm text-gray-600">
        <p>Operator: {match.criterion.operator}</p>
        <p>Value: {Array.isArray(match.criterion.value) ? match.criterion.value.join(', ') : match.criterion.value}</p>
        <p>Patient Value: {match.patient_value === null ? 'Not available' : match.patient_value}</p>
        {match.notes && <p className="mt-2 text-gray-500">{match.notes}</p>}
      </div>
    </div>
  );
};

export const EligibilityResults: React.FC<EligibilityResultsProps> = ({ result }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Eligibility Results</h2>
        <div className="flex items-center gap-4">
          <span className={`text-xl font-semibold ${
            result.overall_result === 'Eligible' ? 'text-green-600' :
            result.overall_result === 'Not eligible' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {result.overall_result}
          </span>
          <span className="text-gray-600">
            Confidence Score: {result.confidence_score * 100}%
          </span>
        </div>
      </div>

      {result.failed_criteria.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Failed Criteria</h3>
          {result.failed_criteria.map((match, index) => (
            <CriterionMatchDisplay key={`failed-${index}`} match={match} />
          ))}
        </div>
      )}

      {result.passed_criteria.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-600">Passed Criteria</h3>
          {result.passed_criteria.map((match, index) => (
            <CriterionMatchDisplay key={`passed-${index}`} match={match} />
          ))}
        </div>
      )}

      {result.maybe_criteria.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-yellow-600">Uncertain Criteria</h3>
          {result.maybe_criteria.map((match, index) => (
            <CriterionMatchDisplay key={`maybe-${index}`} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}; 