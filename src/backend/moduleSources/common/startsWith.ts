function startsWith(str: string, start: string): boolean {
  return start === str.slice(0, start.length);
}

export { startsWith };
