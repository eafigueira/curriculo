const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const database = require(path.join(ROOT, "data/database.json"));
const assets = require(path.join(ROOT, "data/assets.json"));
const site = require(path.join(ROOT, "data/site.json"));

const OUT_DIR = path.join(ROOT, "docs");

function parseDate(dateString) {
  const [month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1);
}

function diferencaEmMeses(dataInicial, dataFinal) {
  const [mesInicial, anoInicial] = dataInicial.split("/").map(Number);
  let mesFinal;
  let anoFinal;

  if (dataFinal) {
    [mesFinal, anoFinal] = dataFinal.split("/").map(Number);
  } else {
    const dataAtual = new Date();
    mesFinal = dataAtual.getMonth() + 1;
    anoFinal = dataAtual.getFullYear();
  }

  const dataInicio = new Date(anoInicial, mesInicial - 1);
  const dataFim = new Date(anoFinal, mesFinal - 1);
  return (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 + (dataFim.getMonth() - dataInicio.getMonth());
}

function formatPeriod(period) {
  return period
    .map((item) => {
      if (item.endDate) {
        return `${item.startDate} — ${item.endDate}`;
      }
      return `${item.startDate} — Atualmente`;
    })
    .join(" · ");
}

function summarizeHardSkills(jobs) {
  const stackTempo = {};
  const sortedJobs = [...jobs].sort(
    (a, b) => parseDate(b.period[0].startDate).getTime() - parseDate(a.period[0].startDate).getTime()
  );

  const firstJobDate = sortedJobs[sortedJobs.length - 1].period[0].startDate;
  const lastPeriod = sortedJobs[0].period[sortedJobs[0].period.length - 1];
  const timeTotalWorking = diferencaEmMeses(firstJobDate, lastPeriod.endDate);

  sortedJobs.forEach((job) => {
    job.period.forEach((periodo) => {
      const tempo = diferencaEmMeses(periodo.startDate, periodo.endDate);
      job.projects.forEach((project) => {
        project.stack.forEach((tech) => {
          stackTempo[tech] = (stackTempo[tech] || 0) + tempo;
        });
      });
    });
  });

  const stackTypes = assets.find((a) => a.type === "stacks")?.data || [];

  return Object.entries(stackTempo)
    .map(([name, months]) => {
      const meta = stackTypes.find((s) => s.name === name);
      return {
        name,
        type: meta?.type || "OTHER",
        months,
        years: Math.round((months / timeTotalWorking) * (timeTotalWorking / 12) * 10) / 10,
      };
    })
    .sort((a, b) => b.months - a.months);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function contactLink(type, contact) {
  const label = escapeHtml(contact);
  switch (type) {
    case "EMAIL":
      return `<a href="mailto:${escapeHtml(contact)}">${label}</a>`;
    case "GITHUB":
      return `<a href="${escapeHtml(contact)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    case "X":
      return `<a href="https://x.com/${escapeHtml(contact.replace("@", ""))}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    case "LINKEDIN":
      return `<a href="${escapeHtml(contact)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    default:
      return label;
  }
}

function contactIcon(type) {
  const icons = {
    EMAIL: "✉",
    GITHUB: "⌘",
    X: "𝕏",
    LINKEDIN: "in",
  };
  return icons[type] || "•";
}

function groupSkillsByType(skills) {
  const groups = {};
  skills.forEach((skill) => {
    if (!groups[skill.type]) {
      groups[skill.type] = [];
    }
    groups[skill.type].push(skill);
  });
  return groups;
}

function skillTypeLabel(type) {
  const labels = {
    LANGUAGE: "Linguagens",
    FRAMEWORK: "Frameworks",
    DATABASE: "Bancos de dados",
    CLOUD: "Cloud",
    TOOL: "Ferramentas",
    OTHER: "Outros",
  };
  return labels[type] || type;
}

function getGithubUsername(user) {
  const github = user.contacts?.find((contact) => contact.type === "GITHUB");
  if (!github) {
    return null;
  }

  const match = github.contact.match(/github\.com\/([^/?#]+)/i);
  return match ? match[1] : null;
}

function buildContributionsSection(user) {
  const username = getGithubUsername(user);
  if (!username) {
    return "";
  }

  const profileUrl = `https://github.com/${username}`;
  const chartUrl = `https://ghchart.rshah.org/${encodeURIComponent(username)}?color=3dd6c6&shade=1a2230`;

  return `
    <section class="section" id="github">
      <div class="section-header">
        <h2>Contribuições no GitHub</h2>
        <span class="section-note">último ano · <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">@${escapeHtml(username)}</a></span>
      </div>
      <div class="contributions-card">
        <a href="${profileUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ver perfil no GitHub">
          <img
            class="contributions-chart"
            src="${chartUrl}"
            alt="Contribuições no GitHub de ${escapeHtml(user.name)} no último ano"
            loading="lazy"
            width="722"
            height="112"
          />
        </a>
      </div>
    </section>`;
}

function buildHtml(user) {
  const jobs = [...user.jobs].sort(
    (a, b) => parseDate(b.period[0].startDate).getTime() - parseDate(a.period[0].startDate).getTime()
  );
  const skills = summarizeHardSkills(jobs);
  const skillGroups = groupSkillsByType(skills);
  const topSkills = skills.slice(0, 12);

  const contactsHtml = user.contacts
    .map(
      (item) =>
        `<li><span class="contact-icon" aria-hidden="true">${contactIcon(item.type)}</span>${contactLink(item.type, item.contact)}</li>`
    )
    .join("");

  const jobsHtml = jobs
    .map((job) => {
      const projectsHtml = job.projects
        .map(
          (project) => `
          <li class="project">
            <p class="project-desc">${escapeHtml(project.description)}</p>
            <div class="tags">
              ${project.stack.map((tech) => `<span class="tag">${escapeHtml(tech)}</span>`).join("")}
            </div>
          </li>`
        )
        .join("");

      return `
      <article class="job-card">
        <header class="job-header">
          <div>
            <h3 class="company">${escapeHtml(job.company)}</h3>
            <p class="position">${escapeHtml(job.position)}</p>
          </div>
          <div class="job-meta">
            <span class="period">${escapeHtml(formatPeriod(job.period))}</span>
            <span class="city">${escapeHtml(job.city)}</span>
          </div>
        </header>
        <ul class="projects">${projectsHtml}</ul>
      </article>`;
    })
    .join("");

  const educationHtml = (site.education || [])
    .map(
      (edu) => `
      <article class="education-card">
        <h3>${escapeHtml(edu.school)}</h3>
        <p>${escapeHtml(edu.course)}</p>
        <span class="edu-year">${escapeHtml(edu.year)}</span>
      </article>`
    )
    .join("");

  const skillGroupsHtml = Object.entries(skillGroups)
    .map(([type, items]) => {
      const tags = items
        .slice(0, 8)
        .map((skill) => `<span class="tag">${escapeHtml(skill.name)}</span>`)
        .join("");
      return `
      <div class="skill-group">
        <h3>${escapeHtml(skillTypeLabel(type))}</h3>
        <div class="tags">${tags}</div>
      </div>`;
    })
    .join("");

  const topSkillsHtml = topSkills
    .map((skill) => `<span class="tag tag-highlight">${escapeHtml(skill.name)}</span>`)
    .join("");

  const contributionsHtml = buildContributionsSection(user);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Currículo de ${escapeHtml(user.name)} — ${escapeHtml(site.title)}">
  <title>${escapeHtml(user.name)} — Currículo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f14;
      --surface: #121820;
      --surface-2: #1a2230;
      --text: #e8edf4;
      --muted: #9aa7b8;
      --accent: #3dd6c6;
      --accent-2: #5b8def;
      --border: rgba(255, 255, 255, 0.08);
      --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      --radius: 18px;
      --max: 1080px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "DM Sans", system-ui, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(61, 214, 198, 0.12), transparent 28%),
        radial-gradient(circle at top right, rgba(91, 141, 239, 0.12), transparent 24%),
        var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .container {
      width: min(calc(100% - 2rem), var(--max));
      margin: 0 auto;
      padding: 2.5rem 0 4rem;
    }

    .hero {
      display: grid;
      gap: 1.5rem;
      padding: 2rem;
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) + 6px);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
      box-shadow: var(--shadow);
      margin-bottom: 2rem;
    }

    .eyebrow {
      color: var(--accent);
      font-family: "JetBrains Mono", monospace;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1 {
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      line-height: 1.05;
      letter-spacing: -0.03em;
    }

    .subtitle {
      font-size: 1.15rem;
      color: var(--muted);
      max-width: 52ch;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    .summary {
      color: #d4dde8;
      font-size: 1.02rem;
    }

    .contacts {
      list-style: none;
      display: grid;
      gap: 0.75rem;
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .contacts li {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      color: var(--muted);
      word-break: break-word;
    }

    .contact-icon {
      width: 2rem;
      height: 2rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: var(--surface-2);
      color: var(--accent);
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .section {
      margin-top: 2.5rem;
    }

    .section-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    h2 {
      font-size: 1.35rem;
      letter-spacing: -0.02em;
    }

    .section-note {
      color: var(--muted);
      font-size: 0.95rem;
    }

    .top-skills,
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }

    .tag {
      font-family: "JetBrains Mono", monospace;
      font-size: 0.78rem;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.03);
      color: #d7e0ea;
    }

    .tag-highlight {
      border-color: rgba(61, 214, 198, 0.35);
      background: rgba(61, 214, 198, 0.08);
      color: #b7fff6;
    }

    .jobs {
      display: grid;
      gap: 1rem;
    }

    .job-card,
    .education-card,
    .skill-group {
      padding: 1.25rem 1.35rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .company {
      font-size: 1.1rem;
      margin-bottom: 0.2rem;
    }

    .position {
      color: var(--accent-2);
      font-weight: 500;
    }

    .job-meta {
      text-align: right;
      color: var(--muted);
      font-size: 0.92rem;
      display: grid;
      gap: 0.2rem;
      min-width: 11rem;
    }

    .projects {
      list-style: none;
      display: grid;
      gap: 0.9rem;
    }

    .project-desc {
      margin-bottom: 0.55rem;
      color: #d7dee8;
    }

    .skills-grid,
    .education-grid {
      display: grid;
      gap: 1rem;
    }

    .skills-grid {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .education-grid {
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .skill-group h3,
    .education-card h3 {
      font-size: 0.95rem;
      margin-bottom: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }

    .education-card p {
      margin-bottom: 0.4rem;
    }

    .edu-year {
      color: var(--muted);
      font-size: 0.92rem;
    }

    .contributions-card {
      padding: 1.25rem;
      border-radius: var(--radius);
      background: var(--surface);
      border: 1px solid var(--border);
      overflow-x: auto;
    }

    .contributions-card a {
      display: block;
      width: fit-content;
      margin: 0 auto;
    }

    .contributions-chart {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }

    @media (max-width: 800px) {
      .hero-grid,
      .job-header {
        grid-template-columns: 1fr;
        display: grid;
      }

      .job-meta {
        text-align: left;
      }
    }

    @media print {
      body { background: white; color: #111; }
      .hero, .job-card, .education-card, .skill-group, .contacts, .contributions-card {
        box-shadow: none;
        background: white;
        border-color: #ddd;
      }
      a { color: #111; text-decoration: none; }
      .tag, .tag-highlight { border-color: #ccc; color: #333; background: #f7f7f7; }
    }
  </style>
</head>
<body>
  <main class="container">
    <section class="hero">
      <div class="eyebrow">Currículo online</div>
      <h1>${escapeHtml(user.name)}</h1>
      <p class="subtitle">${escapeHtml(site.title)} · ${escapeHtml(site.location)}</p>

      <div class="hero-grid">
        <p class="summary">${escapeHtml(site.summary)}</p>
        <ul class="contacts">
          ${contactsHtml}
        </ul>
      </div>

      <div class="top-skills" aria-label="Principais tecnologias">
        ${topSkillsHtml}
      </div>
    </section>

    <section class="section" id="experiencia">
      <div class="section-header">
        <h2>Experiência profissional</h2>
        <span class="section-note">${jobs.length} empresas</span>
      </div>
      <div class="jobs">${jobsHtml}</div>
    </section>

    <section class="section" id="skills">
      <div class="section-header">
        <h2>Stack técnica</h2>
        <span class="section-note">por tempo de experiência</span>
      </div>
      <div class="skills-grid">${skillGroupsHtml}</div>
    </section>

    ${contributionsHtml}

    <section class="section" id="formacao">
      <div class="section-header">
        <h2>Formação acadêmica</h2>
      </div>
      <div class="education-grid">${educationHtml}</div>
    </section>
  </main>
</body>
</html>`;
}

function copyPhotoIfExists() {
  const imagesDir = path.join(ROOT, "data/images");
  const photoPng = path.join(imagesDir, "photo.png");
  const photoJpg = path.join(imagesDir, "photo.jpg");
  const outImages = path.join(OUT_DIR, "images");

  if (!fs.existsSync(outImages)) {
    fs.mkdirSync(outImages, { recursive: true });
  }

  if (fs.existsSync(photoPng)) {
    fs.copyFileSync(photoPng, path.join(outImages, "photo.png"));
  } else if (fs.existsSync(photoJpg)) {
    fs.copyFileSync(photoJpg, path.join(outImages, "photo.jpg"));
  }
}

function main() {
  const user = database[0];
  if (!user) {
    throw new Error("Nenhum usuário encontrado em data/database.json");
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const html = buildHtml(user);
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html, "utf8");
  copyPhotoIfExists();

  console.log("Site estático gerado em docs/index.html");
}

main();
