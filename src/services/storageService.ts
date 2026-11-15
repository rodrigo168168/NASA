import { GameState } from '../domain/types';

const STORAGE_KEY = 'MARS1_MISSION_SAVE_V1';

export const storageService = {
  saveGame: (state: GameState): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const serialized = JSON.stringify(state);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (e) {
      console.warn('Failed to save mission state to localStorage', e);
      return false;
    }
  },

  loadGame: (): GameState | null => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as GameState;
      // Basic sanity checks
      if (!parsed.planet || !parsed.facilities || !parsed.subResources) return null;
      // Partida guardada con el presupuesto en dólares de antes: no tiene horas ni repuestos.
      if (typeof parsed.mainResources?.crewHours !== 'number' || typeof parsed.mainResources?.spareKg !== 'number') {
        return null;
      }
      return parsed;
    } catch (e) {
      console.warn('Failed to restore mission state', e);
      return null;
    }
  },

  clearSave: () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to clear save', e);
    }
  },
};

