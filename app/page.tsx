'use client';

import { useState } from 'react';
import { EligibilityResults } from './components/EligibilityResults';
import { EligibilityResult } from './lib/types/eligibility';

export default function Home() {
  const [protocolText, setProtocolText] = useState('');
  const [patientRecordText, setPatientRecordText] = useState('');
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocolText,
          patientRecordText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check eligibility');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Clinical Trial Eligibility Checker</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label htmlFor="protocol" className="block text-sm font-medium mb-2">
              Clinical Trial Protocol
            </label>
            <textarea
              id="protocol"
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
              className="w-full h-48 p-3 border rounded-lg"
              placeholder="Paste clinical trial protocol text here..."
              required
            />
          </div>

          <div>
            <label htmlFor="patient" className="block text-sm font-medium mb-2">
              Patient Record
            </label>
            <textarea
              id="patient"
              value={patientRecordText}
              onChange={(e) => setPatientRecordText(e.target.value)}
              className="w-full h-48 p-3 border rounded-lg"
              placeholder="Paste patient record text here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking Eligibility...' : 'Check Eligibility'}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {result && <EligibilityResults result={result} />}
      </div>
    </main>
  );
}
