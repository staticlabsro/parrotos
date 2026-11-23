import { useState } from "react";
import { ConnectorIcon, CONNECTOR_LABELS, type ConnectorName } from "./product/ConnectorIcons";
import { Parrot } from "./product/Parrot";
import { GITHUB_URL, LICENSE_URL, LOCAL_URL } from "./site";
import "./product/base.css";
import "./product/product.css";
import "./landing.css";

const CONNECTORS: ConnectorName[] = ["snowflake", "postgres", "bigquery", "clickhouse", "duckdb", "s3", "motherduck", "databricks"];

type Agent = {
  label: string;
  title: string;
  text: string;
  link: string;
  kind: "triage" | "resolve" | "routing" | "reporting";
  features: { title: string; text: string }[];
};

const AGENTS: Agent[] = [
  {
    label: "Ask",
    title: "Type the question. Keep the query.",
    text: "Statsparrot finds the models, writes the SQL and runs it read-only. The answer arrives with the statement that produced it, so anyone can check the arithmetic.",
    link: "Ask agent",
    kind: "triage",
    features: [
      {
        title: "One box, every source",
        text: "Ask across warehouse tables and parquet files without choosing the engine first. The planner picks what to scan.",
      },
      {
        title: "The SQL is part of the answer",
        text: "Open it, copy it, rerun it against a fresh range. Nothing is hidden behind a card that only shows a number.",
      },
      {
        title: "Follow-ups keep context",
        text: "Narrow by city, compare a month, then pin the result. The conversation carries the filters forward.",
      },
    ],
  },
  {
    label: "Explore",
    title: "Look before you query.",
    text: "Every dimension ranked by the measure you pick, with the definition shown next to the filter. Two boards cannot silently disagree about what revenue means.",
    link: "Explore",
    kind: "resolve",
    features: [
      {
        title: "Dimensions, ranked",
        text: "Products, countries and channels sort themselves by the measure in play. Drill in without rebuilding the chart.",
      },
      {
        title: "Filters with a definition",
        text: "Each filter states the rule it applies, so a board in a deck matches the board in the app.",
      },
      {
        title: "Shareable state",
        text: "Time grain, comparison and sort live in the URL. Send the view, not a screenshot of it.",
      },
    ],
  },
  {
    label: "Dashboards",
    title: "Boards that keep their receipts.",
    text: "Pin an answer once and the tile keeps its query, its notes and the timestamp of the last refresh. The board updates itself; nobody rebuilds it on Monday.",
    link: "Dashboards",
    kind: "reporting",
    features: [
      {
        title: "Built from answers",
        text: "A tile is a pinned question. Reopen it to see the SQL, the rows scanned and the model revision it ran against.",
      },
      {
        title: "Annotations that travel",
        text: "Mark a fulfilment pause once and it is visible on every tile that reads it, whenever someone opens the board.",
      },
      {
        title: "Refresh on your schedule",
        text: "Daily, hourly or on demand, with the last refresh shown on the board rather than assumed.",
      },
    ],
  },
  {
    label: "Sources",
    title: "Know what is connected.",
    text: "Warehouses, replicas and buckets appear side by side with the role they use and the tables they can see. Read-only by construction.",
    link: "Sources",
    kind: "routing",
    features: [
      {
        title: "Six connectors, one project",
        text: "Snowflake, BigQuery, Postgres, ClickHouse, DuckDB and files in S3 or GCS, configured as files you can review.",
      },
      {
        title: "Read-only sessions",
        text: "Statsparrot connects with the role you give it and runs SELECT queries. There is no write path in the connector.",
      },
      {
        title: "Sync you can watch",
        text: "Last refresh, table count and the connector behind each model, visible before someone asks why a chart is stale.",
      },
    ],
  },
];

const TEAMS = [
  { title: "Finance", text: "Close the month against the same definitions the board reports, without a second copy of the numbers." },
  { title: "Growth", text: "Rank channels, cohorts and plans by the measure that matters this week, then pin the view for the team." },
  { title: "Operations", text: "See a fulfilment pause the day it happens, annotated once and visible on every board that reads it." },
  { title: "Product", text: "Follow activation and churn by segment with the query attached, so a claim can be rechecked later." },
];

const BADGES = [
  { name: "Apache-2.0", note: "Open source" },
  { name: "SELECT only", note: "Read-only roles" },
  { name: "Self-hosted", note: "One binary" },
  { name: "DuckDB", note: "In the binary" },
  { name: "OIDC", note: "Bring your IdP" },
  { name: "No copy-out", note: "Queries run in place" },
];

const QUOTES = [
  {
    text: "Net revenue fell 12.4% because the Oslo warehouse paused fulfilment for two days. Orders recovered on Saturday.",
    meta: "Northwind · Snowflake · 3.1s",
    tag: "Answered",
  },
  {
    text: "Team accounts churn at 8.4%, three times the Growth plan. Most cancellations land in week 14, after the first invoice.",
    meta: "Northwind · Postgres · 1.4s",
    tag: "Explained",
  },
  {
    text: "Margin mix moved 61.2% on the Lark lamp once the freight surcharge was applied to the landed cost instead of the unit price.",
    meta: "Northwind · DuckDB · 0.9s",
    tag: "Traced",
  },
];

const FAQ = [
  { q: "Which sources can I connect?", a: "Snowflake, BigQuery, Postgres, MySQL, ClickHouse, DuckDB, MotherDuck, Databricks, Redshift, Athena, S3 and GCS files. DuckDB ships inside the binary, so a local project works with no warehouse at all." },
  { q: "Does Statsparrot write to my database?", a: "No. Connectors open read-only sessions and run SELECT queries. You can hand it a role that only sees the schemas you choose." },
  { q: "Can I self-host it?", a: "Yes. One binary for macOS arm64 and Linux amd64, or the container and compose file in deploy/hosted. The managed cloud is a separate option in early access." },
  { q: "Do I have to use an AI model?", a: "The agent needs a model endpoint, and you choose it. The SQL editor, explorer and dashboards work without one." },
];

function Arrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9.5M9 4.5L12.5 8 9 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText("curl -fsSL https://get.statsparrot.com | sh");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page">
      <a className="skip" href="#main">Skip to content</a>

      <div className="banner">
        <span className="banner-tag">New</span>
        <span>Meet the Analyze Agent — every answer arrives with its SQL.</span>
        <a href="#agents">Read the note <Arrow /></a>
      </div>

      <header className="nav">
        <div className="nav-inner">
          <a className="brand" href="#top">
            <Parrot size={22} />
            <span>Statsparrot</span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            <a href="#agents">Product</a>
            <a href="#sources">Sources</a>
            <a href="#security">Security</a>
            <a href="#channels">Inside the app</a>
            <a href="#faq">Pricing</a>
          </nav>
          <div className="nav-actions">
            <a className="quiet gh" href={GITHUB_URL} aria-label="Statsparrot on GitHub">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
            </a>
            <a className="pill" href="#start"><span className="pill-get">Get </span>early access <Arrow /></a>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ---------------------------------------------------------- hero */}
        <section className="hero" id="top">
          <div className="wrap">
            <h1>Ask your data. <span className="dim">Answered with the SQL.</span></h1>
            <p className="hero-sub">
              Statsparrot reads your warehouse and your files, writes the query, and answers with a chart you can check.
            </p>
            <div className="hero-actions">
              <a className="pill" href="#start">Get early access <Arrow /></a>
              <div className="install">
                <span className="install-prompt">$</span>
                <code>curl -fsSL https://get.statsparrot.com | sh</code>
                <button
                  className="install-copy"
                  type="button"
                  onClick={copyInstall}
                  aria-label={copied ? "Command copied" : "Copy the install command"}
                  title={copied ? "Copied" : "Copy"}
                >
                  {copied ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="9" y="9" width="11" height="11" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M5.5 15.5V5.8A1.8 1.8 0 0 1 7.3 4h9.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="wrap">
            <div className="stage">
              <div className="stage-window">
                <img className="app-img" src="/shots/app-rich.png" alt="A deployed Statsparrot dashboard" />
              </div>
            </div>
          </div>

          <div className="wrap">
            <ul className="logos">
              {CONNECTORS.slice(0, 6).map((name) => (
                <li key={name}>
                  <ConnectorIcon name={name} size={17} />
                  <span>{CONNECTOR_LABELS[name]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ------------------------------------------------------- agents */}
        <section className="agents" id="agents">
          <div className="wrap">
            <p className="statement">
              <span className="statement-lead">Analytics, rebuilt around the agent.</span> Traditional BI asks you to model first,
              query second, explain third. Statsparrot starts at the question and keeps the evidence attached to every answer, so the
              number and its proof travel together.
            </p>
          </div>

          {AGENTS.map((agent) => (
            <div className="agent" key={agent.label}>
              <div className="wrap agent-grid">
                <aside className="agent-label">
                  <span className="dot" />
                  {agent.label}
                </aside>
                <div className="agent-body">
                  <h2>{agent.title}</h2>
                  <p className="agent-text">{agent.text}</p>
                  <a className="link" href="#channels">{agent.link} <Arrow /></a>

                  <div className="shot">
                    {agent.label === "Ask" ? (
                      <div className="chat">
                        <div className="chat-row">
                          <p className="chat-user">Why did revenue dip on Nov 15?</p>
                        </div>
                        <div className="chat-row chat-row-bot">
                          <span className="chat-avatar"><Parrot size={14} /></span>
                          <div className="chat-body">
                            <p>
                              Net revenue fell 12.4% because the Oslo warehouse paused fulfilment for two days. Orders recovered on
                              Saturday.
                            </p>
                            <span className="chat-meta">3.1s · 1.2M rows · read-only · model rev 6f2c1a</span>
                          </div>
                        </div>
                        <div className="chat-input">Ask a follow-up…</div>
                      </div>
                    ) : (
                      <img
                        className="app-img shot-img"
                        src={
                          agent.label === "Explore"
                            ? "/shots/app-explore2.png"
                            : agent.label === "Dashboards"
                              ? "/shots/app-rich-editor.png"
                              : "/shots/app-metrics.png"
                        }
                        alt={`Statsparrot ${agent.label}`}
                      />
                    )}
                  </div>

                  {agent.features.map((f) => (
                    <div className="feature" key={f.title}>
                      <h4>{f.title}</h4>
                      <p>{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* --------------------------------------------------------- teams */}
        <section className="band" id="security">
          <div className="wrap">
            <h2 className="center">Every team, the same numbers.</h2>
            <p className="band-sub center">
              One project holds the connectors, the metric files and the dashboards. Everyone reads the same definitions, and the
              agent explains what moved instead of forwarding a screenshot.
            </p>
            <div className="team-grid">
              {TEAMS.map((t) => (
                <article key={t.title}>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ channels */}
        <section className="channels" id="channels">
          <div className="wrap">
            <h2 className="center">Start from your own data.</h2>
            <p className="sub center">
              Connect a warehouse, open a demo project, or generate sample data and query it straight away — the same project
              keeps the models, the metrics and the boards.
            </p>
            <div className="panel">
              <img className="app-img panel-img" src="/shots/app-home.png" alt="The Statsparrot new workspace screen" />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- badges */}
        <section className="ready">
          <div className="wrap">
            <h2 className="center">Enterprise-ready by design.</h2>
            <p className="sub center">
              Read-only connections, credentials that stay in your deployment, and a single binary you can audit before it touches a
              warehouse.
            </p>
            <div className="badge-grid">
              {BADGES.map((b) => (
                <div className="badge-card" key={b.name}>
                  <strong>{b.name}</strong>
                  <span>{b.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- quotes */}
        <section className="quotes" id="sources">
          <div className="wrap">
            <h2 className="center">Three questions, answered.</h2>
            <p className="sub center">Real answers from the sample project that ships with the install.</p>
            <div className="quote-grid">
              {QUOTES.map((q) => (
                <article key={q.tag}>
                  <span className="quote-tag">{q.tag}</span>
                  <p>{q.text}</p>
                  <span className="quote-meta">{q.meta}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- faq */}
        <section className="faq-section" id="faq">
          <div className="wrap faq-wrap">
            <h2>Questions, answered.</h2>
            <div className="faq">
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}<span className="plus" aria-hidden="true" /></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- start */}
        <section className="start" id="start">
          <div className="wrap">
            <div className="start-inner">
              <h2>A shorter path to the number.</h2>
              <p>Join the early access list. One email when your workspace is ready, with the install command and a sample project.</p>
              <form className="form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="you@company.com" aria-label="Work email" required />
                <button className="pill pill-inv" type="submit">Join the list <Arrow /></button>
              </form>
              <p className="run">Or run it now: <code>curl -fsSL https://get.statsparrot.com | sh</code></p>
            </div>
          </div>
        </section>
      </main>

      <a className="float" href="#channels">
        <span className="float-dot" />
        Try the demo
        <Arrow />
      </a>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top"><Parrot size={22} /><span>Statsparrot</span></a>
              <p>Open-source analytics for your warehouse and your files.</p>
            </div>
            <div><h4>Product</h4><a href="#agents">Agents</a><a href="#channels">Inside the app</a><a href="#sources">Sources</a><a href="#security">Security</a></div>
            <div><h4>Open source</h4><a href={GITHUB_URL}>GitHub</a><a href="/docs/">Docs</a><a href={LOCAL_URL}>Install guide</a><a href={LICENSE_URL}>License</a></div>
            <div><h4>Deploy</h4><a href="#start">Self-hosted</a><a href="#start">Cloud waitlist</a><a href="#faq">FAQ</a></div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Statsparrot. Apache-2.0.</span>
            <span className="status"><i /> All systems normal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
