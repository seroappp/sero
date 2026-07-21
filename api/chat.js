module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Yalnız POST sorğusu qəbul edilir." });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const message = body?.message?.trim();

    if (!message) {
      return res.status(400).json({ error: "Mesaj boş ola bilməz." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API açarı tapılmadı." });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions:
          "Sən SERO AI adlı ağıllı köməkçisən. İstifadəçinin dilində, aydın, faydalı və nəzakətli cavab ver.",
        input: message,
        max_output_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI xətası:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI sorğusunda xəta baş verdi.",
      });
    }

    const reply =
      data.output
        ?.flatMap((item) => item.content || [])
        .find((item) => item.type === "output_text")?.text ||
      "Hazırda cavab yaratmaq mümkün olmadı.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("SERO API xətası:", error);

    return res.status(500).json({
      error: "Serverdə xəta baş verdi. Bir qədər sonra yenidən yoxlayın.",
    });
  }
};
