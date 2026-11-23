<!-- BEGIN:coss -->
## coss.com

This project uses [coss.com](https://coss.com) through its SDK (email, SMS, Verify, Sign, Forms,
Scheduling, Hooks, Risk and webhooks, on one key).

- Docs: https://coss.com/llms.txt lists the guides and links each product's API operations, and
  every docs page is Markdown at its URL plus
  `.md` (e.g. https://coss.com/docs/email/sending.md). API reference pages give each operation's
  parameters, request body, responses and errors. Read the page before writing code against it.
- Develop and test with the development key (`coss_test_…`) in `.env` as `COSS_API_KEY`:
  every API works and records what it would do, with events and webhooks, but nothing is
  delivered. A `coss_live_…` key there delivers for real: don't test with it, and never switch
  to one to try something (`npx coss-cli init --force` replaces it with a development key).
- SDK methods return `{ data, error }` and don't throw for API failures: always check `error`
  (and `error.hint`, which names the fix). Webhook handlers verify each request with
  `verifyWebhook`, which throws on a bad signature. `npx coss-cli listen` writes
  `COSS_WEBHOOK_SECRET` into `.env` for that check. `npx coss-cli webhooks add <url>`
  creates an endpoint and writes that same variable (replacing a listen secret, so both sign
  the same way).
- Commands use `COSS_API_KEY` from the environment. `npx coss-cli listen --forward-to
  localhost:3000/<path>` forwards webhook events to a local handler, `npx coss-cli trigger
  <event type>` sends a test event, and `npx coss-cli logs tail` follows the API requests and
  events. Send email tests to `bounce@simulator.amazonses.com` and run `npx coss-cli emails diagnose <id>`;
  each product has a testing page in the docs. `npx coss-cli --help` lists the commands for each
  product (`suppressions`, `subaccounts`, `contacts`, `audiences`, `segments`, `topics`,
  `broadcasts`, `sms`, `verify`, `sign`, `forms`, `scheduling`, `hooks`, `risk`,
  `log-drains`), and `npx coss-cli api` calls any endpoint.
- What happened to something: `npx coss-cli <emails|sms|verify|sign|forms|hooks|scheduling> diagnose`
  gives a verdict, what it means and what to do next. A form's spam is answered like a success, so
  what a submitter saw proves nothing. `npx coss-cli init --product <product>` prints what a
  product still needs, and the MCP server's `get_setup` takes the same `product`.
<!-- END:coss -->
