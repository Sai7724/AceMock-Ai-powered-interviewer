import type { TestWorkflowResults } from './stageConfig';

const STORAGE_KEY = 'acemock:test-workflow-results';

export function loadTestWorkflowResults(): TestWorkflowResults {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as TestWorkflowResults;
  } catch (error) {
    console.error('Failed to read test workflow results from session storage:', error);
    return {};
  }
}

export function saveTestWorkflowResults(results: TestWorkflowResults) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Failed to persist test workflow results:', error);
  }
}

export function clearTestWorkflowResults() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear test workflow results:', error);
  }
}
