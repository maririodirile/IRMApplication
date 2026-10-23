# Hosting the application form

Only the contents of `public/` should be hosted. The hub in `internal/` holds selection criteria and imported applicant data and must not be published.

## Why not SharePoint

SharePoint document libraries force HTML files to download instead of opening them in the browser, so the form cannot be served from there. Use SharePoint to receive submissions (see `power-automate-setup.md`), not to host the page.

## Option 1: GitHub Pages (workflow included)

1. Push this repository to GitHub.
2. In **Settings, Pages**, set **Source** to **GitHub Actions**.
3. Optional: add repository secrets `SUBMIT_URL` and `PLACES_KEY` (Settings, Secrets and variables, Actions).
4. Push to `main`, or run **Deploy application form to GitHub Pages** from the Actions tab.

The workflow runs `npm test`, injects the secrets into `public/index.html`, and publishes only `public/`.

A private repository on a free GitHub plan cannot publish Pages. Use a public repository (which is fine here, because the repository holds no applicant data) or another host.

## Option 2: Netlify

`netlify.toml` sets the publish folder to `public/`. Connect the repository, or drag the `public/` folder onto https://app.netlify.com/drop to test. Set `SUBMIT_URL` and `PLACES_KEY` by running `scripts/inject_config.py` on a copy of `index.html` before uploading.

## Option 3: Azure

Upload `public/index.html` to an Azure Static Web App, or to an Azure Blob Storage account with **static website** enabled. Ask NBI IT if the organisation already has a preferred web host.

## Google Places address suggestions

Address boxes show South African suggestions when `PLACES_KEY` is set:

1. In Google Cloud, enable **Places API (New)** and create an API key.
2. Restrict the key to **HTTP referrers**, using the form's domain.
3. Restrict it to the Places API only, and set a budget alert.

With no key, address boxes are plain text. The suggestions need a real hosted domain; they do not run from a file opened off disk.

## After deploying

- Open the form in a private window and on a phone that is not signed in to anything.
- Submit a test application and confirm the SharePoint file and the email arrive.
- Import the test code in the hub, then delete it from the hub.
