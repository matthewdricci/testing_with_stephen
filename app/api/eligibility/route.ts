import { NextResponse } from 'next/server';
import { ProtocolParser } from '@/app/lib/modules/protocolParser';
import { PatientParser } from '@/app/lib/modules/patientParser';
import { EligibilityMatcher } from '@/app/lib/modules/eligibilityMatcher';

export async function POST(request: Request) {
  try {
    const { protocolText, patientRecordText } = await request.json();

    if (!protocolText || !patientRecordText) {
      return NextResponse.json(
        { error: 'Missing required fields: protocolText and patientRecordText' },
        { status: 400 }
      );
    }

    // Parse protocol and patient record
    const trialCriteria = await ProtocolParser.parseProtocol(protocolText);
    const patientProfile = await PatientParser.parsePatientRecord(patientRecordText);

    // Validate parsed data
    if (!ProtocolParser.validateCriteria(trialCriteria)) {
      return NextResponse.json(
        { error: 'Invalid trial criteria format' },
        { status: 400 }
      );
    }

    if (!PatientParser.validateProfile(patientProfile)) {
      return NextResponse.json(
        { error: 'Invalid patient profile format' },
        { status: 400 }
      );
    }

    // Match patient to trial
    const eligibilityResult = await EligibilityMatcher.matchPatientToTrial(
      patientProfile,
      trialCriteria
    );

    return NextResponse.json(eligibilityResult);
  } catch (error) {
    console.error('Error processing eligibility check:', error);
    return NextResponse.json(
      { error: 'Failed to process eligibility check' },
      { status: 500 }
    );
  }
} 