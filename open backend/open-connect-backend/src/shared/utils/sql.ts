export function where(parts: string[]): string {
  return parts.length ? ` WHERE ${parts.join(' AND ')}` : '';
}

export function camelize<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase()), value,
  ])) as T;
}
