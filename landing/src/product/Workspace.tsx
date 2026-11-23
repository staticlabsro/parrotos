// The hero's workspace. It is the product UI, built from the same pieces the
// app uses: a question list, an answer pane with the chart and the generated
// SQL. It runs a small loop, like the template's inbox, so the page shows the
// product working instead of a static screenshot.

import { useEffect, useRef, useState } from "react";
import { Parrot } from "./Parrot";
import { BarChart, DAILY, Leaderboard, LineChart, MiniTable, SqlPanel } from "./charts";

type Demo = {
  id: string;
  question: string;
  meta: string;
  source: string;
  answer: string;
  value: string;
  delta: string;
  down?: boolean;
  steps: string[];
  chart: "line" | "bars" | "board" | "table";
  sql: string;
  insight: string;
};

const DEMOS: Demo[] = [
  {
    id: "nordics",
    question: "Why did Nordic revenue dip last week?",
    meta: "Northwind · Snowflake",
    source: "Snowflake",
    answer:
      "Net revenue fell 12.4% because the Oslo warehouse paused fulfilment for two days. Orders recovered on Saturday.",
    value: "$36,800",
    delta: "−12.4% vs prior week",
    down: true,
    steps: ["orders", "1.2M rows", "3.1s"],
    chart: "line",
    sql: `-- Nordic net revenue, last seven days
select date_trunc('day', created_at) as day,
       sum(net_revenue) as net_revenue
from orders
where region = 'Nordics'
  and created_at >= now() - interval '7 days'
group by 1
order by 1;`,
    insight: "Oslo fulfilment paused Tue–Wed. The dip is operational, not demand.",
  },
  {
    id: "churn",
    question: "Which plans churn most after 90 days?",
    meta: "Northwind · Postgres",
    source: "Postgres",
    answer:
      "Team accounts churn at 8.4%, three times the Growth plan. Most cancellations land in week 14, after the first invoice.",
    value: "245 accounts",
    delta: "+1.8 pts vs last quarter",
    down: true,
    steps: ["subscriptions", "48k rows", "1.4s"],
    chart: "board",
    sql: `-- Churned accounts by plan, 90+ days old
select plan,
       count(*) filter (where churned_at is not null) as churned,
       count(*) as total
from subscriptions
where started_at < now() - interval '90 days'
group by plan
order by churned desc;`,
    insight: "Week 14 is the leak: team seats get reviewed at the first invoice.",
  },
  {
    id: "margin",
    question: "Top products by margin this quarter.",
    meta: "Northwind · BigQuery",
    source: "BigQuery",
    answer:
      "The Lark lamp carries the quarter at 61% margin. Bundles pull the average down, so the mix matters more than volume.",
    value: "61.2%",
    delta: "+4.6 pts vs last quarter",
    steps: ["line_items", "860k rows", "2.2s"],
    chart: "table",
    sql: `-- Gross margin by product, current quarter
select product_name,
       sum(revenue - cost) / sum(revenue) as margin
from line_items
where ordered_at >= date_trunc('quarter', current_date)
group by 1
order by margin desc
limit 4;`,
    insight: "Two bundles account for 18% of revenue and 6% of margin.",
  },
];

const CHANNELS = {
  labels: ["Email", "Chat", "Phone", "Partner"],
  values: [412, 268, 96, 51],
};

const PLANS = [
  { label: "Team", value: 128, delta: "8.4%" },
  { label: "Growth", value: 74, delta: "2.7%" },
  { label: "Scale", value: 31, delta: "1.9%" },
  { label: "Enterprise", value: 12, delta: "0.4%" },
];

const MARGINS = [
  ["Lark lamp", "$248,100", "61.2%"],
  ["Field chair", "$196,400", "54.8%"],
  ["Linen set", "$142,900", "48.1%"],
  ["Gift bundle", "$121,300", "22.6%"],
];

function DemoChart({ demo }: { demo: Demo }) {
  if (demo.chart === "bars") {
    return <BarChart values={CHANNELS.values} labels={CHANNELS.labels} height={104} highlight={0} ariaLabel="Orders by channel" />;
  }
  if (demo.chart === "board") {
    return <Leaderboard rows={PLANS} unit="" />;
  }
  if (demo.chart === "table") {
    return <MiniTable columns={["Product", "Revenue", "Margin"]} rows={MARGINS} highlight={0} />;
  }
  return (
    <LineChart
      values={DAILY.revenue}
      labels={DAILY.labels}
      compare={DAILY.compare}
      highlight={3}
      height={96}
      ariaLabel="Daily net revenue, last seven days, with the prior week in grey"
    />
  );
}

export function DataWorkspace({
  live,
  narrow,
  workspace = "Northwind Labs",
  agent = "Maya",
}: {
  live: boolean;
  narrow?: boolean;
  workspace?: string;
  agent?: string;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"question" | "running" | "answer">("answer");
  const [typed, setTyped] = useState("");
  const [sql, setSql] = useState(false);
  const [auto, setAuto] = useState(true);
  const demoTimer = useRef(0);
  const demo = DEMOS[index];
  const reduced = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  // One question at a time: type it, run the query, then show the answer.
  useEffect(() => {
    window.clearTimeout(demoTimer.current);
    setSql(false);
    if (reduced) {
      setPhase("answer");
      setTyped(demo.question);
      return;
    }
    setPhase("question");
    setTyped("");
    let i = 0;
    const type = window.setInterval(() => {
      i += 2;
      setTyped(demo.question.slice(0, i));
      if (i >= demo.question.length) {
        window.clearInterval(type);
        setPhase("running");
        demoTimer.current = window.setTimeout(() => setPhase("answer"), 900);
      }
    }, 26);
    return () => {
      window.clearInterval(type);
      window.clearTimeout(demoTimer.current);
    };
  }, [demo, reduced]);

  useEffect(() => {
    if (!live || !auto || reduced) return;
    const id = window.setInterval(() => setIndex((n) => (n + 1) % DEMOS.length), 9200);
    return () => window.clearInterval(id);
  }, [live, auto, reduced]);

  const pick = (i: number) => {
    setIndex(i);
    setAuto(false);
  };

  return (
    <div className="msp-app ss-app" data-narrow={narrow ? "" : undefined}>
      <div className="msp-app-bar ss-topbar">
        <span className="msp-app-ws">
          <Parrot size={18} />
          <em>{workspace}</em>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
        <span className="ss-crumb">
          <span>Orders</span>
          <i>/</i>
          <b>Revenue</b>
        </span>
        <span className="ss-topbar-actions">
          <button type="button" className="ss-demo-live" data-on={auto ? "" : undefined} onClick={() => setAuto((a) => !a)} aria-pressed={auto}>
            <i aria-hidden="true" />
            {auto ? (narrow ? "Live" : "Live demo") : "Paused"}
          </button>
          <span className="ss-btn ss-btn--ghost">AI</span>
          <span className="ss-btn ss-btn--solid">Deploy</span>
          <span className="ss-avatar-chip" title={agent + " · analyst"}>
            {agent.slice(0, 1)}
          </span>
        </span>
      </div>
      <div className="msp-app-body" data-narrow={narrow ? "" : undefined}>
        <aside className="msp-app-side ss-side" aria-label="Project files">
          <p className="msp-app-label">{workspace}</p>
          <span className="msp-side-row ss-file">
            <svg className="ss-side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 3h7l5 5v13H6z" />
              <path d="M13 3v5h5" />
            </svg>
            orders_metrics.yaml
          </span>
          <span className="msp-side-row ss-file">
            <svg className="ss-side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 3h7l5 5v13H6z" />
              <path d="M13 3v5h5" />
            </svg>
            orders.yaml
          </span>
          <span className="msp-side-row ss-file">
            <svg className="ss-side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M6 3h7l5 5v13H6z" />
              <path d="M13 3v5h5" />
            </svg>
            statsparrot.yaml
          </span>
          <p className="msp-app-label">Data explorer</p>
          <span className="msp-side-row ss-source">
            <svg className="ss-side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
              <path d="M5 6.5v11c0 1.6 3.1 2.8 7 2.8s7-1.2 7-2.8v-11" />
            </svg>
            duckdb
            <em className="ss-olap">OLAP</em>
          </span>
          <span className="msp-side-row ss-source">
            <svg className="ss-side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <rect x="4" y="4" width="16" height="6" rx="1.5" />
              <rect x="4" y="14" width="16" height="6" rx="1.5" />
            </svg>
            main_db
          </span>
          <span className="msp-side-row ss-source" data-indent="">
            <svg className="ss-side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M3 7h6l2 2h10v10H3z" />
            </svg>
            main
          </span>
          <span className="ss-side-foot">
            <i aria-hidden="true" /> version 0.21.5
          </span>
        </aside>
        <section className="msp-app-convo ss-convo" data-sql={sql ? "" : undefined} aria-label="Answer" aria-live="polite">
          <div className="msp-convo-head">
            <div>
              <b>{phase === "question" ? (typed || " ") : demo.question}</b>
              <span>
                {demo.meta}
                {phase === "question" && <i className="ss-caret" aria-hidden="true" />}
              </span>
            </div>
            <span className="ss-readonly">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Read-only
            </span>
          </div>

          <div className="msp-bubble msp-bubble-out ss-prompt">
            <span className="ss-avatar">
              <Parrot size={16} />
            </span>
            <div>
              <span className="msp-bubble-who">
                Statsparrot
                <em>answered in 3.1s · read-only</em>
              </span>
            </div>
          </div>

          {phase === "running" ? (
            <div className="ss-thinking" role="status">
              <span className="ss-thinking-head">
                <Parrot size={15} /> Writing the query
              </span>
              <div className="ss-thinking-row">
                <i /> reading schema
              </div>
              <div className="ss-thinking-row" data-delay="">
                <i /> joining orders
              </div>
            </div>
          ) : (
            <div className="ss-answer" data-on={phase === "answer" ? "" : undefined}>
              <p className="ss-answer-text">{demo.answer}</p>
              <div className="ss-chart-card">
                <div className="ss-chart-head">
                  <div>
                    <span>{demo.chart === "board" ? "Churned accounts by plan" : demo.chart === "table" ? "Gross margin by product" : demo.chart === "bars" ? "Orders by channel" : "Net revenue · last 7 days"}</span>
                    <b>{demo.value}</b>
                    <em data-down={demo.down ? "" : undefined}>{demo.delta}</em>
                  </div>
                  <div className="ss-range" aria-hidden="true">
                    <span data-on="">7d</span>
                    <span>30d</span>
                    <span>90d</span>
                  </div>
                </div>
                <DemoChart demo={demo} />
                <div className="ss-chart-foot">
                  {demo.steps.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                  <button type="button" className="ss-sql-toggle" aria-expanded={sql} onClick={() => setSql(!sql)}>
                    {sql ? "Hide SQL" : "Show SQL"}
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </div>
              {sql && <SqlPanel sql={demo.sql} caption="1.2s · read-only" />}
              <p className="ss-insight">
                <span aria-hidden="true">✦</span>
                {demo.insight}
              </p>
              <p className="ss-answer-foot">
                <span>model rev 6f2c1a</span>
                <span>{demo.steps[1]} scanned</span>
                <span>{demo.steps[2]}</span>
                <em>SELECT only</em>
              </p>
            </div>
          )}

          <div className="ss-suggest">
            <span>Try</span>
            <button type="button" onClick={() => pick(1)}>
              churn by plan
            </button>
            <button type="button" onClick={() => setIndex(2)}>
              margin this quarter
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
