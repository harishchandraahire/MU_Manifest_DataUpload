/** Browser security prevents reading the real OS machine name, so this falls back
 * through the best available client identifiers. */
export function getMachineName(): string {
  return window.location.hostname || navigator.userAgent || 'unknown-machine'
}
