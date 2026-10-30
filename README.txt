NEWCASTLE IRM APPLICATION FORM: upload this whole folder to your web host.
Upload index.html to the root of the site (for example apply.example.org.za).
Works on any static host (Netlify, GitHub Pages, Azure Static Web Apps, a normal web server). It must be served over https.
Before you go live, open index.html in a text editor and set:
  SUBMIT_URL  the Power Automate "When an HTTP request is received" address that receives applications (optional)
  PLACES_KEY  a Google Maps "Places API (New)" key, restricted to your domain (optional)
Without SUBMIT_URL, applicants download a small .json file and email it to the NBI addresses in NBI_EMAILS.
