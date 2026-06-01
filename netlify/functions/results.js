import { getStore } from "@netlify/blobs";

const STORE_NAME = "disc-color-check-results";
const RESULTS_KEY = "results";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

function normalizeRecord(input) {
  const now = new Date().toISOString();
  const safe = input && typeof input === "object" ? input : {};

  return {
    id: safe.id || `${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(16).slice(2)}`,
    name: String(safe.name || "").trim() || "Без име",
    primary: safe.primary || "D",
    secondary: safe.secondary || "I",
    score: safe.score || { D: 0, I: 0, S: 0, C: 0 },
    submittedAt: safe.submittedAt || now,
  };
}

async function readResults(store) {
  const data = await store.get(RESULTS_KEY, {
    type: "json",
    consistency: "strong",
  });

  return Array.isArray(data) ? data : [];
}

async function writeResults(store, results) {
  await store.setJSON(RESULTS_KEY, results, {
    consistency: "strong",
  });
}

export default async (request) => {
  try {
    const store = getStore({
      name: STORE_NAME,
      consistency: "strong",
    });

    if (request.method === "GET") {
      const results = await readResults(store);
      return json({ results });
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const record = normalizeRecord(body);
      const current = await readResults(store);
      const results = [record, ...current];
      await writeResults(store, results);
      return json({ record, results });
    }

    if (request.method === "DELETE") {
      const url = new URL(request.url);

      if (url.searchParams.get("all") === "true") {
        await writeResults(store, []);
        return json({ results: [] });
      }

      const id = url.searchParams.get("id");
      const indexValue = url.searchParams.get("index");
      const index = indexValue === null ? -1 : Number(indexValue);
      const current = await readResults(store);

      const results = current.filter((record, i) => {
        if (id) return record.id !== id;
        return i !== index;
      });

      await writeResults(store, results);
      return json({ results });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    return json({
      error: "Results function failed",
      message: error?.message || String(error),
    }, 500);
  }
};
