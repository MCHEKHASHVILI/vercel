export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { endpoint } = req.query;

  // Route 1: Anthropic API proxy
  if (endpoint === "claude" || !endpoint) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Route 2: RemoteOK jobs
  if (endpoint === "remoteok") {
    try {
      const response = await fetch("https://remoteok.io/api", {
        headers: {
          "User-Agent": "CareerIntel/1.0 (contact: m.chekhashvili@gmail.com)",
        },
      });
      const data = await response.json();

      // First item is a legal notice, filter it out
      const jobs = data.filter(j => j.id && j.position);

      // Filter for PHP/Laravel/Java/Backend relevant jobs
      const KEYWORDS = ["php", "laravel", "java", "spring", "backend", "codeigniter", "api", "saas", "mysql", "postgresql", "full-stack", "fullstack"];
      const filtered = jobs.filter(job => {
        const searchable = [
          job.position || "",
          job.description || "",
          ...(job.tags || [])
        ].join(" ").toLowerCase();
        return KEYWORDS.some(kw => searchable.includes(kw));
      });

      const shaped = filtered.slice(0, 20).map(job => ({
        id: job.id,
        title: job.position,
        company: job.company,
        description: (job.description || "").replace(/<[^>]*>/g, "").slice(0, 300),
        tags: job.tags || [],
        url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
        salary: job.salary_min ? `$${Math.round(job.salary_min/1000)}K–$${Math.round(job.salary_max/1000)}K/yr` : null,
        date: job.date,
      }));

      return res.status(200).json({ jobs: shaped });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Unknown endpoint. Use ?endpoint=claude or ?endpoint=remoteok" });
}
