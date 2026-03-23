# Security Policy

## Supported Versions

| Version | Status | Support Until |
|---------|--------|---------------|
| 0.4.x   | ✅ Active | Current |
| 0.3.x   | ⚠️ Limited | 2026-06-23 |
| < 0.3   | ❌ Unsupported | N/A |

**Note:** jsone is a data processing library with no network calls or external runtime. Security implications are minimal.

---

## Vulnerability Reporting

### If you discover a security vulnerability:

**DO NOT** open a public GitHub issue.

**Instead:**
1. Email: [Your email or maintainer email]
2. Subject: `[SECURITY] jsone vulnerability report`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Impact assessment
   - Suggested fix (optional)

**Response Time:** We aim to respond within 48 hours.

---

## Security Considerations

### What jsone DOES
- ✅ Parse JSON strings
- ✅ Infer data types
- ✅ Transform data for display
- ✅ Export to CSV

### What jsone DOES NOT do
- ❌ Execute code
- ❌ Make network requests
- ❌ Access the filesystem
- ❌ Connect to databases
- ❌ Handle sensitive credentials

### Data Privacy
- **No data sent anywhere:** jsone is 100% client-side (browser/local)
- **No logging:** No telemetry or usage tracking
- **No storage:** All data is processed in-memory
- **Source is public:** Full code is available for audit

---

## Dependencies

jsone maintains minimal dependencies:

### @jsone/core
- **Dependencies:** 0 (zero external packages)
- **Dev Dependencies:** TypeScript, Vitest (development only)

### Dependency Management
- We regularly update dev dependencies
- We scan for known vulnerabilities using:
  - `npm audit`
  - GitHub's Dependabot
- We keep dependency count minimal to reduce attack surface

---

## Best Practices for Users

1. **Always validate user input** before processing with jsone
2. **Be cautious with untrusted JSON** from unknown sources
3. **Keep jsone updated** to latest version
4. **Review the source code** - it's public and cryptographically transparent
5. **Audit the dist files** before deployment

---

## Security Audit

Last Audit: 2026-03-23  
Status: ✅ No known vulnerabilities  
Audit Tools:
- npm audit: 0 packages with vulnerabilities
- OWASP Top 10: Not applicable (no network/DB operations)
- Dependency scanning: Passed

---

## Responsible Disclosure

We follow the [Responsible Disclosure Policy](https://www.oisf.net/responsible-disclosure-policy/):

1. Report privately
2. We confirm and produce a fix
3. We notify you of the fix
4. We publish the fix
5. We credit you (if desired)

---

## Contact

- **Email:** [maintainer email]
- **GitHub:** https://github.com/MohanreddyMummareddy/jsone
- **Response Guarantee:** 48 hours

