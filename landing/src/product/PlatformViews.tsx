// The four windows in the platform tour: asking, exploring a dimension,
// checking what is connected, and the dashboard board. Same primitives as the
// hero, at the size the tour window gives them.

import { BarChart, DAILY, Leaderboard, LineChart, MiniTable, SqlPanel, fmtCompact } from "./charts";
import { Parrot } from "./Parrot";
import { ConnectorIcon, type ConnectorName } from "./ConnectorIcons";

const PRODUCTS = [
  { label: "Lark lamp", value: 248, delta: "+12%" },
  { label: "Field chair", value: 196, delta: "+8%" },
  { label: "Linen set", value: 143, delta: "−3%" },
  { label: "Gift bundle", value: 121, delta: "+21%" },
  { label: "Desk tray", value: 86, delta: "+4%" },
];

const SOURCES: { icon: ConnectorName; name: string; kind: string; tables: string; sync: string; tone: string }[] = [
  { icon: "snowflake", name: "Snowflake", kind: "Warehouse · ACCOUNT_USAGE", tables: "42 models", sync: "2 min ago", tone: "done" },
  { icon: "postgres", name: "Postgres", kind: "Production replica · read-only", tables: "18 models", sync: "4 min ago", tone: "done" },
  { icon: "bigquery", name: "BigQuery", kind: "Marketing dataset", tables: "11 models", sync: "6 min ago", tone: "done" },
  { icon: "clickhouse", name: "ClickHouse", kind: "Events cluster", tables: "7 models", sync: "syncing", tone: "live" },
  { icon: "s3", name: "S3 · parquet", kind: "Exports bucket", tables: "24 files", sync: "1 hour ago", tone: "done" },
  { icon: "duckdb", name: "DuckDB", kind: "Local project file", tables: "3 models", sync: "just now", tone: "done" },
];

export function PlatformView({ kind }: { kind: "triage" | "resolve" | "routing" | "reporting" }) {
  if (kind === "resolve") {
    return (
      <div className="msp-pv ss-pv ss-explore">
        <div className="ss-explore-head">
          <div>
            <span className="ss-eyebrow-line">Explore</span>
            <b>Revenue by product</b>
          </div>
          <div className="ss-filter-row">
            <span className="ss-filter">Country · Sweden</span>
            <span className="ss-filter">Segment · Team</span>
            <span className="ss-filter ss-filter--ghost">+ filter</span>
          </div>
        </div>
        <div className="ss-explore-metrics">
          <div>
            <span>Revenue</span>
            <b>$186.4k</b>
            <em>+14.2%</em>
          </div>
          <div>
            <span>Orders</span>
            <b>1,842</b>
            <em>+6.8%</em>
          </div>
          <div>
            <span>AOV</span>
            <b>$101.20</b>
            <em>+2.1%</em>
          </div>
        </div>
        <div className="ss-explore-body">
          <div className="ss-panel">
            <p className="ss-panel-title">
              Products <span>by net revenue</span>
            </p>
            <Leaderboard rows={PRODUCTS} max={248} />
          </div>
          <div className="ss-panel">
            <p className="ss-panel-title">
              Revenue <span>last 7 days</span>
            </p>
            <LineChart values={DAILY.revenue} labels={DAILY.labels} height={118} highlight={4} ariaLabel="Revenue by day" />
          </div>
        </div>
        <div className="ss-explore-foot">
          <span>Metric definition</span>
          <code>sum(net_revenue) · orders · status = paid</code>
          <em>edited 3 days ago</em>
        </div>
      </div>
    );
  }

  if (kind === "routing") {
    return (
      <div className="msp-pv ss-pv ss-sources">
        <div className="ss-sources-head">
          <div>
            <span className="ss-eyebrow-line">Sources</span>
            <b>6 connected · all read-only</b>
          </div>
          <span className="ss-add-source">+ Add source</span>
        </div>
        <div className="ss-source-table">
          <div className="ss-source-row ss-source-head">
            <span>Source</span>
            <span>Models</span>
            <span>Last sync</span>
            <span />
          </div>
          {SOURCES.map((s) => (
            <div className="ss-source-row" key={s.name}>
              <span className="ss-source-main">
                <i className="ss-source-mark">
                  <ConnectorIcon name={s.icon} size={17} />
                </i>
                <span>
                  <b>{s.name}</b>
                  <em>{s.kind}</em>
                </span>
              </span>
              <span className="ss-source-models">{s.tables}</span>
              <span className="ss-source-sync">
                <i data-tone={s.tone} />
                {s.sync}
              </span>
              <span className="ss-source-more" aria-hidden="true">
                ···
              </span>
            </div>
          ))}
        </div>
        <div className="ss-source-foot">
          <span>
            <Parrot size={14} /> Credentials stay in your deployment. Statsparrot never writes to these databases.
          </span>
        </div>
      </div>
    );
  }

  if (kind === "reporting") {
    return (
      <div className="msp-pv ss-pv ss-board">
        <div className="ss-board-head">
          <div>
            <span className="ss-eyebrow-line">Dashboards</span>
            <b>Company overview</b>
          </div>
          <div className="ss-board-actions">
            <span className="ss-filter ss-filter--ghost">Last 30 days</span>
            <span className="ss-shared">Shared · 6</span>
          </div>
        </div>
        <div className="ss-board-grid">
          <div className="ss-panel ss-tile-wide">
            <p className="ss-panel-title">
              Net revenue <span>vs prior period</span>
            </p>
            <div className="ss-tile-value">
              <b>$412,900</b>
              <em>+18.4%</em>
            </div>
            <LineChart values={DAILY.revenue} labels={DAILY.labels} compare={DAILY.compare} height={92} highlight={6} ariaLabel="Net revenue versus the prior period" />
          </div>
          <div className="ss-panel">
            <p className="ss-panel-title">
              Orders <span>by channel</span>
            </p>
            <BarChart values={[412, 268, 96, 51]} labels={["Email", "Chat", "Phone", "Partner"]} height={104} highlight={0} ariaLabel="Orders by channel" />
          </div>
          <div className="ss-panel">
            <p className="ss-panel-title">
              Margin <span>this quarter</span>
            </p>
            <MiniTable
              columns={["Product", "Margin"]}
              rows={[
                ["Lark lamp", "61.2%"],
                ["Field chair", "54.8%"],
                ["Linen set", "48.1%"],
              ]}
              highlight={0}
            />
          </div>
          <div className="ss-panel ss-tile-annotation">
            <p className="ss-panel-title">
              Annotations <span>auto-added</span>
            </p>
            <div className="ss-annot">
              <i />
              <span>
                <b>Oslo pause</b>
                Fulfilment stopped Tue–Wed. Revenue recovered by Saturday.
              </span>
            </div>
            <div className="ss-annot" data-tone="muted">
              <i />
              <span>
                <b>Price test ended</b>
                Field chair back to list price on the 14th.
              </span>
            </div>
          </div>
          <div className="ss-panel ss-tile-kpis">
            <p className="ss-panel-title">
              Today <span>live</span>
            </p>
            <div className="ss-live-kpis">
              <div>
                <span>Questions</span>
                <b>48</b>
              </div>
              <div>
                <span>Median</span>
                <b>2.9s</b>
              </div>
              <div>
                <span>Rows</span>
                <b>{fmtCompact(1_240_000)}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="msp-pv ss-pv ss-ask">
      <div className="ss-ask-head">
        <span className="ss-ask-label">Ask</span>
        <div className="ss-ask-chips">
          <span>Snowflake</span>
          <span>Revenue model</span>
          <span>Last 7 days</span>
        </div>
      </div>
      <div className="msp-bubble msp-bubble-in ss-platform-q">
        <span className="ss-avatar ss-avatar--user">M</span>
        <p>Why did Nordic revenue dip last week?</p>
      </div>
      <div className="ss-platform-answer">
        <div className="ss-platform-who">
          <Parrot size={16} />
          <b>Statsparrot</b>
          <em>3.1s · 4 steps · 1.2M rows</em>
        </div>
        <p>
          Net revenue fell <b>12.4%</b> because the Oslo warehouse paused fulfilment for two days. Orders
          recovered on Saturday, and the missing volume is visible in the daily series.
        </p>
        <div className="ss-panel ss-ask-chart">
          <div className="ss-tile-value">
            <span>Net revenue</span>
            <b>$36,800</b>
            <em data-down="">−12.4%</em>
          </div>
          <LineChart values={DAILY.revenue} labels={DAILY.labels} compare={DAILY.compare} highlight={3} height={104} ariaLabel="Nordic revenue with the prior week in grey" />
        </div>
        <div className="ss-ask-sql">
          <SqlPanel
            sql={`select date_trunc('day', created_at) as day,
       sum(net_revenue) as net_revenue
from orders
where region = 'Nordics'
group by 1
order by 1;`}
            caption="1.2s · read-only"
          />
        </div>
      </div>
      <div className="ss-ask-follow">
        <span>Follow up</span>
        <button type="button">Compare to last month</button>
        <button type="button">Break down by city</button>
        <button type="button">Pin to dashboard</button>
      </div>
    </div>
  );
}
