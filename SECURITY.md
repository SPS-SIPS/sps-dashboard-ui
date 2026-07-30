# Security Policy

## Supported Versions

The following table indicates which versions of **SIPS Connect Portal** (`abdoulhakim/sips-connect-portal`) are currently supported with security updates:

| Version | Docker Tag / Image | Supported |
| ------- | ------------------ | --------- |
| 1.5.x   | `abdoulhakim/sips-connect-portal:1.5.5`, `latest` | :white_check_mark: |
| 1.4.x   | `abdoulhakim/sips-connect-portal:1.4.x` | :x: |
| 1.0.x - 1.3.x | legacy releases | :x: |
| < 1.0   | pre-release builds | :x: |

Official Docker Hub Repository: [abdoulhakim/sips-connect-portal](https://hub.docker.com/r/abdoulhakim/sips-connect-portal)

---

## Reporting a Vulnerability

Please **do not** report security vulnerabilities or security-related flaws through public GitHub issues or public forums.

Report suspected vulnerabilities privately to the institutional maintainers of **SOMALI PAYMENT SWITCH (SPS) LTD** through approved SPS security-reporting channels.

### How to Report

When submitting a security vulnerability report, please include:
- **Affected Component / Route**: UI page route (e.g., `/setup-config`, `/admin`), API endpoint, or Docker container tag (`abdoulhakim/sips-connect-portal:latest`).
- **Impact Summary**: Detailed description of the potential security risk and business impact.
- **Reproduction Steps**: Clear step-by-step instructions or Proof-of-Concept (PoC).
- **Environment Context**: Browser details, UI profile configuration (`dev`, `test`, `prod`), and container version.
- **Logs & Payloads**: Relevant browser console logs or network payloads with sensitive credentials, tokens, or live transaction data scrubbed.
- **Suggested Fix / Mitigation**: If available.

### What to Expect

- **Acknowledgment**: You will receive an initial acknowledgment of your report within 48 hours.
- **Assessment & Status Updates**: The SPS security team will evaluate the finding and provide progress updates every 5 business days until resolution.
- **Accepted Vulnerabilities**: If accepted, a patch will be prepared, tested, and released as a patch update to `abdoulhakim/sips-connect-portal` (e.g., version incremented on Docker Hub). You will be credited privately or publicly according to your preference.
- **Declined Reports**: If the report is determined to be invalid, out of scope, or working as designed (e.g., standard dev profile features), you will receive a clear explanation.

---

## Sensitive Material & Secrets Management

- **Zero Credentials Policy**: Do not commit any sensitive credentials, API tokens, Keycloak client secrets, private keys, SSL/TLS private keys, production configuration files, participant secrets, or production ISO 20022 transaction data.
- **Local Certificates & Config**: The `certs/` directory and runtime configuration file (`db.json`) are explicitly ignored by `.gitignore`. Do not override ignore rules to force-commit local certificates or sensitive runtime state.
- **Proprietary Vendor Material**: Do not include BPC / SmartVista proprietary code, internal configuration details, or sensitive infrastructure specifications in UI mock data or assets.
- **Credential Rotation Procedure**: If any sensitive material or private key is accidentally committed to this repository:
  1. Immediately rotate or revoke the affected credential/certificate in all applicable environments.
  2. Notify the SPS security team.
  3. Coordinate repository history rewrite and cleanup with repository maintainers.

---

## Front-End & Portal Security Practices

- **Authentication & Authorization**: Ensure UI routes and backend API proxies strictly validate Keycloak authentication tokens and enforce profile-based guards (`dev`, `test`, `prod`).
- **Data Protection in UI**: Ensure sensitive participant data, raw cryptographic keys, and internal trace details are masked or restricted based on user role and system profile.
- **Dependency Auditing**: Regularly run dependency vulnerability checks using `npm audit` and keep packages updated to secure versions.
