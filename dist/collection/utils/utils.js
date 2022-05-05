export function format(first, middle, last) {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}
export const getMediaPath = (name) => `/assets/media/${name}`;
