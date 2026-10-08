// Garden growth mapping tests — stack activity → plant stage/progress and
// machine part assembly for the Rewards tab.

import { describe, it, expect } from 'vitest';
import { computePlantProgress, machineBuildState, MACHINE_PARTS } from './plant-growth';
import type { Stack, Habit, Completion } from '$lib/types';
import { today, daysAgo } from '$lib/utils/helpers';

const T = today();

function makeStack(id: string): Stack {
	return {
		id, user_id: 'user1', name: `Stack ${id}`, trigger: 'after trigger',
		color: 'indigo', icon: '☕', sort_order: 0,
		created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z'
	};
}

function makeHabit(id: string, stackId: string): Habit {
	return {
		id, stack_id: stackId, user_id: 'user1', name: `Habit ${id}`,
		sort_order: 0, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z'
	};
}

function makeCompletion(habitId: string, date: string): Completion {
	return {
		id: `c-${habitId}-${date}`, habit_id: habitId, user_id: 'user1',
		completed_at: date, created_at: '2024-01-01T00:00:00Z'
	};
}

function build(nStacks: number, habitsPer: number) {
	const stacks: Stack[] = [];
	const habits: Habit[] = [];
	for (let s = 0; s < nStacks; s++) {
		const stack = makeStack(`s${s + 1}`);
		stacks.push(stack);
		for (let h = 0; h < habitsPer; h++) habits.push(makeHabit(`s${s + 1}-h${h + 1}`, stack.id));
	}
	return { stacks, habits };
}

describe('computePlantProgress — stage mapping', () => {
	it('brand-new stack (no completions) is a seed', () => {
		const { stacks, habits } = build(1, 2);
		const g = computePlantProgress(stacks[0].id, habits, []);
		expect(g.stage).toBe(0);
		expect(g.stageName).toBe('seed');
		expect(g.wilting).toBe(false);
		expect(g.progress).toBe(0);
		expect(g.nextLabel).toContain('New stack');
	});

	it('1-2 day streak is a sprout with interpolated progress', () => {
		const { stacks, habits } = build(1, 2);
		// only h1 completed yesterday → 1-day streak, not complete today
		const one = [makeCompletion('s1-h1', daysAgo(1))];
		let g = computePlantProgress(stacks[0].id, habits, one);
		expect(g.stage).toBe(1);
		expect(g.wilting).toBe(false);
		expect(g.progress).toBe(0);
		expect(g.nextLabel).toBe('2 days to grow');

		const two = [makeCompletion('s1-h1', daysAgo(2)), makeCompletion('s1-h1', daysAgo(1))];
		g = computePlantProgress(stacks[0].id, habits, two);
		expect(g.stage).toBe(1);
		expect(g.progress).toBe(0.5);
		expect(g.nextLabel).toBe('1 day to grow');
	});

	it('3+ day streak not completed today is growing + WILTING', () => {
		const { stacks, habits } = build(1, 2);
		const completions = [
			makeCompletion('s1-h1', daysAgo(3)),
			makeCompletion('s1-h1', daysAgo(2)),
			makeCompletion('s1-h1', daysAgo(1))
		];
		const g = computePlantProgress(stacks[0].id, habits, completions);
		expect(g.stage).toBe(2);
		expect(g.stageName).toBe('growing');
		expect(g.wilting).toBe(true);
		expect(g.streak).toBe(3);
		expect(g.nextLabel).toBe('11 days to mature');
	});

	it('3+ day streak COMPLETE today blooms (wilting cleared)', () => {
		const { stacks, habits } = build(1, 2);
		const completions = [
			makeCompletion('s1-h1', daysAgo(4)),
			makeCompletion('s1-h1', daysAgo(3)),
			makeCompletion('s1-h1', daysAgo(2)),
			makeCompletion('s1-h1', daysAgo(1)),
			makeCompletion('s1-h1', T),
			makeCompletion('s1-h2', T) // stack now full today
		];
		const g = computePlantProgress(stacks[0].id, habits, completions);
		expect(g.stage).toBe(3);
		expect(g.stageName).toBe('blooming');
		expect(g.wilting).toBe(false);
		expect(g.completeToday).toBe(true);
		expect(g.streak).toBe(5);
		expect(g.progress).toBeCloseTo(5 / 14, 5);
	});

	it('14+ day streak is mature — never wilts, even if today is empty', () => {
		const { stacks, habits } = build(1, 2);
		const completions: Completion[] = [];
		for (let i = 14; i >= 1; i--) {
			completions.push(makeCompletion('s1-h1', daysAgo(i))); // ends yesterday
		}
		let g = computePlantProgress(stacks[0].id, habits, completions);
		expect(g.stage).toBe(4);
		expect(g.stageName).toBe('mature');
		expect(g.wilting).toBe(false);
		expect(g.progress).toBe(1);
		expect(g.streak).toBe(14); // ends yesterday → 14 consecutive days

		// And with today watered: still mature (mature outranks blooming)
		completions.push(makeCompletion('s1-h1', T), makeCompletion('s1-h2', T));
		g = computePlantProgress(stacks[0].id, habits, completions);
		expect(g.stage).toBe(4);
		expect(g.nextLabel).toBe('Fully grown 🌳');
	});

	it('a broken streak (last completion 5 days ago) falls back to seed', () => {
		const { stacks, habits } = build(1, 2);
		const completions = [makeCompletion('s1-h1', daysAgo(5))];
		const g = computePlantProgress(stacks[0].id, habits, completions);
		expect(g.stage).toBe(0);
		expect(g.wilting).toBe(false);
		expect(g.nextLabel).toContain('Streak broke');
	});

	it('stack with 0 habits is always a seed and never complete', () => {
		const stack = makeStack('empty');
		const g = computePlantProgress(stack.id, [], []);
		expect(g.stage).toBe(0);
		expect(g.completeToday).toBe(false);
	});

	it('stage reflects only the stack\u2019s OWN completions (cross-stack isolation)', () => {
		const { stacks, habits } = build(2, 2);
		const completions = [makeCompletion('s2-h1', T), makeCompletion('s2-h2', T)];
		const g = computePlantProgress(stacks[0].id, habits, completions);
		expect(g.stage).toBe(0); // s1 untouched although s2 is full today
	});
});

describe('machineBuildState — one part per full-stack day', () => {
	const PARTS_SIZE = MACHINE_PARTS.length; // 6

	it('zero full days → case not yet fitted', () => {
		const { stacks, habits } = build(1, 2);
		const m = machineBuildState(stacks[0].id, habits, []);
		expect(m.stepsBuilt).toBe(0);
		expect(m.progress).toBe(0);
		expect(m.nextLabel).toContain(MACHINE_PARTS[0]);
	});

	it('each day where the WHOLE stack was done fits the next part', () => {
		const { stacks, habits } = build(1, 2);
		// two full days (h1+h2 both days) + one trailing partial day
		const completions = [
			makeCompletion('s1-h1', daysAgo(3)), makeCompletion('s1-h2', daysAgo(3)),
			makeCompletion('s1-h1', daysAgo(2)), makeCompletion('s1-h2', daysAgo(2)),
			makeCompletion('s1-h1', T) // today partial — must NOT add a part
		];
		const m = machineBuildState(stacks[0].id, habits, completions);
		expect(m.stepsBuilt).toBe(2);
		expect(m.progress).toBeCloseTo(2 / PARTS_SIZE, 5);
		expect(m.nextLabel).toBe('4 days → tuning dial');
	});

	it('caps at all parts built and announces broadcasting', () => {
		const { stacks, habits } = build(1, 2);
		const completions: Completion[] = [];
		for (let i = 0; i < PARTS_SIZE + 4; i++) {
			completions.push(makeCompletion('s1-h1', daysAgo(i)), makeCompletion('s1-h2', daysAgo(i)));
		}
		const m = machineBuildState(stacks[0].id, habits, completions);
		expect(m.stepsBuilt).toBe(PARTS_SIZE);
		expect(m.progress).toBe(1);
		expect(m.nextLabel).toContain('Radio complete');
	});

	it('machine is unaffected by a plant-theme streak collapse', () => {
		const { stacks, habits } = build(1, 2);
		// full day long ago only
		const completions = [
			makeCompletion('s1-h1', daysAgo(9)), makeCompletion('s1-h2', daysAgo(9))
		];
		const m = machineBuildState(stacks[0].id, habits, completions);
		expect(m.stepsBuilt).toBe(1);
		expect(m.nextLabel).toBe('5 days → speaker grill');
	});
});