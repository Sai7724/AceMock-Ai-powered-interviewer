import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockInsert, mockFrom } = vi.hoisted(() => {
  const hoistedMockInsert = vi.fn();
  const hoistedMockFrom = vi.fn(() => ({
    insert: hoistedMockInsert,
  }));

  return {
    mockInsert: hoistedMockInsert,
    mockFrom: hoistedMockFrom,
  };
});

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import { getCachedReports, saveInterviewReports } from '../services/reportHistory';
import type { InterviewResults } from '../types';

describe('reportHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.removeItem?.('acemock:reports:user-1');
    window.sessionStorage.removeItem?.('acemock:report-save:user-1:1');
    window.sessionStorage.removeItem?.('acemock:report-save:user-1:3');
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('persists completed interview reports and caches them locally', async () => {
    const results: InterviewResults = {
      selfIntroduction: {
        score: 8,
        strengths: ['Confident opening'],
        weaknesses: ['Could be more concise'],
        suggestions: ['Add one concrete achievement'],
      },
      aptitude: {
        score: 7,
        strengths: ['Solid reasoning'],
        weaknesses: ['Missed time-saving shortcuts'],
        suggestions: ['Practice timed sets'],
        correctCount: 7,
        totalQuestions: 10,
        detailedResults: [],
      },
    };

    const response = await saveInterviewReports('user-1', results, 1);

    expect(response.synced).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('reports');
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'user-1',
        stage: 'self_introduction',
        score: 8,
      }),
      expect.objectContaining({
        user_id: 'user-1',
        stage: 'aptitude_test',
        score: 7,
      }),
    ]);

    const cachedReports = getCachedReports('user-1');
    expect(cachedReports).toHaveLength(2);
    expect(cachedReports[0]?.user_id).toBe('user-1');
  });

  it('does not save the same attempt twice in one session', async () => {
    const results: InterviewResults = {
      selfIntroduction: {
        score: 9,
        strengths: ['Clear structure'],
        weaknesses: ['Minor filler words'],
        suggestions: ['Slow down slightly'],
      },
    };

    await saveInterviewReports('user-1', results, 3);
    await saveInterviewReports('user-1', results, 3);

    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(getCachedReports('user-1')).toHaveLength(1);
  });
});
