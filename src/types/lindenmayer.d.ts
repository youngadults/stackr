// Ambient type declarations for the `lindenmayer` package (ships no .d.ts).
// We only use the headless engine: string productions in, generated string out.
declare module 'lindenmayer' {
	export default class LSystem {
		constructor(options?: {
			axiom?: string;
			productions?: Record<string, string>;
			classicsymbolmode?: boolean;
		});
		/** Applies all productions n times and returns the generated string. */
		iterate(iterations?: number): string;
		/** Available after iterate(); kept optional for API compatibility. */
		output?: string;
	}
}