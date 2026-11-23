// The three cards the scroll story swaps between. Each one is a real product
// surface: a measured KPI card, the SQL view of an answer, and a dashboard
// tile. They are drawn with the same primitives as the hero.

import { useEffect, useState } from "react";
import { BarChart, DAILY, Leaderboard, LineChart, MiniTable, SqlPanel, fmtCompact } from "./charts";
import { Parrot } from "./Parrot";

const RANGES = {
  "7d": { answered: 1284, median: 3.2, delta: "+18%", spark: [18, 22, 21, 27, 30, 29, 34, 38, 41, 44] },
  "30d": { answered: 5480, median: 3.4, delta: "+12%", spark: [24, 26, 25, 31, 35, 33, 39, 42, 46, 49] },
  "90d": { answered: 16240, median: 3.8, delta: "+31%", spark: [14, 18, 24, 23, 29, 34, 38, 41, 47, 52] },
} as const;

function useCount(target: number, decimals = 0) {
  const [n, setN] = useState(target);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const run = (t: number) => {
      const k = Math.min(1, (t - start) / 700);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(from + (target - from) * eased);
      if (k < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return decimals ? n.toFixed(decimals) : fmtCompact(Math.round(n));
}

export function AnswerCard() {
  const [range, setRange] = useState<keyof typeof RANGES>("7d");
  const data = RANGES[range];
  const answered = useCount(data.answered);
  return (
    <div className="msp-card msp-fcard ss-fcard">
      <div className="msp-fcard-head">
        <b>Answers this {range === "7d" ? "week" : range === "30d" ? "month" : "quarter"}</b>
        <div className="msp-seg" role="radiogroup" aria-label="Range">
          {(Object.keys(RANGES) as (keyof typeof RANGES)[]).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={range === r} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="ss-kpi-grid">
        <div className="ss-metric">
          <span>Questions answered</span>
          <b>{answered}</b>
          <em>{data.delta}</em>
        </div>
        <div className="ss-metric">
          <span>Median answer</span>
          <b>{data.median}s</b>
          <em data-quiet="">from question to chart</em>
        </div>
      </div>
      <div className="ss-fcard-chart">
        <LineChart values={data.spark.map((v) => v * 36)} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10"]} height={88} width={520} highlight={data.spark.length - 1} ariaLabel="Questions answered per week" />
      </div>
      <p className="ss-fcard-note">
        <span>Every answer keeps its chart, its query and the revision it ran against.</span>
      </p>
    </div>
  );
}

const SQL_SHORT = `select account_id,
       sum(seats_added) as expansion
from subscription_events
where kind = 'expansion'
  and occurred_at >= date_trunc('quarter', now())
group by 1
order by 2 desc
limit 5;`;

export function QueryCard() {
  const [view, setView] = useState<"answer" | "sql" | "chart">("answer");
  return (
    <div className="msp-card msp-fcard ss-fcard">
      <div className="ss-ask-box">
        <span className="ss-ask-label">Ask</span>
        <p>Which accounts expanded the most this quarter?</p>
        <span className="ss-ask-meta">Postgres · subscriptions</span>
      </div>
      <div className="msp-chips ss-view-chips" role="radiogroup" aria-label="Answer view">
        {(["answer", "sql", "chart"] as const).map((v) => (
          <button key={v} type="button" role="radio" aria-checked={view === v} onClick={() => setView(v)}>
            {v === "answer" ? "Answer" : v === "sql" ? "SQL" : "Chart"}
          </button>
        ))}
      </div>
      {view === "answer" && (
        <div className="ss-answer-mini">
          <p>
            <b>Acme Co</b> added 48 seats, <b>Northwind</b> added 31, and <b>Lumen</b> added 26. Together
            they account for 71% of expansion this quarter.
          </p>
          <span className="ss-cite">3 rows · 0.8s · checked against billing</span>
        </div>
      )}
      {view === "sql" && <SqlPanel sql={SQL_SHORT} caption="0.8s · read-only" />}
      {view === "chart" && (
        <MiniTable
          columns={["Account", "Seats", "ARR"]}
          rows={[
            ["Acme Co", 48, "$46,200"],
            ["Northwind", 31, "$29,800"],
            ["Lumen", 26, "$24,100"],
            ["Vesta", 12, "$11,400"],
          ]}
          highlight={0}
        />
      )}
      <p className="ss-fcard-note">
        <span>Ask in English. Keep the SQL. Rerun it whenever the numbers move.</span>
      </p>
    </div>
  );
}

const WEEK_A = [42, 46, 44, 51, 49, 58, 61];
const WEEK_B = [38, 41, 39, 46, 48, 52, 54];

export function DashboardCard() {
  const [thisWeek, setThisWeek] = useState(true);
  const values = thisWeek ? WEEK_A : WEEK_B;
  return (
    <div className="msp-card msp-fcard ss-fcard">
      <div className="msp-fcard-head">
        <b>Revenue dashboard</b>
        <button type="button" className="msp-pill-btn" onClick={() => setThisWeek(!thisWeek)} aria-pressed={thisWeek}>
          {thisWeek ? "This week" : "Last week"}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      <div className="ss-kpi-grid ss-kpi-grid--three">
        <div className="ss-metric">
          <span>Revenue</span>
          <b>${fmtCompact(values.reduce((a, b) => a + b, 0) * 1000)}</b>
          <em>{thisWeek ? "+9.2%" : "+4.1%"}</em>
        </div>
        <div className="ss-metric">
          <span>Orders</span>
          <b>{fmtCompact(values.reduce((a, b) => a + b, 0) * 9)}</b>
          <em>{thisWeek ? "+6.8%" : "+2.3%"}</em>
        </div>
        <div className="ss-metric">
          <span>Refunds</span>
          <b>1.9%</b>
          <em data-down="">+0.2 pts</em>
        </div>
      </div>
      <BarChart values={values} labels={DAILY.labels} height={98} highlight={5} ariaLabel="Revenue by weekday" />
      <div className="ss-fcard-split">
        <span>Top channels</span>
        <Leaderboard rows={[{ label: "Email", value: 412 }, { label: "Chat", value: 268 }, { label: "Partner", value: 96 }]} />
      </div>
      <p className="ss-fcard-note">
        <span>Auto-refresh on. Every tile links back to the question that made it.</span>
      </p>
    </div>
  );
}

const SCREENS = {
  smarter: { page: "Revenue", tab: "Explore" },
  voice: { page: "Ask", tab: "AI" },
  overnight: { page: "Company overview", tab: "Dashboard" },
} as const;

export function FeatureVisual({ kind }: { kind: "smarter" | "voice" | "overnight" }) {
  const screen = SCREENS[kind];
  return (
    <div className="ss-fwin">
      <div className="ss-fwin-bar">
        <span className="ss-fwin-brand">
          <Parrot size={14} />
          Northwind Labs
          <em>{screen.page}</em>
        </span>
        <span className="ss-fwin-actions" aria-hidden="true">
          <span>{screen.tab}</span>
          <span className="ss-fwin-deploy">Deploy</span>
        </span>
      </div>
      <div className="ss-fwin-body">
        {kind === "voice" ? <QueryCard /> : kind === "overnight" ? <DashboardCard /> : <AnswerCard />}
      </div>
    </div>
  );
}
