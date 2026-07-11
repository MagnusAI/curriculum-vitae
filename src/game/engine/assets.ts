// Image loader. All URLs must come from Vite `import url from '….png'`
// statements so they are rewritten under the GitHub Pages base path.
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export async function loadImages<K extends string>(
  urls: Record<K, string>,
): Promise<Record<K, HTMLImageElement>> {
  const entries = Object.entries(urls) as [K, string][];
  const loaded = await Promise.all(entries.map(([, url]) => loadImage(url)));
  const result = {} as Record<K, HTMLImageElement>;
  entries.forEach(([key], i) => {
    result[key] = loaded[i];
  });
  return result;
}
