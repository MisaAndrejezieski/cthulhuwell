// ============================================================
// CthulhuWell — Utilidades matemáticas
// Funções puras, sem estado, sem dependências.
// ============================================================

/**
 * Limita `value` entre `min` e `max`.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Interpola linearmente de `a` para `b` em `t` (0..1).
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Distância entre dois pontos 2D.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number}
 */
export function dist2D(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Número aleatório entre `min` e `max`.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function rand(min, max) {
  return min + Math.random() * (max - min);
}