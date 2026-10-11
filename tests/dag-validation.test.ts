import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface Task {
  display_id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  dependencies: string[];
}

function validateTaskAdvance(
  targetTaskId: string,
  targetStatus: string,
  allTasks: Task[]
): { allowed: boolean; error?: string; blockedBy?: string[] } {
  const currentTask = allTasks.find((t) => t.display_id === targetTaskId);
  if (!currentTask) {
    return { allowed: false, error: `Task ${targetTaskId} not found.` };
  }

  // If attempting to advance to done, verify all prerequisites are done
  if (targetStatus === 'done' && Array.isArray(currentTask.dependencies) && currentTask.dependencies.length > 0) {
    const unfinishedDeps = allTasks.filter(
      (t) => currentTask.dependencies.includes(t.display_id) && t.status !== 'done'
    );

    if (unfinishedDeps.length > 0) {
      const depNames = unfinishedDeps.map((d) => `${d.display_id} (${d.status})`).join(', ');
      return {
        allowed: false,
        error: `Prerequisite Blocked: Task ${targetTaskId} cannot advance to Done until dependencies are complete: ${depNames}`,
        blockedBy: unfinishedDeps.map((d) => d.display_id),
      };
    }
  }

  return { allowed: true };
}

describe('Task DAG Dependency Enforcement Suite', () => {
  const mockTasks: Task[] = [
    { display_id: 'TSK-001', title: 'Scaffold App Shell', status: 'done', dependencies: [] },
    { display_id: 'TSK-002', title: 'Setup Database', status: 'in_progress', dependencies: ['TSK-001'] },
    { display_id: 'TSK-003', title: 'Build Roster UI', status: 'todo', dependencies: ['TSK-002'] },
    { display_id: 'TSK-004', title: 'Export PDF Report', status: 'todo', dependencies: ['TSK-002', 'TSK-003'] },
  ];

  it('allows root tasks with zero dependencies to complete', () => {
    const res = validateTaskAdvance('TSK-001', 'done', mockTasks);
    assert.equal(res.allowed, true);
  });

  it('blocks TSK-003 from advancing to done while TSK-002 is still in_progress', () => {
    const res = validateTaskAdvance('TSK-003', 'done', mockTasks);
    assert.equal(res.allowed, false);
    assert.ok(res.error?.includes('Prerequisite Blocked'));
    assert.deepEqual(res.blockedBy, ['TSK-002']);
  });

  it('allows TSK-002 to advance to done since prerequisite TSK-001 is done', () => {
    const res = validateTaskAdvance('TSK-002', 'done', mockTasks);
    assert.equal(res.allowed, true);
  });

  it('allows TSK-003 to advance once TSK-002 is resolved to done', () => {
    const updatedTasks: Task[] = mockTasks.map((t) =>
      t.display_id === 'TSK-002' ? { ...t, status: 'done' as const } : t
    );
    const res = validateTaskAdvance('TSK-003', 'done', updatedTasks);
    assert.equal(res.allowed, true);
  });

  it('detects multiple incomplete dependencies for multi-dep tasks', () => {
    const res = validateTaskAdvance('TSK-004', 'done', mockTasks);
    assert.equal(res.allowed, false);
    assert.deepEqual(res.blockedBy, ['TSK-002', 'TSK-003']);
  });
});
