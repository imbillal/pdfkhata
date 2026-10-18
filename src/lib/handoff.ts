// Carries files dropped on the home page into the tool the user picks next.
// Lives in module memory, so it survives client-side navigation but not a reload.

let pending: File[] | null = null;

export function setHandoff(files: File[]): void {
  pending = files;
}

/** Returns and clears the pending files, if any. */
export function takeHandoff(): File[] | null {
  const files = pending;
  pending = null;
  return files;
}
