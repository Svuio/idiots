import { getStore } from "@netlify/blobs";

const STORE_NAME = "disc-color-check";
const KEY = "results";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8",
};

async function readResults(store) {
  try {
    const data = await store.get(KEY, { type: "json" });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("", { status: 204, headers: corsHeaders });
  }

  const store = getStore(STORE_NAME);
  const url = new URL(request.url);

  try {
    if (request.method === "GET") {
      const results = await readResults(store);
      return Response.json({ results }, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      const payload = await request.json();
      const results = await readResults(store);
      const record = {
        id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: String(payload.name || "").trim() || "Anonymous",
        primary: payload.primary,
        secondary: payload.secondary,
        score: payload.score || { D: 0, I: 0, S: 0, C: 0 },
        submittedAt: payload.submittedAt || new Date().toISOString(),
      };
      const next = [record, ...results];
      await store.setJSON(KEY, next);
      return Response.json({ ok: true, record, results: next }, { headers: corsHeaders });
    }

    if (request.method === "DELETE") {
      const results = await readResults(store);

      if (url.searchParams.get("all") === "true") {
        await store.setJSON(KEY, []);
        return Response.json({ ok: true, results: [] }, { headers: corsHeaders });
      }

      const id = url.searchParams.get("id");
      const indexParam = url.searchParams.get("index");
      let next = results;

      if (id) {
        next = results.filter((record) => record.id !== id);
      } else if (indexParam !== null) {
        const index = Number(indexParam);
        next = results.filter((_, i) => i !== index);
      }

      await store.setJSON(KEY, next);
      return Response.json({ ok: true, results: next }, { headers: corsHeaders });
    }

    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
