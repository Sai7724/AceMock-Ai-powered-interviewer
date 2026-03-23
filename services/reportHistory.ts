import {
  AptitudeFeedback,
  CodingFeedback,
  Feedback,
  HRFeedback,
  InterviewResults,
  TechnicalQAFeedback,
} from '../types';
import { supabase } from './supabaseClient';

export interface StoredReport {
  id: string;
  user_id: string;
  stage: string;
  score: number;
  summary: string;
  created_at: string;
}

interface ReportInsert {
  user_id: string;
  stage: string;
  score: number;
  summary: string;
}

const CACHE_PREFIX = 'acemock:reports:';
const SAVE_PREFIX = 'acemock:report-save:';

function getCacheKey(userId: string) {
  return `${CACHE_PREFIX}${userId}`;
}

function getSaveKey(userId: string, attemptId: number) {
  return `${SAVE_PREFIX}${userId}:${attemptId}`;
}

function clampScore(score: number | undefined) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(10, Math.round((score || 0) * 100) / 100));
}

function sanitizeText(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function formatList(items: string[] | undefined, fallback: string) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  return items
    .map((item) => sanitizeText(item, ''))
    .filter(Boolean)
    .slice(0, 2)
    .join('; ');
}

function buildGenericSummary(feedback: Feedback, fallback: string) {
  const strengths = formatList(feedback.strengths, 'No strengths captured.');
  const weaknesses = formatList(feedback.weaknesses, 'No weaknesses captured.');
  const suggestions = formatList(feedback.suggestions, 'Keep practicing consistently.');

  return `${fallback} Strengths: ${strengths}. Improve: ${weaknesses}. Next: ${suggestions}.`;
}

function buildSummary(stage: string, feedback: InterviewResults[keyof InterviewResults]) {
  if (!feedback) {
    return '';
  }

  switch (stage) {
    case 'aptitude_test': {
      const aptitudeFeedback = feedback as AptitudeFeedback;
      return `${aptitudeFeedback.correctCount}/${aptitudeFeedback.totalQuestions} answers correct. ${buildGenericSummary(
        aptitudeFeedback,
        'Aptitude performance reviewed.'
      )}`;
    }
    case 'technical_qa': {
      const technicalFeedback = feedback as TechnicalQAFeedback;
      return `Answered ${technicalFeedback.questionCount} technical questions. ${buildGenericSummary(
        technicalFeedback,
        'Technical depth and clarity reviewed.'
      )}`;
    }
    case 'coding_challenge': {
      const codingFeedback = feedback as CodingFeedback;
      return `Logic: ${sanitizeText(codingFeedback.logic, 'Not captured')}. Syntax: ${sanitizeText(
        codingFeedback.syntax,
        'Not captured'
      )}. Efficiency: ${sanitizeText(codingFeedback.efficiency, 'Not captured')}. ${buildGenericSummary(
        codingFeedback,
        'Coding implementation reviewed.'
      )}`;
    }
    case 'hr_round': {
      const hrFeedback = feedback as HRFeedback;
      return `Communication ${clampScore(hrFeedback.communication)}/10, problem solving ${clampScore(
        hrFeedback.problemSolving
      )}/10, cultural fit ${clampScore(hrFeedback.culturalFit)}/10, leadership ${clampScore(
        hrFeedback.leadership
      )}/10. ${buildGenericSummary(feedback, 'HR round performance reviewed.')}`;
    }
    default:
      return buildGenericSummary(feedback, 'Interview stage reviewed.');
  }
}

export function buildInterviewReportRows(
  userId: string,
  results: InterviewResults,
  createdAt = new Date().toISOString()
): StoredReport[] {
  const stageEntries: Array<{ stage: string; feedback: InterviewResults[keyof InterviewResults] }> = [
    { stage: 'self_introduction', feedback: results.selfIntroduction },
    { stage: 'aptitude_test', feedback: results.aptitude },
    { stage: 'technical_qa', feedback: results.technicalQA },
    { stage: 'coding_challenge', feedback: results.coding },
    { stage: 'hr_round', feedback: results.hrRound },
  ];

  return stageEntries
    .filter((entry) => Boolean(entry.feedback))
    .map((entry, index) => ({
      id: `local-${createdAt}-${entry.stage}-${index}`,
      user_id: userId,
      stage: entry.stage,
      score: clampScore(entry.feedback?.score),
      summary: buildSummary(entry.stage, entry.feedback),
      created_at: createdAt,
    }))
    .filter((entry) => entry.summary);
}

function toReportSignature(report: Pick<StoredReport, 'user_id' | 'stage' | 'score' | 'summary'>) {
  return [report.user_id, report.stage, report.score, report.summary.trim()].join('|');
}

function sortReports(reports: StoredReport[]) {
  return [...reports].sort((left, right) => {
    const leftValue = Date.parse(left.created_at || '') || 0;
    const rightValue = Date.parse(right.created_at || '') || 0;
    return rightValue - leftValue;
  });
}

export function mergeStoredReports(primary: StoredReport[], secondary: StoredReport[]) {
  const merged = new Map<string, StoredReport>();

  [...primary, ...secondary].forEach((report) => {
    const key = toReportSignature(report);
    if (!merged.has(key)) {
      merged.set(key, report);
    }
  });

  return sortReports(Array.from(merged.values()));
}

export function getCachedReports(userId: string): StoredReport[] {
  if (!userId || typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getCacheKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortReports(
      parsed.filter((report): report is StoredReport => {
        return Boolean(
          report &&
            typeof report.id === 'string' &&
            typeof report.user_id === 'string' &&
            typeof report.stage === 'string' &&
            typeof report.summary === 'string' &&
            typeof report.created_at === 'string'
        );
      })
    );
  } catch (error) {
    console.error('Failed to read cached reports:', error);
    return [];
  }
}

function writeCachedReports(userId: string, reports: StoredReport[]) {
  if (!userId || typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(getCacheKey(userId), JSON.stringify(sortReports(reports).slice(0, 100)));
  } catch (error) {
    console.error('Failed to cache reports locally:', error);
  }
}

export async function saveInterviewReports(userId: string, results: InterviewResults, attemptId: number) {
  const reports = buildInterviewReportRows(userId, results);
  if (!userId || reports.length === 0 || attemptId <= 0) {
    return { saved: 0, cached: 0, synced: false };
  }

  if (typeof window !== 'undefined') {
    const saveKey = getSaveKey(userId, attemptId);
    if (window.sessionStorage.getItem(saveKey) === '1') {
      return { saved: 0, cached: 0, synced: true };
    }

    window.sessionStorage.setItem(saveKey, '1');
  }

  const cached = mergeStoredReports(reports, getCachedReports(userId));
  writeCachedReports(userId, cached);

  const rowsToInsert: ReportInsert[] = reports.map((report) => ({
    user_id: report.user_id,
    stage: report.stage,
    score: report.score,
    summary: report.summary,
  }));

  try {
    const { error } = await supabase.from('reports').insert(rowsToInsert);
    if (error) {
      console.error('Failed to persist interview reports:', error);
      return {
        saved: 0,
        cached: reports.length,
        synced: false,
      };
    }

    return {
      saved: reports.length,
      cached: reports.length,
      synced: true,
    };
  } catch (error) {
    console.error('Unexpected report persistence failure:', error);
    return {
      saved: 0,
      cached: reports.length,
      synced: false,
    };
  }
}
