// Taco Taco Assist order relay.
//
// The website's tap-to-order basket POSTs the finished order here. This function
// forwards it to the Chatbase REST API using the SECRET api key (kept only in the
// Netlify environment variable CHATBASE_API_KEY, never in the site code), and
// returns the assistant's reply. Passing conversationId logs each order to the
// Chatbase dashboard.
//
// Required Netlify env var:  CHATBASE_API_KEY   (your Chatbase secret key)
// Optional Netlify env var:  ALLOWED_ORIGINS    (comma-separated site origins to
//                            restrict who may call this function, e.g.
//                            "https://tacotaco.netlify.app,https://tacotacobelize.com").
//                            If unset, all origins are allowed.

const CHATBOT_ID = "goJ6R0Hw-bYT3iEd4kaKE";
const CHATBASE_URL = "https://www.chatbase.co/api/v1/chat";

exports.handler = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  const allow = allowedOrigin(origin);

  if (event.httpMethod === "OPTIONS") return resp(204, "", allow);
  if (event.httpMethod !== "POST") return resp(405, { error: "Method not allowed" }, allow);
  if (allow === null) return resp(403, { error: "Origin not allowed" }, "*");

  const key = process.env.CHATBASE_API_KEY;
  if (!key) return resp(500, { error: "Server is missing CHATBASE_API_KEY" }, allow);

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch (e) { return resp(400, { error: "Invalid JSON body" }, allow); }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length) return resp(400, { error: "No messages provided" }, allow);

  try {
    const r = await fetch(CHATBASE_URL, {
      method: "POST",
      headers: { "Authorization": "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        chatbotId: CHATBOT_ID,
        conversationId: body.conversationId,
        stream: false,
        messages: messages.map((m) => ({ role: m.role, content: String(m.content || "") })),
      }),
    });

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); } catch (e) { data = { text: raw }; }

    if (!r.ok) {
      console.error("Chatbase error", r.status, raw);
      return resp(502, { error: "Assistant is unavailable", status: r.status }, allow);
    }
    // Chatbase non-streaming replies as { text: "..." }.
    return resp(200, { text: data.text || data.reply || "" }, allow);
  } catch (e) {
    console.error("Relay failure", e);
    return resp(502, { error: "Could not reach the assistant" }, allow);
  }
};

function allowedOrigin(origin) {
  const list = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!list.length) return origin || "*";      // no allowlist configured: allow all
  if (origin && list.includes(origin)) return origin;
  return null;                                  // configured, and this origin is not on it
}

function resp(status, payload, allowOrigin) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  };
}
