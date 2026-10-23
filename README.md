# Newcastle IRM Enterprise Programme

Online application form and internal selection hub for the Newcastle IRM Youth and Enterprise Development Project. Run by the National Business Initiative (NBI), Economic Inclusion Unit, with Majuba TVET College.

Both tools are single-file HTML pages with no build step and no server.

| Tool | Path | Audience | Deployed |
| --- | --- | --- | --- |
| Application form | `public/index.html` | Applicants (MSMEs) | Yes |
| Selection & Diagnostic Hub | `internal/selection-diagnostic-hub.html` | NBI programme team | No, keep internal |

## How the pieces connect

```
Applicant  ->  Application form  ->  Power Automate flow  ->  SharePoint (.json files)
                    |                       |
                    |                       +-> Email to the programme team (with code)
                    +-> "Email my application" button (fallback)

Programme team  ->  Hub  ->  Applications  ->  Import codes or .json files
```

The form collects eligibility gates, personal and business profile, ownership and market, tax and B-BBEE, a 54-statement enterprising tendency assessment, a 12-statement grit scale, a six-axis readiness diagnostic (adapted from KTH Innovation Readiness Level) and a 24-statement business diagnostic. The hub ranks eligible applicants on a weighted scorecard, tracks the pipeline and cohort balance, and shows each applicant's diagnostic.

## Repository layout

```
public/index.html                         Application form (deployed)
internal/selection-diagnostic-hub.html    Hub (internal only)
docs/power-automate-setup.md              Receive submissions in SharePoint and email
docs/hosting.md                           GitHub Pages, Netlify, Azure, Google Places key
docs/data-format.md                       Payload and short code reference
scripts/inject_config.py                  Injects SUBMIT_URL and PLACES_KEY at build time
tests/smoke.js                            Validators and form-to-hub round trip
.github/workflows/pages.yml               Tests, then deploys public/ to GitHub Pages
netlify.toml                              Netlify publish settings
NOTICE.md                                 KTH attribution and data-protection notes
```

## Configuration

Set near the top of the script in `public/index.html`, or inject them with `scripts/inject_config.py`:

| Setting | Purpose |
| --- | --- |
| `SUBMIT_URL` | Power Automate HTTP URL that receives each application. Empty means the applicant gets a code and a file download. |
| `PLACES_KEY` | Google Places API key for address suggestions. Empty means plain text boxes. |
| `NBI_EMAILS` | Addresses used by the "Email my application to NBI" button. |

## Quick start

```bash
git init -b main
git add .
git commit -m "Initial commit: Newcastle IRM application form and hub"
git remote add origin <your-repository-url>
git push -u origin main
```

Run the tests locally:

```bash
npm install
npm test
```

Open either HTML file directly in a browser to try it. Address suggestions need a hosted domain and a key, so they stay off locally.

## Deploying

See [docs/hosting.md](docs/hosting.md). In short: SharePoint cannot serve the form, so use GitHub Pages (workflow included), Netlify or Azure, and use SharePoint to receive submissions via [docs/power-automate-setup.md](docs/power-automate-setup.md).

## Using the hub

1. Open `internal/selection-diagnostic-hub.html` in a browser (or host it on an internal site).
2. Go to **Applications**, then paste application codes or import the `.json` files from SharePoint.
3. Score applicants on the selection and growth finance scorecards, track stages, and review each diagnostic.

Hub data is saved in the browser it was used in. Use **Show export** under **Criteria & data** to back it up, and keep exports out of git.

## Privacy

Applications contain ID numbers and contact details. Handle them under POPIA, restrict the SharePoint folder, and never commit exports or application files. The `.gitignore` excludes the usual file names, but check before each commit.

## Attribution

The readiness diagnostic is adapted from the KTH Innovation Readiness Level™ (© KTH Innovation, CC BY-NC-SA). See [NOTICE.md](NOTICE.md).

## Licence

No licence has been chosen. Add a `LICENSE` file once NBI decides how the code may be reused. The KTH-derived content carries its own terms (see NOTICE.md).
