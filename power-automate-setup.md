# Power Automate setup: receive applications in SharePoint and email

The application form can POST each completed application to a Power Automate flow. The flow saves the application as a JSON file in SharePoint and emails the programme team.

The "When an HTTP request is received" trigger is a **Premium** connector. Check with NBI IT that your licence includes it. Without it, applicants can still use the **Email my application to NBI** button on the form's final screen.

## Steps

1. Go to https://make.powerautomate.com and sign in with your NBI account.
2. Create an **Instant cloud flow** and choose the trigger **When an HTTP request is received**. Set **Who can trigger the flow** to **Anyone**.
3. Add **Parse JSON**.
   - Content: `json(string(triggerBody()))`
   - Schema:

     ```json
     {
       "type": "object",
       "properties": {
         "i": { "type": "string" },
         "n": { "type": "string" },
         "o": { "type": "string" },
         "em": { "type": "string" },
         "ph": { "type": "string" },
         "code": { "type": "string" }
       }
     }
     ```

4. Add the SharePoint action **Create file**.
   - Site address and folder: for example `Shared Documents/Applications`
   - File name: `IRM-application-@{body('Parse_JSON')?['i']}.json`
   - File content: `string(triggerBody())`
5. Add **Send an email (V2)**.
   - To: `OdirileM@nbi.org.za;HawaaK@nbi.org.za`
   - Subject: `New IRM application: ` followed by the business name (`n`) from Parse JSON
   - Body: owner (`o`), email (`em`), phone (`ph`) and the `code`. The code can be pasted straight into the hub's import box.
6. Save the flow, then copy the **HTTP POST URL** from the trigger.
7. Give the URL to the form as `SUBMIT_URL`:
   - **With GitHub Pages:** add it as a repository secret named `SUBMIT_URL` (Settings, Secrets and variables, Actions). The workflow injects it when it deploys.
   - **Other hosting:** run `SUBMIT_URL='https://...' python3 scripts/inject_config.py public/index.html` before uploading, or paste the URL into `const SUBMIT_URL='';` near the top of the form's script.

## Security notes

- The URL contains a signature and ends up in the published page's source, so anyone who reads the source can submit to the flow. Do not share the source widely, and rotate the URL (re-save the trigger to generate a new one) if it leaks.
- The form sends with `no-cors`, so the applicant's browser cannot read the flow's response. A submission looks successful as long as the request leaves the device. Check the flow's run history when testing.
- Saved JSON files contain personal information. Restrict the SharePoint folder to the programme team.

## Getting applications into the hub

In the hub, open **Applications**. Either paste codes (one per line) into the Import card, or choose **Import files (.json)** and select the files from the SharePoint folder. Applications already imported are skipped.
