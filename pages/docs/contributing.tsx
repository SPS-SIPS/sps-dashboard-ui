import MarkdownRenderer from "../../component/MarkdownRenderer";

const markdown = `# Contributing to SPS / SIPS Dashboard UI

The **SPS / SIPS Dashboard UI** is owned and maintained by **SOMALI PAYMENT SWITCH (SPS) LTD** as the user interface management portal for the **Somali Instant Payment System (SIPS) Connect** ecosystem.

By contributing to this repository, you agree that your contributions are submitted under the **Apache License 2.0** unless a separate written agreement with SPS LTD explicitly states otherwise.

---

## 1. Core Objectives & Requirements

- **Integration Alignment**: The UI must strictly align with \`sips-connect\` backend specs (ISO 20022 messaging, participant management, health/status metrics, and PKI security management).
- **Security & Secret Protection**:
  - **NEVER** commit real API credentials, Keycloak secrets, TLS private keys, certificates (\`certs/\`), or production environment files (\`.env\`, custom \`db.json\`).
  - Keep sensitive data out of client-side bundles, static mock assets, and screenshots.
- **Profile-Based Feature Visibility**:
  - Maintain and respect environmental profile guards (\`dev\`, \`test\`, \`prod\`) configured via runtime settings (\`db.json\`).
  - Administrative endpoints, raw API testing tools, and debug screens must be properly restricted or hidden in the \`prod\` profile.
- **Code Quality & Testing**:
  - Ensure all changes compile cleanly (\`npm run build\`) and pass linting (\`npm run lint\`).
  - Follow standard Next.js, React, and TypeScript practices.
  - Maintain robust error handling and loading states for async backend API calls.

---

## 2. Development Workflow

1. **Prerequisites**: Node.js v18+, npm, Docker/Docker Compose (optional), OpenSSL (for local HTTPS certificate generation).
2. **Local Environment Setup**:
   \`\`\`bash
   # Install dependencies
   npm install

   # Generate local SSL certificates in certs/ directory
   mkdir -p certs
   openssl genrsa -out certs/tls.key 2048
   openssl req -new -x509 -key certs/tls.key -out certs/tls.crt -days 365 -subj "/CN=127.0.0.1"

   # Start local development server
   npm run dev
   \`\`\`
3. **Runtime Configuration (\`db.json\`)**:
   - Runtime configuration is read from \`db.json\`. Ensure any new configurable properties are safely defaulted and exposed via \`/setup-config\` when appropriate.

---

## 3. High-Risk UI Components & Features

Changes in the following critical areas require senior architecture and security review prior to merging:

- **Authentication & Setup Flow**:
  - Keycloak integration (\`keycloak-js\`, session handlers, token management).
  - Setup screen and initial configuration persistence (\`/setup-config\`, \`db.json\` runtime updates).
  - UI guards (\`forceFormCompletion\`, \`setupConfirmed\`).
- **Security & PKI Management**:
  - Data protection key management pages and certificate display (\`/docs/data-protection-keys\`, \`/docs/pki\`).
  - Raw payload signing or signature verification viewers.
- **Financial & Operational Views**:
  - Transaction logs, message details, and ISO 20022 message inspection (\`/transactions\`, \`/iso-messages\`).
  - Live participant status and configuration screens (\`/participants\`).
- **Production Server & HTTPS Scripts**:
  - Custom HTTPS server (\`server-https.js\`), Docker entrypoints (\`entrypoint-https.sh\`), and \`docker-compose.yml\`.

---

## 4. Submitting Pull Requests

- Provide clear, descriptive pull request titles and detailed commit messages.
- Reference relevant issue numbers or backend (\`sips-connect\`) work items where applicable.
- Confirm all local linting (\`npm run lint\`) and build steps (\`npm run build\`) pass before opening a PR.
`;

export default function Contributing() {
    return <MarkdownRenderer markdown={markdown} />;
}
