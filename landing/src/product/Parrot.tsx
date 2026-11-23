// The Parrot badge, copied from web-common/static/favicon.svg so the marketing
// page and the app share one mark.

export function Parrot({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 550 550" fill="none" aria-hidden="true" focusable="false" style={{ maxWidth: "none" }}>
      <rect width="550" height="550" rx="82" fill="#0079C2" />
      <path d="M217 226L524 100C477.167 112.167 380.2 137.5 367 141.5C259.8 99.5 222.333 180.333 217 226Z" fill="#EFEFEF" />
      <path d="M348.5 207L159.5 484.5L173 333.5L21 295.5L348.5 207Z" fill="#F0ECEC" />
    </svg>
  );
}
