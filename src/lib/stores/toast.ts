// Global toast instance — set by Toast component in layout, used by any code

type ToastType = 'success' | 'xp' | 'streak' | 'levelup' | 'achievement' | 'info' | 'error';

let _show: ((type: ToastType, message: string, detail?: string, icon?: string) => void) | null = null;

export function setToastInstance(instance: { show: (type: ToastType, message: string, detail?: string, icon?: string) => void }) {
	_show = instance.show.bind(instance);
}

export function showToast(type: ToastType, message: string, detail?: string, icon?: string) {
	_show?.(type, message, detail, icon);
}