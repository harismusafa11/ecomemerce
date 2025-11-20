// A simplified version of shadcn's cn utility to merge tailwind classes.
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
