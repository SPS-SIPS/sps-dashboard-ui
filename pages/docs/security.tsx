import MarkdownRenderer from "../../component/MarkdownRenderer";

const markdown = `# Security Policy

## Reporting Security Vulnerabilities

Please **do not** report security vulnerabilities or security-related flaws through public GitHub issues.

Report suspected vulnerabilities privately to the institutional maintainers of **SOMALI PAYMENT SWITCH (SPS) LTD** through approved SPS security-reporting channels.

When reporting a vulnerability, please include as much detail as possible:

- **Component / Route**: Affected UI component, page route (e.g., \`/setup-config\`, \`/admin\`), or API route handler.
- **Impact Summary**: Explanation of the security risk and potential impact.
- **Reproduction Steps**: Step-by-step instructions or proof-of-concept (PoC).
- **Environment Context**: Browser details, UI profile configuration (\`dev\`, \`test\`, \`prod\`), and version.
- **Logs & Network Payloads**: Relevant browser console logs or network requests (with any sensitive credentials, tokens, or live transaction data scrubbed out).
- **Suggested Fix / Mitigation**: If available.

---

## Sensitive Material & Secrets Management

- **Zero Credentials Policy**: Do not commit any sensitive credentials, API tokens, Keycloak client secrets, private keys, SSL/TLS private keys, production configuration files, participant secrets, or production ISO 20022 transaction data.
- **Local Certificates & Config**: The \`certs/\` directory and runtime configuration file (\`db.json\`) are explicitly ignored by \`.gitignore\`. Do not override ignore rules to force-commit local certificates or sensitive runtime state.
- **Proprietary Vendor Material**: Do not include BPC / SmartVista proprietary code, internal configuration details, or sensitive infrastructure specifications in UI mock data or assets.
- **Credential Rotation Procedure**: If any sensitive material or private key is accidentally committed to this repository:
  1. Immediately rotate or revoke the affected credential/certificate in all applicable environments.
  2. Notify the SPS security team.
  3. Coordinate repository history rewrite and cleanup with repository maintainers.

---

## Front-End & Portal Security Practices

- **Authentication & Authorization**: Ensure UI routes and backend API proxies strictly validate Keycloak authentication tokens and enforce profile-based guards (\`dev\`, \`test\`, \`prod\`).
- **Data Protection in UI**: Ensure sensitive participant data, raw cryptographic keys, and internal trace details are masked or restricted based on user role and system profile.
- **Dependency Auditing**: Regularly run dependency vulnerability checks using \`npm audit\` and keep packages updated to secure versions.
`;

export default function Security() {
    return <MarkdownRenderer markdown={markdown} />;
}
