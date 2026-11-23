// Chart primitives for the landing page's product visuals.
//
// The markup and colour logic follow the app's own charts:
// web-common/src/components/time-series-chart/Line.svelte paints the series with
// theme-600 and fills under it with a theme-300 -> theme-50 gradient, while the
// leaderboard rows in features/dashboards/leaderboard/ carry a translucent bar
// behind the label. Here the theme tokens are the landing palette's, so the
// product shots sit inside the painted scenes without a second visual language.

import { useId, useMemo, useState } from "react";

function niceExtent(values: number[], pad = 0.12) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || Math.abs(max) || 1;
  return { lo: min - span * pad, hi: max + span * pad };
}

function pointsFor(values: number[], width: number, height: number, padX = 2, padY = 8, extent?: { lo: number; hi: number }) {
  const range = extent ?? niceExtent(values);
  const w = width - padX * 2;
  const h = height - padY * 2;
  return values.map((v, i) => ({
    x: padX + (values.length === 1 ? w / 2 : (i / (values.length - 1)) * w),
    y: padY + h - ((v - range.lo) / (range.hi - range.lo)) * h,
  }));
}

// Catmull-Rom to cubic bezier, the same soft line the app draws through a series.
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export const fmtCompact = (n: number) =>
  Math.abs(n) >= 1_000_000
    ? (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    : Math.abs(n) >= 1000
      ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
      : String(Math.round(n));

export function LineChart({
  values,
  labels,
  height = 132,
  width = 520,
  highlight,
  compare,
  tone = "accent",
  animate = true,
  ariaLabel,
}: {
  values: number[];
  labels: string[];
  height?: number;
  width?: number;
  highlight?: number;
  compare?: number[];
  tone?: "accent" | "warn";
  animate?: boolean;
  ariaLabel: string;
}) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  // Both series share one y-scale and the same x positions, so the comparison
  // line sits under the current one instead of continuing to its right.
  const extent = niceExtent(compare ? [...values, ...compare] : values);
  const pts = pointsFor(values, width, height, 2, 8, extent);
  const prev = compare ? pointsFor(compare, width, height, 2, 8, extent) : null;
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1].x.toFixed(2)} ${height} L${pts[0].x.toFixed(2)} ${height} Z`;
  const active = hover !== null ? hover : (highlight ?? null);
  const shown = active !== null ? pts[active] : null;

  return (
    <div className="ss-chart" data-tone={tone}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`ss-fill-${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="4%" stopColor="var(--ss-area-strong)" />
            <stop offset="94%" stopColor="var(--ss-area-soft)" />
          </linearGradient>
        </defs>
        {[0.02, 0.34, 0.66, 0.98].map((p) => (
          <line key={p} x1="0" x2={width} y1={height * p} y2={height * p} className="ss-grid" />
        ))}
        {prev && <path d={smoothPath(prev)} className="ss-line ss-line--muted" vectorEffect="non-scaling-stroke" />}
        <path d={area} fill={`url(#ss-fill-${gid})`} className={animate ? "ss-area ss-area--draw" : "ss-area"} />
        <path d={line} className={animate ? "ss-line ss-line--draw" : "ss-line"} vectorEffect="non-scaling-stroke" pathLength={1} />
        {shown && (
          <>
            <line x1={shown.x} x2={shown.x} y1="0" y2={height} className="ss-cross" />
            <circle cx={shown.x} cy={shown.y} r="3.4" className="ss-dot" />
          </>
        )}
      </svg>
      <div className="ss-axis" aria-hidden="true">
        {labels.map((l, i) => (
          <span
            key={l + i}
            data-on={i === active ? "" : undefined}
            data-fade={labels.length > 7 && i % 2 === 1 ? "" : undefined}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            {l}
          </span>
        ))}
      </div>
      {hover !== null && shown && (
        <span className="ss-tip" style={{ left: `${(shown.x / width) * 100}%` }}>
          <b>{fmtCompact(values[hover])}</b>
          <em>{labels[hover]}</em>
        </span>
      )}
    </div>
  );
}

export function BarChart({
  values,
  labels,
  height = 120,
  highlight,
  tone = "accent",
  animate = true,
  ariaLabel,
}: {
  values: number[];
  labels: string[];
  height?: number;
  highlight?: number;
  tone?: "accent" | "warn";
  animate?: boolean;
  ariaLabel: string;
}) {
  const max = Math.max(...values);
  const [hover, setHover] = useState<number | null>(null);
  const on = hover ?? highlight ?? -1;
  return (
    <div className="ss-bars" data-tone={tone} style={{ height }}>
      <div className="ss-bars-plot" role="img" aria-label={ariaLabel}>
        {values.map((v, i) => (
          <button
            key={labels[i] + i}
            type="button"
            tabIndex={-1}
            aria-label={`${labels[i]}: ${fmtCompact(v)}`}
            data-on={i === on ? "" : undefined}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className="ss-bar"
          >
            <span
              className={animate ? "ss-bar-fill ss-bar-fill--grow" : "ss-bar-fill"}
              style={{ height: `${Math.max(3, (v / max) * 100)}%`, animationDelay: `${i * 45}ms` }}
            >
              {i === on && <em>{fmtCompact(v)}</em>}
            </span>
          </button>
        ))}
      </div>
      <div className="ss-axis" aria-hidden="true">
        {labels.map((l, i) => (
          <span key={l + i} data-on={i === on ? "" : undefined}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Sparkline({ values, tone = "accent" }: { values: number[]; tone?: "accent" | "warn" }) {
  const width = 120;
  const height = 34;
  const pts = pointsFor(values, width, height, 2, 4);
  const line = smoothPath(pts);
  const gid = useId().replace(/:/g, "");
  return (
    <svg className="ss-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" data-tone={tone} aria-hidden="true">
      <defs>
        <linearGradient id={`ss-spark-${gid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--ss-area-strong)" />
          <stop offset="100%" stopColor="var(--ss-area-soft)" />
        </linearGradient>
      </defs>
      <path d={`${line} L${width - 2} ${height} L2 ${height} Z`} fill={`url(#ss-spark-${gid})`} />
      <path d={line} className="ss-line" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Kpi({
  label,
  value,
  delta,
  down,
  spark,
}: {
  label: string;
  value: string;
  delta: string;
  down?: boolean;
  spark?: number[];
}) {
  return (
    <div className="ss-kpi">
      <span>{label}</span>
      <b>{value}</b>
      <div className="ss-kpi-foot">
        <em data-down={down ? "" : undefined}>{delta}</em>
        {spark && <Sparkline values={spark} tone={down ? "warn" : "accent"} />}
      </div>
    </div>
  );
}

export function Leaderboard({
  rows,
  unit = "",
  max,
}: {
  rows: { label: string; value: number; delta?: string }[];
  unit?: string;
  max?: number;
}) {
  const top = max ?? Math.max(...rows.map((r) => r.value));
  return (
    <div className="ss-lb" role="table" aria-label="Breakdown by dimension">
      {rows.map((r, i) => (
        <div className="ss-lb-row" role="row" key={r.label} style={{ animationDelay: `${i * 40}ms` }}>
          <span className="ss-lb-bar" style={{ width: `${(r.value / top) * 100}%` }} aria-hidden="true" />
          <span className="ss-lb-name" role="cell">
            {r.label}
          </span>
          <span className="ss-lb-value" role="cell">
            {fmtCompact(r.value)}
            {unit}
          </span>
          {r.delta && (
            <span className="ss-lb-delta" role="cell" data-down={r.delta.startsWith("-") ? "" : undefined}>
              {r.delta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const SQL_WORDS =
  /(\b(?:select|from|where|group by|order by|limit|join|left|right|inner|on|as|and|or|not|null|sum|count|avg|min|max|date_trunc|case|when|then|else|end|desc|asc|with|by|interval|over|partition)\b)/gi;

export function SqlPanel({ sql, caption }: { sql: string; caption?: string }) {
  const lines = sql.split("\n");
  return (
    <div className="ss-sql">
      {caption && (
        <div className="ss-sql-head">
          <span>
            <i aria-hidden="true" />
            Generated SQL
          </span>
          <em>{caption}</em>
        </div>
      )}
      <pre>
        <code>
          {lines.map((line, n) => (
            <span className="ss-sql-line" key={n}>
              <i aria-hidden="true">{n + 1}</i>
              <span>
                {line.split(SQL_WORDS).map((part, k) =>
                  k % 2 === 1 ? (
                    <b key={k}>{part}</b>
                  ) : part.match(/^\s*--/) ? (
                    <span key={k} className="ss-sql-comment">
                      {part}
                    </span>
                  ) : (
                    <span key={k}>{part}</span>
                  )
                )}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export function MiniTable({
  columns,
  rows,
  highlight,
}: {
  columns: string[];
  rows: (string | number)[][];
  highlight?: number;
}) {
  return (
    <div className="ss-mini-table" role="table" aria-label="Query result">
      <div className="ss-mini-head" role="row" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))` }}>
        {columns.map((c) => (
          <span key={c} role="columnheader">
            {c}
          </span>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          className="ss-mini-row"
          role="row"
          key={i}
          data-on={i === highlight ? "" : undefined}
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))`, animationDelay: `${i * 50}ms` }}
        >
          {r.map((cell, j) => (
            <span key={j} role="cell" data-num={typeof cell === "number" ? "" : undefined}>
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

// The one dataset every visual shares, so the demo tells a single story.
export const DAILY = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  revenue: [41200, 42800, 39100, 36800, 44900, 47200, 46100],
  orders: [318, 334, 302, 288, 351, 372, 361],
  compare: [39800, 41000, 40500, 42100, 43600, 45200, 44500],
};

export const WEEKS = {
  labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
  revenue: [238, 251, 247, 262, 244, 229, 268, 281],
};

export function useReduced() {
  return useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
}
