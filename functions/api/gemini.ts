export async function onRequestPost({ request }: { request: any }) {
  const url = new URL(request.url);
  const model = url.searchParams.get("model");
  const key = url.searchParams.get("key");

  if (!model || !key) {
    return new Response("Missing model or key", { status: 400 });
  }

  const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

  const originalBody = await request.json();

  try {
    const response = await fetch(googleUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(originalBody),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow all origins for simplicity in this context
      },
      status: response.status,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
