// Сервис для работы с TLE данными

export function parseTLE(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const result = [];
  for (let i = 0; i < lines.length - 2; i += 3) {
    const name = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (line1?.startsWith("1 ") && line2?.startsWith("2 ")) {
      result.push({ name, line1, line2 });
    }
  }
  return result;
}

export async function fetchTLE(urls) {
  const proxies = [
    (url) => url,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://cors.isomorphic-git.org/${url}`,
    (url) => `https://r.jina.ai/http://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`,
    (url) => `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`,
    (url) => `https://r.jina.ai/https://${url.replace(/^https?:\/\//, "")}`
  ];

  for (const url of urls) {
    for (const makeProxyUrl of proxies) {
      try {
        const target = makeProxyUrl(url);
        const response = await fetch(target, { cache: "no-store" });
        if (response.ok) {
          const text = await response.text();
          if (text && text.includes("1 ") && text.includes("2 ")) {
            return text;
          }
        }
      } catch {
        // Try next proxy.
      }
    }
  }

  throw new Error("TLE load failed: all sources blocked");
}
