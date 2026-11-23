# clouddeck-restarter
Every 10 minutes, GitHub Actions opens the CloudDeck dashboard and clicks Start when the cloud PC is off.
Secrets (Settings → Secrets and variables → Actions): `DASHBOARD_URL`, `CLOUDDECK_COOKIE` (the `Cookie` header from a signed-in dashboard request).
Optional variable `START_TEXT`: a regex for the start button's label.
