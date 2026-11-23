// Two honest ways to run Statsparrot: the binary you host, and the managed
// cloud that is still in early access. This replaces the template's per-ticket
// pricing table; the product has no seat pricing to show.

import { useState } from "react";
import { GITHUB_URL, INSTALL_COMMAND, LICENSE_URL, LOCAL_URL } from "../site";

export function Deploy({ onJoin }: { onJoin: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="msp-section ss-deploy-sec" id="deploy" data-sec="deploy" aria-labelledby="ss-deploy-title">
      <div className="msp-wrap ss-deploy-wrap">
        <p className="msp-eyebrow">
          <span className="ss-bud" aria-hidden="true">
            ✳
          </span>
          Run it your way
        </p>
        <h2 className="msp-title msp-rise" id="ss-deploy-title">
          <span className="msp-title-a">Yours to host.</span>{" "}
          <span className="msp-title-b">Yours to inspect.</span>
        </h2>
        <p className="msp-sub msp-rise ss-deploy-sub">
          One binary with DuckDB inside, or a managed workspace. Both run the same app, the same
          metrics files and the same queries.
        </p>
        <div className="ss-deploy">
          <article className="ss-plan msp-rise">
            <div className="ss-plan-head">
              <span className="ss-plan-kicker">Self-hosted</span>
              <p className="ss-plan-price">
                <b>Free</b>
                <span>Apache-2.0</span>
              </p>
              <p className="ss-plan-text">
                Install on your laptop or a Linux box, point it at a warehouse, and keep every byte on
                infrastructure you control.
              </p>
            </div>
            <button type="button" className="ss-install" onClick={copy} aria-label="Copy the install command">
              <code>{INSTALL_COMMAND}</code>
              <span data-copied={copied ? "" : undefined}>{copied ? "Copied" : "Copy"}</span>
            </button>
            <ul className="ss-plan-list">
              <li>macOS arm64 and Linux amd64 binaries</li>
              <li>DuckDB, Postgres, Snowflake, BigQuery, ClickHouse, S3 and more</li>
              <li>Metrics, dashboards and questions stored as files in git</li>
              <li>Bring your own model endpoint for the agent</li>
            </ul>
            <div className="ss-plan-actions">
              <a className="ss-btn ss-btn--solid" href={LOCAL_URL} target="_blank" rel="noreferrer">
                Read the install guide
                <span aria-hidden="true">→</span>
              </a>
              <a className="ss-btn ss-btn--ghost" href={LICENSE_URL} target="_blank" rel="noreferrer">
                License
              </a>
            </div>
          </article>

          <article className="ss-plan ss-plan--cloud msp-rise">
            <div className="ss-plan-art" aria-hidden="true">
              {/* Managed cloud: the warehouse feeds one workspace we run, and the
                  answer comes back as a live tile. Drawn inline so it stays crisp
                  at every width and keeps the page's line-art look. */}
              <svg
                className="ss-cloud-svg"
                viewBox="0 0 560 160"
                preserveAspectRatio="xMidYMid slice"
                focusable="false"
              >
                <defs>
                  <pattern id="ssc-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.18)" />
                  </pattern>
                  <radialGradient id="ssc-fade" cx="48%" cy="42%" r="66%">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="0.6" stopColor="#fff" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0" />
                  </radialGradient>
                  <mask id="ssc-dotmask">
                    <rect width="560" height="160" fill="url(#ssc-fade)" />
                  </mask>
                  <filter id="ssc-glow" x="-70%" y="-70%" width="240%" height="240%">
                    <feGaussianBlur stdDeviation="14" />
                  </filter>
                </defs>

                <rect width="560" height="160" fill="url(#ssc-dots)" mask="url(#ssc-dotmask)" />
                <path d="M-30 158C120 106 440 106 590 158" fill="none" stroke="rgba(255,255,255,0.06)" />
                <path d="M-30 178C120 126 440 126 590 178" fill="none" stroke="rgba(255,255,255,0.04)" />

                <path className="ss-cloud-link" d="M130 78H248" stroke="rgba(255,255,255,0.2)" />
                <path className="ss-cloud-link" d="M304 78H346" stroke="rgba(255,255,255,0.2)" />

                <circle cx="276" cy="78" r="64" fill="none" stroke="rgba(255,255,255,0.08)" />
                <circle
                  cx="276"
                  cy="78"
                  r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeDasharray="2 6"
                />
                <circle cx="310.5" cy="49.2" r="2.2" fill="#4cc2ff" />
                <circle cx="276" cy="78" r="34" fill="#30a9eb" opacity="0.4" filter="url(#ssc-glow)" />

                <g>
                  <rect x="86" y="56" width="44" height="44" rx="12" fill="#1b1e22" stroke="rgba(255,255,255,0.12)" />
                  <g fill="none" stroke="#c3c8cf" strokeWidth="1.5" strokeLinecap="round">
                    <ellipse cx="108" cy="70" rx="9.5" ry="3.6" />
                    <path d="M98.5 70v16c0 2 4.3 3.6 9.5 3.6s9.5-1.6 9.5-3.6V70" />
                    <path d="M98.5 78c0 2 4.3 3.6 9.5 3.6s9.5-1.6 9.5-3.6" />
                  </g>
                </g>

                <g>
                  <rect x="248" y="50" width="56" height="56" rx="15" fill="#0079c2" />
                  <rect
                    x="248.5"
                    y="50.5"
                    width="55"
                    height="55"
                    rx="14.5"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                  />
                  <g transform="translate(259.5 61.5) scale(0.0645)" fill="#F0ECEC">
                    <path d="M217 226L524 100C477.167 112.167 380.2 137.5 367 141.5C259.8 99.5 222.333 180.333 217 226Z" />
                    <path d="M348.5 207L159.5 484.5L173 333.5L21 295.5L348.5 207Z" />
                  </g>
                </g>

                <g>
                  <rect x="346" y="42" width="140" height="72" rx="12" fill="rgba(30,33,37,0.94)" stroke="rgba(255,255,255,0.1)" />
                  <text className="ssc-label" x="360" y="60">Weekly revenue</text>
                  <text className="ssc-value" x="360" y="80">$412.9k</text>
                  <text className="ssc-delta" x="360" y="93">+18.4%</text>
                  <path d="M360 105h112" stroke="rgba(255,255,255,0.07)" />
                  <path
                    d="M360 102C378 95 392 101 410 91S442 83 472 86"
                    fill="none"
                    stroke="#30a9eb"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>
            <div className="ss-plan-head">
              <span className="ss-plan-kicker">
                Cloud <i>Early access</i>
              </span>
              <p className="ss-plan-price">
                <b>Managed</b>
                <span>waitlist open</span>
              </p>
              <p className="ss-plan-text">
                We run the container, Postgres and the scheduler. You get the same workspace, with
                SSO and a private network path to your warehouse.
              </p>
            </div>
            <ul className="ss-plan-list">
              <li>OIDC sign-in and per-project roles</li>
              <li>Scheduled answers and emailed reports</li>
              <li>One container, or run the compose file yourself</li>
              <li>Your warehouse credentials stay encrypted at rest</li>
            </ul>
            <div className="ss-plan-actions">
              <button type="button" className="ss-btn ss-btn--solid" onClick={onJoin}>
                Join the early access list
                <span aria-hidden="true">→</span>
              </button>
              <a className="ss-btn ss-btn--ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">
                Source
              </a>
            </div>
          </article>
        </div>
        <p className="ss-deploy-note">
          No seats, no ticket counters, no card. The source is on GitHub, and the cloud is small on
          purpose while we finish it.
        </p>
      </div>
    </section>
  );
}
