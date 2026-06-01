const { getStore } = require("@netlify/blobs");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "colors2026";
const STORE_NAME = "disc-color-check-results";
const KEY = "results.json";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function response(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

async function readResults(store) {
  const raw = await store.get(KEY, { consistency: "strong" });
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeResults(store, results) {
  await store.set(KEY, JSON.stringify(results));
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  try {
    if (event.httpMethod === "POST") {
      const record = JSON.parse(event.body || "{}");
      if (!record.name || !record.primary || !record.score) return response(400, { error: "Invalid record" });
      const safeRecord = { ...record, id: record.id || `${Date.now()}-${Math.random().toString(16).slice(2)}` };
      const results = await readResults(store);
      results.unshift(safeRecord);
      await writeResults(store, results);
      return response(200, { ok: true, record: safeRecord });
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const password = event.queryStringParameters?.adminPassword || body.adminPassword;
    if (password !== ADMIN_PASSWORD) return response(401, { error: "Unauthorized" });

    if (event.httpMethod === "GET") {
      const results = await readResults(store);
      return response(200, results);
    }

    if (event.httpMethod === "DELETE") {
      let results = await readResults(store);
      if (body.all) {
        results = [];
      } else if (body.id) {
        results = results.filter((item) => item.id !== body.id);
      } else if (Number.isInteger(body.index)) {
        results = results.filter((_, index) => index !== body.index);
      }
      await writeResults(store, results);
      return response(200, { ok: true, results });
    }

    return response(405, { error: "Method not allowed" });
  } catch (error) {
    return response(500, { error: error.message || "Server error" });
  }
};
