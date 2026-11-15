// Browser stand-in for node:fs/promises (single-file preview only; the Google adapter is never used there).
const unavailable = async () => { throw new Error('File access is not available in the preview'); };
export const readFile = unavailable;
export const writeFile = unavailable;
export const mkdir = unavailable;
export const readdir = unavailable;
export const rename = unavailable;
