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
        return `${item.startDate} – ${item.endDate}`;
      }
      return `${item.startDate} – Atual`;
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

function contactDisplay(type, contact) {
  switch (type) {
    case "EMAIL":
      return { href: `mailto:${contact}`, label: contact };
    case "GITHUB": {
      const match = contact.match(/github\.com\/([^/?#]+)/i);
      const label = match ? `github.com/${match[1]}` : contact.replace(/^https?:\/\//, "");
      return { href: contact, label };
    }
    case "X":
      return { href: `https://x.com/${contact.replace("@", "")}`, label: contact };
    case "LINKEDIN": {
      const match = contact.match(/linkedin\.com\/in\/([^/?#]+)/i);
      const label = match ? `linkedin.com/in/${match[1]}` : contact.replace(/^https?:\/\//, "");
      return { href: contact, label };
    }
    case "PHONE":
      return { href: `tel:${contact.replace(/\D/g, "")}`, label: contact };
    default:
      return { href: null, label: contact };
  }
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
    TOOL: "Ferramentas & Infra",
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
  const chartUrl = `https://ghchart.rshah.org/2b4c7e/${encodeURIComponent(username)}`;

  return `
    <section class="section" id="github">
      <h2>Contribuições no GitHub</h2>
      <div class="contributions">
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
        <p class="contrib-note">último ano · <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">@${escapeHtml(username)}</a></p>
      </div>
    </section>`;
}

function buildHtml(user) {
  const jobs = [...user.jobs].sort(
    (a, b) => parseDate(b.period[0].startDate).getTime() - parseDate(a.period[0].startDate).getTime()
  );
  const skills = summarizeHardSkills(jobs);
  const skillGroups = groupSkillsByType(skills);

  const contactParts = [];
  if (site.location) {
    contactParts.push(`<span>${escapeHtml(site.location)}</span>`);
  }
  (user.contacts || []).forEach((item) => {
    const { href, label } = contactDisplay(item.type, item.contact);
    if (href) {
      contactParts.push(
        `<a href="${escapeHtml(href)}"${item.type !== "EMAIL" && item.type !== "PHONE" ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(label)}</a>`
      );
    } else {
      contactParts.push(`<span>${escapeHtml(label)}</span>`);
    }
  });

  const contactsHtml = contactParts.join('<span class="sep" aria-hidden="true">|</span>');

  const jobsHtml = jobs
    .map((job) => {
      const projectsHtml = job.projects
        .map((project) => `<li>${escapeHtml(project.description)}</li>`)
        .join("");

      const stackSet = [...new Set(job.projects.flatMap((p) => p.stack || []))];
      const stackLine =
        stackSet.length > 0
          ? `<p class="job-stack"><strong>Stack:</strong> ${stackSet.map(escapeHtml).join(", ")}</p>`
          : "";

      return `
      <article class="job">
        <header class="job-header">
          <p class="job-title">
            <strong>${escapeHtml(job.position)}</strong>
            <span class="emdash">—</span>
            <span class="company">${escapeHtml(job.company)}</span>
            <span class="meta">${escapeHtml(formatPeriod(job.period))}${job.city ? ` | ${escapeHtml(job.city)}` : ""}</span>
          </p>
        </header>
        <ul class="bullets">${projectsHtml}</ul>
        ${stackLine}
      </article>`;
    })
    .join("");

  const educationHtml = (site.education || [])
    .map(
      (edu) => `
      <p class="edu-item">
        <strong>${escapeHtml(edu.course)}</strong>
        <span class="emdash">—</span>
        <span class="company">${escapeHtml(edu.school)}</span>
        ${edu.year ? `<span class="meta">(${escapeHtml(edu.year)})</span>` : ""}
      </p>`
    )
    .join("");

  const certificationsHtml = (site.certifications || [])
    .map((cert) => {
      if (typeof cert === "string") {
        return `<li>${escapeHtml(cert)}</li>`;
      }
      const issuer = cert.issuer ? ` — ${escapeHtml(cert.issuer)}` : "";
      return `<li><strong>${escapeHtml(cert.name)}</strong>${issuer}</li>`;
    })
    .join("");

  const languagesHtml = (site.languages || [])
    .map((lang) => {
      if (typeof lang === "string") {
        return escapeHtml(lang);
      }
      return `<strong>${escapeHtml(lang.name)}</strong> — ${escapeHtml(lang.level)}`;
    })
    .join('<span class="sep" aria-hidden="true">|</span>');

  const preferredSkillOrder = ["LANGUAGE", "FRAMEWORK", "DATABASE", "CLOUD", "TOOL", "OTHER"];
  const skillGroupEntries = Object.entries(skillGroups).sort((a, b) => {
    const ia = preferredSkillOrder.indexOf(a[0]);
    const ib = preferredSkillOrder.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const skillsHtml = skillGroupEntries
    .map(([type, items]) => {
      const names = items.map((skill) => escapeHtml(skill.name)).join(", ");
      return `<p class="skill-line"><strong>${escapeHtml(skillTypeLabel(type))}:</strong> ${names}</p>`;
    })
    .join("");

  const contributionsHtml = buildContributionsSection(user);

  const certificationsSection = certificationsHtml
    ? `
    <section class="section" id="certificacoes">
      <h2>Certificações</h2>
      <ul class="plain-list">${certificationsHtml}</ul>
    </section>`
    : "";

  const languagesSection = languagesHtml
    ? `
    <section class="section" id="idiomas">
      <h2>Idiomas</h2>
      <p class="languages">${languagesHtml}</p>
    </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Currículo de ${escapeHtml(user.name)} — ${escapeHtml(site.title)}">
  <title>${escapeHtml(user.name)} — Currículo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #ffffff;
      --text: #1a1a1a;
      --accent: #2b4c7e;
      --muted: #555555;
      --line: #2b4c7e;
      --max: 820px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Source Sans 3", "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.45;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: var(--accent);
      text-decoration: none;
    }

    a:hover { text-decoration: underline; }

    .page {
      width: min(calc(100% - 2.5rem), var(--max));
      margin: 0 auto;
      padding: 2.25rem 0 3.5rem;
    }

    .header {
      text-align: center;
      margin-bottom: 1.6rem;
    }

    .header h1 {
      font-size: clamp(1.85rem, 4vw, 2.35rem);
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.01em;
      line-height: 1.15;
      margin-bottom: 0.35rem;
    }

    .header .role {
      color: var(--accent);
      font-size: clamp(1rem, 2.4vw, 1.15rem);
      font-weight: 700;
      margin-bottom: 0.45rem;
    }

    .header .contacts {
      color: var(--muted);
      font-size: 0.92rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 0.35rem 0.55rem;
    }

    .header .contacts a { color: var(--muted); }
    .header .contacts a:hover { color: var(--accent); }

    .sep {
      color: var(--muted);
      opacity: 0.7;
      user-select: none;
    }

    .section {
      margin-top: 1.25rem;
    }

    .section h2 {
      color: var(--accent);
      font-size: 0.95rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding-bottom: 0.28rem;
      border-bottom: 1.5px solid var(--line);
      margin-bottom: 0.7rem;
    }

    .summary {
      text-align: justify;
      color: var(--text);
      font-size: 0.98rem;
    }

    .skill-line {
      margin-bottom: 0.35rem;
      font-size: 0.97rem;
    }

    .skill-line strong {
      color: var(--text);
      font-weight: 700;
    }

    .job {
      margin-bottom: 0.95rem;
    }

    .job-title {
      font-size: 0.98rem;
      margin-bottom: 0.3rem;
      line-height: 1.4;
    }

    .job-title strong {
      font-weight: 700;
      color: var(--text);
    }

    .emdash {
      margin: 0 0.2rem;
      color: var(--text);
    }

    .company {
      color: var(--accent);
      font-weight: 600;
    }

    .meta {
      color: var(--muted);
      font-style: italic;
      font-weight: 400;
      margin-left: 0.35rem;
      white-space: nowrap;
    }

    .bullets {
      list-style: none;
      display: grid;
      gap: 0.22rem;
      padding-left: 0.15rem;
    }

    .bullets li {
      position: relative;
      padding-left: 1rem;
      font-size: 0.95rem;
      text-align: justify;
    }

    .bullets li::before {
      content: "–";
      position: absolute;
      left: 0;
      color: var(--text);
    }

    .job-stack {
      margin-top: 0.35rem;
      font-size: 0.9rem;
      color: var(--muted);
    }

    .job-stack strong {
      color: var(--text);
      font-weight: 700;
    }

    .edu-item {
      margin-bottom: 0.35rem;
      font-size: 0.97rem;
    }

    .plain-list {
      list-style: none;
      display: grid;
      gap: 0.25rem;
    }

    .plain-list li {
      font-size: 0.97rem;
    }

    .languages {
      font-size: 0.97rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem 0.55rem;
      align-items: center;
    }

    .contributions {
      text-align: center;
    }

    .contributions-chart {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0 auto;
    }

    .contrib-note {
      margin-top: 0.45rem;
      color: var(--muted);
      font-size: 0.88rem;
    }

    @media (max-width: 640px) {
      body { font-size: 14.5px; }
      .page { width: min(calc(100% - 1.5rem), var(--max)); padding-top: 1.5rem; }
      .meta { white-space: normal; display: inline; }
      .summary, .bullets li { text-align: left; }
    }

    @media print {
      body { font-size: 11pt; }
      .page { width: 100%; max-width: none; padding: 0; }
      .contributions { display: none; }
      a { color: inherit; text-decoration: none; }
      .header .contacts a { color: var(--muted); }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <h1>${escapeHtml(user.name)}</h1>
      <p class="role">${escapeHtml(site.title)}</p>
      <div class="contacts">${contactsHtml}</div>
    </header>

    <section class="section" id="resumo">
      <h2>Resumo profissional</h2>
      <p class="summary">${escapeHtml(site.summary)}</p>
    </section>

    <section class="section" id="competencias">
      <h2>Competências técnicas</h2>
      ${skillsHtml}
    </section>

    <section class="section" id="experiencia">
      <h2>Experiência profissional</h2>
      ${jobsHtml}
    </section>

    ${
      educationHtml
        ? `<section class="section" id="formacao">
      <h2>Formação</h2>
      ${educationHtml}
    </section>`
        : ""
    }

    ${certificationsSection}
    ${languagesSection}
    ${contributionsHtml}
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
