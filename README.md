# cg-excise-ams
What this project is
CG Excise AMS (Alcohol Management System) is a demo web app for the Chhattisgarh Home Department. It simulates how liquor inventory moves through the state:

Central warehouse → District depot → Retail shop

It is a frontend-only prototype — no backend. All data lives in the browser via localStorage, so it works as a clickable demo for stakeholders and future development planning.

Core idea
Government excise departments need to track alcohol stock across a geographic hierarchy:

State (central depot)
District (27 Chhattisgarh districts)
Block → Village → Shop (licensed outlets)
The app lets users record stock movements at each level and see the results on a dashboard with charts and a Chhattisgarh map.

Main modules
Module	Purpose
Dashboard
KPIs, issue/distribution trends, interactive district map
Stock
Manage central depot SKUs (whisky, rum, beer, etc.)
State Issue
Send stock from central warehouse to a district
Distribution
Send stock from district depot to shops
Audit
Log of all actions
Settings
Role (admin vs district officer), Excel hierarchy upload
Who it’s for
Admin — sees the full state
District officer — scoped to one district only
Tech highlights
React 19 + TypeScript + Vite
Zustand for state (persisted in browser)
ECharts map of Chhattisgarh + ApexCharts for analytics
Orange/blue government-style UI
Deployed on GitHub Pages: https://prabhuprasad111.github.io/cg-excise-ams/
What it is not
Not a production system (no database, auth, or API)
Not connected to real excise records
A prototype to demonstrate workflows and UI before a full backend is built
