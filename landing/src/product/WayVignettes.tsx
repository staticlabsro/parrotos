// The three cards above the fold of the "ways in" section. They show one
// question answered, the sources behind it, and the dashboard it becomes.

import { BarChart, DAILY, LineChart } from "./charts";
import { ConnectorIcon, type ConnectorName } from "./ConnectorIcons";

const SOURCE_ROWS: { icon: ConnectorName; name: string; meta: string; state: string }[] = [
  { icon: "snowflake", name: "Snowflake", meta: "42 models · read-only", state: "Synced" },
  { icon: "postgres", name: "Postgres", meta: "Production replica", state: "Synced" },
  { icon: "bigquery", name: "BigQuery", meta: "Marketing dataset", state: "Synced" },
  { icon: "s3", name: "S3 · parquet", meta: "Exports bucket", state: "Syncing" },
];

export function WayVisual({ kind, play }: { kind: "resolve" | "learn" | "escalate"; play: number }) {
  if (kind === "learn") {
    return (
      <div className="msp-vig ss-vig ss-vig-sources" key={play}>
        <p className="msp-vig-head">
          <b>Sources</b>
          <span>6 connected</span>
        </p>
        {SOURCE_ROWS.map((s) => (
          <div key={s.name} className="msp-src">
            <span className="msp-src-icon ss-source-mark">
              <ConnectorIcon name={s.icon} size={15} />
            </span>
            <span className="msp-src-main">
              <b>{s.name}</b>
              <span>{s.meta}</span>
            </span>
            <span className="msp-chip" data-st={s.state === "Synced" ? "resolved" : "drafting"}>
              {s.state}
            </span>
          </div>
        ))}
        <span className="msp-meter" aria-hidden="true">
          <i style={{ width: "82%" }} />
        </span>
        <p className="ss-vig-foot">Schema refreshed 2 min ago · queries only</p>
      </div>
    );
  }

  if (kind === "escalate") {
    return (
      <div className="msp-vig ss-vig ss-vig-share" key={play}>
        <p className="msp-vig-head">
          <b>Company overview</b>
          <span>Published</span>
        </p>
        <div className="ss-vig-kpis">
          <span>
            <em>Revenue</em>
            <b>$412.9k</b>
          </span>
          <span>
            <em>Orders</em>
            <b>1,842</b>
          </span>
          <span>
            <em>Margin</em>
            <b>48.2%</b>
          </span>
        </div>
        <BarChart values={[38, 41, 39, 46, 48, 52, 54]} labels={["M", "T", "W", "T", "F", "S", "S"]} height={78} highlight={5} ariaLabel="Revenue by weekday" />
        <div className="ss-vig-share-row">
          <span className="ss-vig-avatars" aria-hidden="true">
            <i>M</i>
            <i>J</i>
            <i>R</i>
          </span>
          <span>Shared with 6 people</span>
          <em>from one question</em>
        </div>
      </div>
    );
  }

  return (
    <div className="msp-vig ss-vig ss-vig-ask" key={play}>
      <div className="msp-bubble msp-bubble-in">
        <span className="ss-avatar ss-avatar--user">M</span>
        <p>Why did Nordic revenue dip last week?</p>
      </div>
      <div className="msp-bubble msp-bubble-out">
        <span className="ss-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.5l-1.8-5.7L4.5 11l5.7-1.9L12 3.5Z" />
          </svg>
        </span>
        <div>
          <p>Oslo fulfilment paused Tue–Wed. Revenue recovered by Saturday.</p>
          <div className="ss-vig-chart">
            <LineChart values={DAILY.revenue} labels={DAILY.labels} compare={DAILY.compare} highlight={3} height={58} ariaLabel="Nordic revenue last week" />
          </div>
        </div>
      </div>
      <p className="msp-outcome" data-st="resolved" data-show="">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m5 12.5 4.2 4.2L19 7" />
        </svg>
        Answered in 3.1s · query saved
      </p>
    </div>
  );
}
