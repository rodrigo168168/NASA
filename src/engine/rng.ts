// Generador de números con semilla: el mismo código de misión da siempre la misma partida.
// Así toda un aula juega los mismos eventos en el mismo orden y los puntajes se pueden comparar.

/** Deja el código como lo escribiría cualquiera: mayúsculas, sin tildes ni espacios sueltos. */
export function normalizarCodigo(codigo: string): string {
  return codigo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
}

/** Convierte un texto en un número de 32 bits (FNV-1a). */
export function semillaDeTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Generador mulberry32: devuelve números entre 0 y 1, siempre los mismos para la misma semilla. */
export function crearGenerador(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
