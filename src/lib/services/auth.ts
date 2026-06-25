// Supabase client setup and auth service
// Falls back to no-op when Supabase is not configured

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = typeof window !== 'undefined'
	? (import.meta as any).env?.VITE_SUPABASE_URL ?? ''
	: '';

const SUPABASE_ANON_KEY = typeof window !== 'undefined'
	? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? ''
	: '';

export const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
	if (!supabaseInstance) {
		if (!hasSupabase) {
			throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
		}
		supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
	}
	return supabaseInstance;
}

export interface AuthUser {
	id: string;
	email: string;
}

export async function signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
	if (!hasSupabase) return { user: null, error: 'Supabase is not configured' };
	const { data, error } = await getSupabase().auth.signUp({ email, password });
	if (error) return { user: null, error: error.message };
	if (!data.user) return { user: null, error: 'No user returned' };
	return { user: { id: data.user.id, email: data.user.email ?? '' }, error: null };
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
	if (!hasSupabase) return { user: null, error: 'Supabase is not configured' };
	const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
	if (error) return { user: null, error: error.message };
	if (!data.user) return { user: null, error: 'No user returned' };
	return { user: { id: data.user.id, email: data.user.email ?? '' }, error: null };
}

export async function signOut(): Promise<void> {
	if (!hasSupabase) return;
	await getSupabase().auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
	if (!hasSupabase) return null;
	const { data } = await getSupabase().auth.getUser();
	if (!data.user) return null;
	return { id: data.user.id, email: data.user.email ?? '' };
}

export async function getSession() {
	if (!hasSupabase) return null;
	const { data } = await getSupabase().auth.getSession();
	return data.session;
}