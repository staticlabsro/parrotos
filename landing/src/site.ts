// Links and copy shared across the page. The GitHub anchors are the same ones
// the README uses, so a nav item and a README heading never disagree.

export const GITHUB_URL = "https://github.com/staticlabsro/parrotos";
export const LOCAL_URL = `${GITHUB_URL}#use-it-locally`;
export const HOSTED_URL = `${GITHUB_URL}#launch-it-hosted`;
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE.md`;

export const INSTALL_COMMAND = "curl -fsSL https://get.statsparrot.com | sh";

// The coss.com Forms endpoint the early-access form posts to. It is a public
// endpoint (no key involved), and `allowed_origins` on the form limits which
// sites may post. Override it with VITE_COSS_FORM_ENDPOINT.
export const COSS_FORM_ENDPOINT =
  import.meta.env.VITE_COSS_FORM_ENDPOINT ?? "https://cossforms.com/f/form_01m7e7nz3cefpvycbvebga5rjg";
