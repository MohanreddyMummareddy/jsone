# jsone Product Roadmap

**Current Version:** 0.4.1 (Production Ready)  
**Last Updated:** March 24, 2026  
**Status:** Active Development

---

## ⚠️ Current Issues (In Progress)

**GitHub Actions CI/CD Tests Failing**
- Status: 🔴 BLOCKING
- Issue: Test cases in `packages/core/__tests__/` are failing in GitHub Actions pipeline
- Root Cause: Tests need to be reviewed and fixed post-web-viewer completion
- Action Items:
  - [ ] Review failing test cases
  - [ ] Fix test implementations or code
  - [ ] Ensure 100% pass rate in CI/CD
  - [ ] Document test architecture in `docs/TESTING.md`
  - [ ] Set up branch protection rules requiring passing tests

**Web Viewer Production Issues (RESOLVED)**
- ✅ Module import resolution fixed
- ✅ Event handling implemented
- ✅ Home button navigation working
- ✅ Log download system in place
- ✅ Landing page and example buttons working

---

## 📋 Overview

This roadmap outlines the planned initiatives for jsone through 2026-2027. Items are prioritized by impact and effort.

---

## 🚀 Planned Initiatives

### 1. Web Viewer Demo Site (Priority: 🔴 CRITICAL) ✅ COMPLETED

**Timeline:** Q2 2026 (2-4 weeks) - COMPLETED March 24, 2026  
**Effort:** ⭐ Low (2-4 hours)  
**Expected Impact:** ⭐⭐⭐⭐⭐ Highest

**Status:** ✅ DEPLOYED TO PRODUCTION

**Description:**
Deploy a public-facing web application where users can upload JSON files and instantly view them as tables. Zero installation required.

**Completed Deliverables:**
- [x] Deploy viewer/ to Vercel
- [x] Create landing page with feature highlights
- [x] Add drag-and-drop file upload interface + example buttons
- [x] Pre-load 4 sample datasets (users, orders, products, nested)
- [x] "Try Examples" button with pre-loaded data
- [x] Export options (CSV, .jsone format)
- [x] Table, Tree, and search/sort views
- [x] Mobile responsive design
- [x] Comprehensive logging system
- [x] Log download button for debugging
- [x] Home/back navigation

**Implementation Details:**
```
Stack:
- Frontend: Vite 5.4.21 + TypeScript
- Hosting: Vercel (deployed live)
- Domain: jsone.vercel.app (or custom domain)
- CORS: Enabled for local file uploads
- File limit: 10MB+ supported

Key Features Implemented:
✅ Vite alias resolution for TypeScript imports
✅ CustomEvent with fallback direct handler pattern
✅ Event queue system for script execution ordering
✅ Console log capture system (all logs, errors, warnings)
✅ Download logs feature for production debugging
✅ Home button that only shows when data is loaded
✅ Responsive table rendering with search/sort
✅ Multiple view modes (table/tree)
✅ Modal for expanded cell viewing
✅ CSV and .jsone export

Known Issues Fixed:
✅ Module import resolution (@jsone/core alias)
✅ Script loading order (events firing before listeners ready)
✅ Page minimization (home button navigation)
✅ Log capture in production
```

**Metrics Achieved:**
- ✅ Live deployment working
- ✅ Example buttons functional
- ✅ JSON file uploads working
- ✅ Export to CSV working
- ✅ Landing page displaying correctly

**Resources:**
- Deployed: https://jsone.vercel.app/ (check Vercel dashboard for URL)
- Source: https://github.com/MohanreddyMummareddy/jsone/tree/main/viewer
- Build with: npm install && npm run build (in /viewer)

**Technical Details:**
```
Stack:
- Frontend: Vite + React/Vue
- Hosting: Vercel (free tier supports)
- Domain: jsone-viewer.vercel.app (or custom domain)
- CORS: Enable for API integrations
- File limit: 10MB (web upload)

Build Commands:
npm run build:viewer
vercel deploy --prod
```

**Success Metrics:**
- 500+ unique visitors in first month
- 50+ GitHub stars
- 100+ npm downloads weekly

**Resources:**
- Use existing viewer/ code (no rewrite needed)
- Vercel docs: https://vercel.com/docs
- Deploy guide: docs/DEPLOYMENT.md (to create)

---

### 2. GitHub Actions CI/CD Pipeline (Priority: � CRITICAL - BLOCKING)

**Timeline:** Q2 2026 (Immediate - 1-2 weeks)  
**Effort:** ⭐⭐⭐ Medium-High (4-6 hours)  
**Expected Impact:** ⭐⭐⭐⭐⭐ Critical

**Status:** ⚠️ IN PROGRESS - Test failures blocking pipeline

**Current Blockers:**
- Tests in `packages/core/__tests__/` are failing in GitHub Actions
- Pipeline needs to be set up to catch and report failures
- No branch protection rules yet

**Deliverables:**
- [x] Identify failing test cases
- [ ] Fix all test implementations
- [ ] Create `.github/workflows/test.yml`
- [ ] Create `.github/workflows/build.yml`
- [ ] Create `.github/workflows/publish.yml`
- [ ] Set up branch protection (require passing tests before merge)
- [ ] Document debugging process in `docs/TESTING.md`
- [ ] Add pre-commit hooks to catch issues locally

**Next Steps:**
1. **Review test failures** - Run tests locally and in CI to see exact failures
2. **Fix test code or implementation** - Either update tests or fix the code they test
3. **Set up GitHub Actions workflows** - Once tests pass locally, automate in CI
4. **Enable branch protection** - Require all tests to pass before PR merge

**Workflow Details:**

**test.yml (Test on Every PR)**
```yaml
name: Tests
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test
      - run: npm run lint
```

**publish.yml (Tag-triggered Publishing)**
```yaml
name: Publish to npm
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish packages/core --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Success Metrics:**
- 0 failed deployments due to code issues
- 100% test coverage maintained
- Faster PR reviews (automated checks)

**Resources:**
- GitHub Actions docs: https://docs.github.com/en/actions
- Node.js setup: https://github.com/actions/setup-node

---

### 3. Product Promotion (Priority: 🟡 HIGH)

**Timeline:** Q2 2026 (1-2 weeks)  
**Effort:** ⭐⭐ Medium (6-10 hours total)  
**Expected Impact:** ⭐⭐⭐⭐ High

**Description:**
Market jsone to developers through multiple channels to drive adoption.

**Channels & Content:**

**A. Dev.to Article (2 hours)**
- Title: "Converting Any JSON to Tables: Introducing jsone"
- Topics:
  - Problem: "Why viewing JSON tables is painful"
  - Solution: "How jsone works"
  - Features: Universal JSON support, zero dependencies
  - Live demo and code examples
  - Performance benchmarks
- Link: dev.to/@mummareddy_mohanreddy/jsone-intro

**B. Product Hunt Launch (4 hours)**
- Day: Tuesday/Wednesday (optimal)
- Tagline: "Universal JSON table viewer. Support any JSON structure."
- Gallery: Screenshots showing single objects, arrays, nested data
- Engagement: Respond to all comments within 24 hours
- Link: producthunt.com/posts/jsone

**C. Twitter/X Announcement (30 min)**
- Tweet 1: "🎉 jsone is now open source and on npm!"
- Tweet 2: "Try the web viewer: [link]"
- Tweet 3: "See how it handles: single objects, arrays, nested data"
- Retweet strategy: Follow @javascript @nodejs @typescript
- Hashtags: #javascript #typescript #json #opensource

**D. Reddit Posts (1 hour)**
- Subreddits: r/javascript, r/typescript, r/node, r/webdev
- Format: "Show IOffering jsone: Open-source JSON table converter"
- Engagement: Answer all questions authentically

**E. GitHub Discussions (30 min)**
- Create announcement post
- Link to npm package
- Ask for feedback and feature requests

**F. Hacker News (30 min, optional)**
- If posting: "Show HN: jsone - Display any JSON as a table"
- Comment responses: Be authentic, help with questions

**Content Assets to Create:**
- Logo/icon (if not already done)
- GIF demo (file upload → table view)
- Before/after screenshots
- Code snippet examples

**Success Metrics:**
- 500-1000 new GitHub stars
- 50+ npm downloads daily
- 100+ Twitter follows
- Feature on Dev.to trending

**Timeline:**
```
Week 1:
  Mon-Tue: Create article and assets
  Wed: Publish Dev.to article
  Thu: Submit to Product Hunt
  Fri: Schedule Twitter thread

Week 2:
  Mon-Tue: Reddit posts
  Wed: HN submission (if applicable)
  Thu-Fri: Engagement and responses
```

---

### 4. VS Code Extension (Priority: 🟢 MEDIUM)

**Timeline:** Q3 2026 (6-8 weeks)  
**Effort:** ⭐⭐⭐ High (8-12 hours)  
**Expected Impact:** ⭐⭐⭐ Medium-High

**Description:**
Build a VS Code extension allowing developers to view JSON files as tables directly in the editor.

**Deliverables:**
- [ ] Create `packages/vscode-extension/` directory
- [ ] Implement extension manifest (package.json)
- [ ] Create WebView panel integration
- [ ] Add commands:
  - `jsone.viewAsTable` - Open JSON in table view
  - `jsone.exportCSV` - Export to CSV
  - `jsone.exportAsJsone` - Save as .jsone with metadata
- [ ] File associations (.json, .jsone, .jsonl)
- [ ] Settings/configuration support
- [ ] Publish to VS Code Marketplace

**File Structure:**
```
packages/vscode-extension/
├── src/
│   ├── extension.ts (entry point)
│   ├── commands.ts (command handlers)
│   ├── webview.ts (panel management)
│   └── utils.ts (utilities)
├── package.json (manifest)
├── tsconfig.json
└── README.md
```

**Extension Manifest (package.json):**
```json
{
  "name": "jsone",
  "displayName": "jsone - JSON Table Viewer",
  "version": "0.1.0",
  "publisher": "mummareddy_mohanreddy",
  "activationEvents": [
    "onCommand:jsone.viewAsTable"
  ],
  "contributes": {
    "commands": [
      {
        "command": "jsone.viewAsTable",
        "title": "View as Table",
        "when": "resourceExtname == .json || resourceExtname == .jsone"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "jsone.viewAsTable",
          "group": "navigation",
          "when": "resourceExtname == .json"
        }
      ]
    }
  }
}
```

**Development Steps:**
1. Set up extension project structure
2. Build WebView UI (embed existing viewer)
3. Implement command handlers
4. Add file watchers for real-time updates
5. Create settings UI (columns, sorting, etc.)
6. Package and publish to Marketplace

**Success Metrics:**
- 10,000+ installs in first month
- 4.5+ star rating on Marketplace
- 50+ user reviews

**Resources:**
- VS Code Extension API: https://code.visualstudio.com/api
- WebView docs: https://code.visualstudio.com/api/extension-guides/webview
- Publishing guide: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

---

### 5. CLI Wrapper Package (Priority: 🔵 MEDIUM)

**Timeline:** Q3 2026 (6-8 weeks)  
**Effort:** ⭐⭐⭐ High (4-6 hours)  
**Expected Impact:** ⭐⭐⭐ Medium

**Description:**
Build a command-line tool for processing JSON files programmatically and in CI/CD pipelines.

**Deliverables:**
- [ ] Create `packages/cli/` directory
- [ ] Implement CLI commands using commander.js
- [ ] Supported operations:
  - `jsone convert` - Convert JSON to CSV/table
  - `jsone analyze` - Show table statistics
  - `jsone validate` - Validate format
  - `jsone export` - Export with options
- [ ] Publish as npm package: `@mummareddy_mohanreddy/jsone-cli`

**Example Commands:**
```bash
# Convert to CSV
jsone convert data.json --format csv --output table.csv

# Analyze structure
jsone analyze data.json --show-stats --show-schema

# Validate format
jsone validate data.jsone

# Export with options
jsone export data.json --columns id,name,email --format json

# Pipe operations
cat data.json | jsone convert --format csv > output.csv
```

**File Structure:**
```
packages/cli/
├── src/
│   ├── cli.ts (main entry)
│   ├── commands/
│   │   ├── convert.ts
│   │   ├── analyze.ts
│   │   ├── validate.ts
│   │   └── export.ts
│   └── utils.ts
├── package.json (with bin entry)
├── tsconfig.json
└── README.md
```

**Package.json Entry:**
```json
{
  "name": "@mummareddy_mohanreddy/jsone-cli",
  "bin": {
    "jsone": "./dist/cli.js"
  },
  "dependencies": {
    "@mummareddy_mohanreddy/jsone-core": "^0.4.1",
    "commander": "^11.0.0",
    "chalk": "^5.0.0",
    "table": "^6.8.0"
  }
}
```

**Success Metrics:**
- 50+ npm downloads weekly
- Used in 10+ CI/CD pipelines
- 100+ GitHub stars

**Resources:**
- Commander.js docs: https://github.com/tj/commander.js
- Node.js CLI guide: https://nodejs.org/en/knowledge/command-line/how-to-write-cli-applications-in-node-js/

---

## 📅 Release Timeline

```
Q2 2026 (Apr-Jun):
  ├─ Web Viewer Demo Site ✅
  ├─ GitHub Actions CI/CD ✅
  └─ Product Promotion ✅

Q3 2026 (Jul-Sep):
  ├─ VS Code Extension
  └─ CLI Wrapper Package

Q4 2026 (Oct-Dec):
  ├─ v1.0.0 Release
  ├─ Performance optimization
  └─ Community feedback incorporation
```

---

## 💰 Success Metrics (Overall)

| Metric | Target (6 months) |
|--------|------------------|
| npm downloads | 10,000+ weekly |
| GitHub stars | 2,000+ |
| VS Code extension installs | 20,000+ |
| Dev.to article views | 5,000+ |
| Twitter followers | 500+ |
| Community contributions | 10+ PRs |

---

## 🔄 Process for New Initiatives

1. Create feature branch: `git checkout -b feature/initiative-name`
2. Add implementation details to ROADMAP.md
3. Create issue on GitHub for tracking
4. Break into smaller implementation tickets
5. Open PR and get feedback from community
6. Merge after review
7. Track progress in GitHub Projects

---

## 📝 Notes

- Priorities based on impact vs. effort
- Timeline flexible based on community feedback
- Open to contributions from community members
- Will update quarterly based on progress and market feedback

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to help with these initiatives!

**Want to work on an initiative?**
1. Comment on the GitHub issue
2. Discuss approach and timeline
3. Start with a PR for review
4. We'll provide guidance and support

---

**Last Updated:** March 23, 2026  
**Maintained by:** Mohan Reddy Mummareddy  
**License:** MIT
