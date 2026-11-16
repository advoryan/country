export type Debounced<Args extends unknown[]> = ((...args: Args) => void) & { cancel: () => void };

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = (): void => clearTimeout(timer);

  const debounced = (...args: Args): void => {
    cancel();
    timer = setTimeout(() => fn(...args), delay);
  };

  return Object.assign(debounced, { cancel });
}
