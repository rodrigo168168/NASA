import { describe, expect, it } from 'vitest';
import { pickNextCycleEvent } from './events';

describe('pickNextCycleEvent', () => {
  it('el Sol 3 siempre trae la tormenta solar, en Marte y en la Luna', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickNextCycleEvent(3, 'mars', []).id).toBe('solar_flare_lunar');
      expect(pickNextCycleEvent(3, 'moon', ['solar_flare_lunar']).id).toBe('solar_flare_lunar');
    }
  });

  it('el Sol 1 sigue siendo el despliegue inicial', () => {
    expect(pickNextCycleEvent(1, 'mars', []).id).toBe('sol1_initial_deployment');
  });
});
