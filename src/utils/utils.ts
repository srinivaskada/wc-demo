export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}
export const getMediaPath = (name: string) => `/surf-wc-assets/media/${name}`
