const STORAGE_KEY = "activeDashboardId";

export function getActiveDashboardId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setActiveDashboardId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function clearActiveDashboardId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
