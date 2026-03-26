/**
 * useLenis — simple singleton accessor for a Lenis smooth-scroll instance.
 *
 * This is a lightweight fallback that doesn't require the `lenis` package.
 * The Header uses getLenis() to scroll to sections; if Lenis is not installed
 * it falls back to native smooth scroll.
 */

type LenisInstance = {
  scrollTo: (target: string | HTMLElement | number, options?: object) => void;
  destroy?: () => void;
};

let _lenis: LenisInstance | null = null;

/** Store the Lenis instance created at the app level. */
export function setLenis(instance: LenisInstance | null) {
  _lenis = instance;
}

/** Get the current Lenis instance (null if not initialised). */
export function getLenis(): LenisInstance | null {
  return _lenis;
}
