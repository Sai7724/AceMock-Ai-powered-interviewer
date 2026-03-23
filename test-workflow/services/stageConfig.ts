import type {
  AptitudeFeedback,
  CodingFeedback,
  HRFeedback,
  InterviewResults,
  SelfIntroductionFeedback,
  TechnicalQAFeedback,
} from '../../types';

export type TestStageId =
  | 'selfIntroduction'
  | 'aptitudeRound'
  | 'technicalRound'
  | 'codingRound'
  | 'hrRound';

export interface TestWorkflowResults {
  selfIntroduction?: SelfIntroductionFeedback;
  aptitudeRound?: AptitudeFeedback;
  technicalRound?: TechnicalQAFeedback;
  codingRound?: CodingFeedback;
  hrRound?: HRFeedback;
}

export interface TestStageDefinition {
  id: TestStageId;
  label: string;
  shortLabel: string;
  description: string;
  requiresLanguage?: boolean;
}

export const TEST_STAGE_DEFINITIONS: TestStageDefinition[] = [
  {
    id: 'selfIntroduction',
    label: 'Self Introduction',
    shortLabel: 'Self Intro',
    description: 'Test introduction delivery, clarity, and structure independently.',
  },
  {
    id: 'aptitudeRound',
    label: 'Aptitude Round',
    shortLabel: 'Aptitude',
    description: 'Generate aptitude questions and score the result immediately.',
  },
  {
    id: 'technicalRound',
    label: 'Technical Round',
    shortLabel: 'Technical',
    description: 'Run technical Q&A against a selected language or stack.',
    requiresLanguage: true,
  },
  {
    id: 'codingRound',
    label: 'Coding Round',
    shortLabel: 'Coding',
    description: 'Generate a coding task and evaluate the submitted solution.',
    requiresLanguage: true,
  },
  {
    id: 'hrRound',
    label: 'HR Round',
    shortLabel: 'HR',
    description: 'Evaluate HR responses and soft-skill signals independently.',
  },
];

export function getStageDefinition(stageId: TestStageId): TestStageDefinition {
  const definition = TEST_STAGE_DEFINITIONS.find((stage) => stage.id === stageId);
  if (!definition) {
    throw new Error(`Unknown test workflow stage: ${stageId}`);
  }

  return definition;
}

export function toInterviewResults(results: TestWorkflowResults): InterviewResults {
  return {
    selfIntroduction: results.selfIntroduction,
    aptitude: results.aptitudeRound,
    technicalQA: results.technicalRound,
    coding: results.codingRound,
    hrRound: results.hrRound,
  };
}
