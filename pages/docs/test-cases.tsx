import MarkdownRenderer from "../../component/MarkdownRenderer";

const markdown = "# SIPS Connect - Test Cases & Security Test Scenarios\n" +
    "\n" +
    "**Document Version:** 1.1  \n" +
    "**Date:** November 27, 2024  \n" +
    "**Prepared For:** Vendor Testing & Security Review  \n" +
    "**Status:** Production Ready\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Table of Contents\n" +
    "\n" +
    "1. [Overview](#overview)\n" +
    "2. [Scope of Testing](#scope-of-testing)\n" +
    "3. [Supported ISO 20022 Versions](#supported-iso-20022-versions)\n" +
    "4. [Message Flow Diagrams](#message-flow-diagrams)\n" +
    "5. [HTTP Headers & Message Format](#http-headers--message-format)\n" +
    "6. [Error Code Schema](#error-code-schema)\n" +
    "7. [PKI & Signing Architecture](#pki--signing-architecture)\n" +
    "8. [Test Environment Setup](#test-environment-setup)\n" +
    "9. [Functional Test Cases](#functional-test-cases)\n" +
    "10. [Negative Functional Tests](#negative-functional-tests)\n" +
    "11. [Security Test Scenarios](#security-test-scenarios)\n" +
    "12. [Performance Test Scenarios](#performance-test-scenarios)\n" +
    "13. [Test Data Matrix](#test-data-matrix)\n" +
    "14. [Test Automation Scripts](#test-automation-scripts)\n" +
    "15. [Logging & Audit Standards](#logging--audit-standards)\n" +
    "16. [Expected Results & Validation](#expected-results--validation)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Overview\n" +
    "\n" +
    "SIPS Connect is a secure financial messaging platform that translates ISO 20022 messages between SIPS SVIP and local banking systems. This document provides comprehensive test cases including security test scenarios for vendor validation.\n" +
    "\n" +
    "### Key Features Tested\n" +
    "\n" +
    "- **Message Translation:** ISO 20022 to/from JSON API\n" +
    "- **Transaction Signing:** Private key encryption (XAdES-BES)\n" +
    "- **Transaction Verification:** Public key validation via SPS PKI\n" +
    "- **Data Protection:** Encryption at rest and in transit\n" +
    "- **Authentication:** API Key and JWT Bearer token support\n" +
    "- **Data Persistence:** PostgreSQL database with audit trails\n" +
    "- **Idempotency:** Duplicate message handling\n" +
    "- **Store-and-Forward:** Retry mechanisms for failed callbacks\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Scope of Testing\n" +
    "\n" +
    "### In Scope\n" +
    "\n" +
    "The following components and behaviors are covered by this test plan:\n" +
    "\n" +
    "- ✅ **Message Handlers**\n" +
    "  - IncomingTransactionHandler (pacs.008)\n" +
    "  - IncomingVerificationHandler (acmt.023)\n" +
    "  - IncomingTransactionStatusHandler (pacs.002)\n" +
    "  - IncomingPaymentStatusReportHandler (pacs.002)\n" +
    "- ✅ **Gateway APIs**\n" +
    "  - Verify endpoint\n" +
    "  - Payment endpoint\n" +
    "  - Status endpoint\n" +
    "  - Return endpoint\n" +
    "- ✅ **SomQR APIs**\n" +
    "  - Merchant QR generation/parsing\n" +
    "  - Person QR generation/parsing\n" +
    "- ✅ **Security Features**\n" +
    "  - XML signature validation (XAdES-BES)\n" +
    "  - API authentication (API Keys, JWT)\n" +
    "  - Data encryption at rest\n" +
    "  - TLS/SSL configuration\n" +
    "  - Input validation & injection prevention\n" +
    "- ✅ **PKI & Certificate Management**\n" +
    "  - Certificate chain validation\n" +
    "  - Certificate expiry checks\n" +
    "  - Private key encryption\n" +
    "  - Key rotation procedures\n" +
    "- ✅ **Audit & Logging**\n" +
    "  - Transaction audit trails\n" +
    "  - Security event logging\n" +
    "  - Error logging\n" +
    "- ✅ **Database Operations**\n" +
    "  - Transaction persistence\n" +
    "  - Status updates\n" +
    "  - Idempotency checks\n" +
    "\n" +
    "### Out of Scope\n" +
    "\n" +
    "The following are **not** covered by this test plan:\n" +
    "\n" +
    "- ❌ **SIPS SVIP Internal Behavior** - Testing of SVIP system internals\n" +
    "- ❌ **CoreBank Internal Logic** - Bank's internal posting/validation logic\n" +
    "- ❌ **External Bank Systems** - Third-party bank integrations\n" +
    "- ❌ **Network Infrastructure** - Firewall rules, load balancers (except TLS)\n" +
    "- ❌ **Database Administration** - PostgreSQL tuning, backup/restore\n" +
    "- ❌ **Operating System Security** - OS-level hardening\n" +
    "- ❌ **Container Orchestration** - Kubernetes/Docker Swarm specifics\n" +
    "\n" +
    "### Test Boundaries\n" +
    "\n" +
    "```\n" +
    "┌─────────────────────────────────────────────────────────────┐\n" +
    "│                    SIPS SVIP (Out of Scope)                 │\n" +
    "└────────────────────────┬────────────────────────────────────┘\n" +
    "                         │ ISO 20022 XML (Signed)\n" +
    "                         ▼\n" +
    "┌─────────────────────────────────────────────────────────────┐\n" +
    "│                  SIPS Connect (IN SCOPE)                    │\n" +
    "│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │\n" +
    "│  │   Handlers   │  │  Gateway API │  │   Security   │     │\n" +
    "│  │  (ISO 20022) │  │  (JSON API)  │  │  (PKI/Auth)  │     │\n" +
    "│  └──────────────┘  └──────────────┘  └──────────────┘     │\n" +
    "│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │\n" +
    "│  │   Database   │  │    Logging   │  │   SomQR API  │     │\n" +
    "│  └──────────────┘  └──────────────┘  └──────────────┘     │\n" +
    "└────────────────────────┬────────────────────────────────────┘\n" +
    "                         │ JSON API (Authenticated)\n" +
    "                         ▼\n" +
    "┌─────────────────────────────────────────────────────────────┐\n" +
    "│              CoreBank System (Out of Scope)                 │\n" +
    "└─────────────────────────────────────────────────────────────┘\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Supported ISO 20022 Versions\n" +
    "\n" +
    "### Message Types & Versions\n" +
    "\n" +
    "| Message Type | ISO Version     | Description                        | Handler                            |\n" +
    "| ------------ | --------------- | ---------------------------------- | ---------------------------------- |\n" +
    "| **pacs.008** | pacs.008.001.10 | FIToFICustomerCreditTransfer       | IncomingTransactionHandler         |\n" +
    "| **pacs.002** | pacs.002.001.12 | FIToFIPaymentStatusReport          | IncomingPaymentStatusReportHandler |\n" +
    "| **pacs.002** | pacs.002.001.12 | FIToFIPaymentStatusReport (Status) | IncomingTransactionStatusHandler   |\n" +
    "| **acmt.023** | acmt.023.001.02 | IdentificationVerificationRequest  | IncomingVerificationHandler        |\n" +
    "| **acmt.024** | acmt.024.001.02 | IdentificationVerificationReport   | Response from Verification         |\n" +
    "| **pacs.004** | pacs.004.001.11 | PaymentReturn                      | IncomingReturnHandler              |\n" +
    "| **pacs.028** | pacs.028.001.05 | FIToFIPaymentStatusRequest         | IncomingStatusRequestHandler       |\n" +
    "| **admi.002** | admi.002.001.01 | MessageReject                      | Error Response                     |\n" +
    "\n" +
    "### Version Support Policy\n" +
    "\n" +
    "- ✅ **Current Versions:** All versions listed above are fully supported\n" +
    "- ⚠️ **Future Versions:** New ISO versions require:\n" +
    "  - Schema validation updates\n" +
    "  - Handler modifications\n" +
    "  - New test cases\n" +
    "  - Regression testing of existing flows\n" +
    "- 🔄 **Backward Compatibility:** Maintained for 2 major versions\n" +
    "- 📋 **Version Detection:** Based on `MsgDefIdr` field in AppHdr\n" +
    "\n" +
    "### API Versioning\n" +
    "\n" +
    "- **Current API Version:** v1\n" +
    "- **Endpoint Format:** `/api/v1/{resource}`\n" +
    "- **Version Header:** `Accept: application/xml; version=1`\n" +
    "- **Deprecation Policy:** 6 months notice before version sunset\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Message Flow Diagrams\n" +
    "\n" +
    "### Flow 1: Incoming Payment (pacs.008 → pacs.002)\n" +
    "\n" +
    "```\n" +
    "┌──────────┐                    ┌──────────────┐                    ┌──────────┐\n" +
    "│   SVIP   │                    │ SIPS Connect │                    │ CoreBank │\n" +
    "└────┬─────┘                    └──────┬───────┘                    └────┬─────┘\n" +
    "     │                                  │                                 │\n" +
    "     │ 1. POST pacs.008 (Signed)       │                                 │\n" +
    "     │─────────────────────────────────>│                                 │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 2. Validate Signature           │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 3. Parse pacs.008               │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 4. Save to DB (Status=Pending)  │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 5. POST /payment (JSON)         │\n" +
    "     │                                  │─────────────────────────────────>│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 6. Payment Response             │\n" +
    "     │                                  │<─────────────────────────────────│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 7. Update DB Status             │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │ 8. pacs.002 Response (Signed)   │                                 │\n" +
    "     │<─────────────────────────────────│                                 │\n" +
    "     │                                  │                                 │\n" +
    "```\n" +
    "\n" +
    "### Flow 2: Payment Status Report (pacs.002 ACSC/RJCT)\n" +
    "\n" +
    "```\n" +
    "┌──────────┐                    ┌──────────────┐                    ┌──────────┐\n" +
    "│   SVIP   │                    │ SIPS Connect │                    │ CoreBank │\n" +
    "└────┬─────┘                    └──────┬───────┘                    └────┬─────┘\n" +
    "     │                                  │                                 │\n" +
    "     │ 1. POST pacs.002 (ACSC/RJCT)    │                                 │\n" +
    "     │─────────────────────────────────>│                                 │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 2. Validate & Parse             │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 3. Lookup Transaction           │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 4. Check Idempotency            │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 5. POST /completion (if ACSC)   │\n" +
    "     │                                  │─────────────────────────────────>│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 6. Completion Response          │\n" +
    "     │                                  │<─────────────────────────────────│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 7. Update Status (Success/Failed)│\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │ 8. 200 OK Response              │                                 │\n" +
    "     │<─────────────────────────────────│                                 │\n" +
    "     │                                  │                                 │\n" +
    "```\n" +
    "\n" +
    "### Flow 3: Verification Request (acmt.023 → acmt.024)\n" +
    "\n" +
    "```\n" +
    "┌──────────┐                    ┌──────────────┐                    ┌──────────┐\n" +
    "│   SVIP   │                    │ SIPS Connect │                    │ CoreBank │\n" +
    "└────┬─────┘                    └──────┬───────┘                    └────┬─────┘\n" +
    "     │                                  │                                 │\n" +
    "     │ 1. POST acmt.023 (Signed)       │                                 │\n" +
    "     │─────────────────────────────────>│                                 │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 2. Validate & Parse             │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 3. POST /verify (JSON)          │\n" +
    "     │                                  │─────────────────────────────────>│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 4. Verification Result          │\n" +
    "     │                                  │<─────────────────────────────────│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 5. Build acmt.024               │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │ 6. acmt.024 Response (Signed)   │                                 │\n" +
    "     │<─────────────────────────────────│                                 │\n" +
    "     │                                  │                                 │\n" +
    "```\n" +
    "\n" +
    "### Flow 4: Gateway Payment (Outbound)\n" +
    "\n" +
    "```\n" +
    "┌──────────┐                    ┌──────────────┐                    ┌──────────┐\n" +
    "│ CoreBank │                    │ SIPS Connect │                    │   SVIP   │\n" +
    "└────┬─────┘                    └──────┬───────┘                    └────┬─────┘\n" +
    "     │                                  │                                 │\n" +
    "     │ 1. POST /gateway/Payment (JSON) │                                 │\n" +
    "     │─────────────────────────────────>│                                 │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 2. Validate Auth                │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 3. Build pacs.008               │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 4. Sign with Private Key        │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 5. POST pacs.008 (Signed)       │\n" +
    "     │                                  │─────────────────────────────────>│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 6. pacs.002 Response            │\n" +
    "     │                                  │<─────────────────────────────────│\n" +
    "     │                                  │                                 │\n" +
    "     │                                  │ 7. Parse Response               │\n" +
    "     │                                  │────────┐                        │\n" +
    "     │                                  │        │                        │\n" +
    "     │                                  │<───────┘                        │\n" +
    "     │                                  │                                 │\n" +
    "     │ 8. JSON Response                │                                 │\n" +
    "     │<─────────────────────────────────│                                 │\n" +
    "     │                                  │                                 │\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## HTTP Headers & Message Format\n" +
    "\n" +
    "### Required HTTP Headers for Incoming Messages\n" +
    "\n" +
    "All incoming ISO 20022 messages must include:\n" +
    "\n" +
    "```http\n" +
    "POST /api/v1/incoming HTTP/1.1\n" +
    "Host: sips-connect.example.com\n" +
    "Content-Type: application/xml; charset=utf-8\n" +
    "Accept: application/xml\n" +
    "Content-Length: [length]\n" +
    "User-Agent: [client-identifier]\n" +
    "X-Message-Id: [unique-message-id]\n" +
    "X-Correlation-Id: [correlation-id]\n" +
    "```\n" +
    "\n" +
    "### Required HTTP Headers for Gateway APIs\n" +
    "\n" +
    "```http\n" +
    "POST /api/v1/gateway/Payment HTTP/1.1\n" +
    "Host: sips-connect.example.com\n" +
    "Content-Type: application/json; charset=utf-8\n" +
    "Accept: application/json\n" +
    "Authorization: Bearer [JWT_TOKEN]\n" +
    "# OR\n" +
    "X-API-KEY: [api-key]\n" +
    "X-API-SECRET: [api-secret]\n" +
    "X-Correlation-Id: [correlation-id]\n" +
    "```\n" +
    "\n" +
    "### XML Message Format Requirements\n" +
    "\n" +
    "#### Character Encoding\n" +
    "\n" +
    "- **Required:** UTF-8 without BOM (Byte Order Mark)\n" +
    "- **Line Endings:** LF (`\\n`) or CRLF (`\\r\\n`) - both accepted\n" +
    "- **Whitespace:** Preserved during signature validation (canonical XML)\n" +
    "\n" +
    "#### XML Signature Requirements (XAdES-BES)\n" +
    "\n" +
    "```xml\n" +
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<FPEnvelope xmlns=\"urn:sps:xsd:fps.001.001.01\">\n" +
    "  <AppHdr xmlns=\"urn:iso:std:iso:20022:tech:xsd:head.001.001.02\">\n" +
    "    <!-- Application Header -->\n" +
    "  </AppHdr>\n" +
    "  <Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10\">\n" +
    "    <!-- Business Message -->\n" +
    "  </Document>\n" +
    "  <ds:Signature xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\">\n" +
    "    <ds:SignedInfo>\n" +
    "      <ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\n" +
    "      <ds:SignatureMethod Algorithm=\"http://www.w3.org/2001/04/xmldsig-more#rsa-sha256\"/>\n" +
    "      <ds:Reference URI=\"\">\n" +
    "        <ds:Transforms>\n" +
    "          <ds:Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\"/>\n" +
    "          <ds:Transform Algorithm=\"http://www.w3.org/2001/10/xml-exc-c14n#\"/>\n" +
    "        </ds:Transforms>\n" +
    "        <ds:DigestMethod Algorithm=\"http://www.w3.org/2001/04/xmlenc#sha256\"/>\n" +
    "        <ds:DigestValue>[base64-digest]</ds:DigestValue>\n" +
    "      </ds:Reference>\n" +
    "    </ds:SignedInfo>\n" +
    "    <ds:SignatureValue>[base64-signature]</ds:SignatureValue>\n" +
    "    <ds:KeyInfo>\n" +
    "      <ds:X509Data>\n" +
    "        <ds:X509Certificate>[base64-certificate]</ds:X509Certificate>\n" +
    "      </ds:X509Data>\n" +
    "    </ds:KeyInfo>\n" +
    "  </ds:Signature>\n" +
    "</FPEnvelope>\n" +
    "```\n" +
    "\n" +
    "#### Canonicalization Rules\n" +
    "\n" +
    "- **Algorithm:** Exclusive XML Canonicalization (exc-c14n)\n" +
    "- **Whitespace:** Normalized according to C14N rules\n" +
    "- **Namespace Prefixes:** Preserved\n" +
    "- **Comments:** Removed during canonicalization\n" +
    "\n" +
    "#### Signature Validation Notes\n" +
    "\n" +
    "- Whitespace **inside** element content affects signature\n" +
    "- Whitespace **between** elements does not affect signature (after canonicalization)\n" +
    "- Line breaks are normalized during canonicalization\n" +
    "- XML declaration (`<?xml...?>`) is not part of signature\n" +
    "\n" +
    "### Response Format\n" +
    "\n" +
    "#### Success Response (200 OK)\n" +
    "\n" +
    "```xml\n" +
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<FPEnvelope xmlns=\"urn:sps:xsd:fps.001.001.01\">\n" +
    "  <AppHdr xmlns=\"urn:iso:std:iso:20022:tech:xsd:head.001.001.02\">\n" +
    "    <Fr>\n" +
    "      <FIId>\n" +
    "        <FinInstnId>\n" +
    "          <BICFI>SIPSSOMOXXXX</BICFI>\n" +
    "        </FinInstnId>\n" +
    "      </FIId>\n" +
    "    </Fr>\n" +
    "    <To>\n" +
    "      <FIId>\n" +
    "        <FinInstnId>\n" +
    "          <BICFI>BANKSOMOXXXX</BICFI>\n" +
    "        </FinInstnId>\n" +
    "      </FIId>\n" +
    "    </To>\n" +
    "    <BizMsgIdr>[unique-business-message-id]</BizMsgIdr>\n" +
    "    <MsgDefIdr>pacs.002.001.12</MsgDefIdr>\n" +
    "    <CreDt>[ISO-8601-timestamp]</CreDt>\n" +
    "  </AppHdr>\n" +
    "  <Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pacs.002.001.12\">\n" +
    "    <!-- Response Document -->\n" +
    "  </Document>\n" +
    "  <ds:Signature xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\">\n" +
    "    <!-- Signature -->\n" +
    "  </ds:Signature>\n" +
    "</FPEnvelope>\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Error Code Schema\n" +
    "\n" +
    "### Error Response Structure\n" +
    "\n" +
    "All error responses follow this JSON structure for Gateway APIs:\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"status\": \"Failed\",\n" +
    "  \"errorCode\": \"ERROR_CATEGORY_SPECIFIC_CODE\",\n" +
    "  \"message\": \"Human-readable error message\",\n" +
    "  \"details\": \"Additional technical details (optional)\",\n" +
    "  \"timestamp\": \"2024-11-27T13:00:00Z\",\n" +
    "  \"correlationId\": \"550e8400-e29b-41d4-a716-446655440000\",\n" +
    "  \"path\": \"/api/v1/gateway/Payment\"\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "For ISO 20022 responses, errors are returned as `admi.002` messages.\n" +
    "\n" +
    "### Error Code Categories\n" +
    "\n" +
    "#### AUTH - Authentication Errors (401)\n" +
    "\n" +
    "| Error Code                      | HTTP Status | Description                            | Resolution                   |\n" +
    "| ------------------------------- | ----------- | -------------------------------------- | ---------------------------- |\n" +
    "| `AUTH_MISSING_CREDENTIALS`      | 401         | No authentication credentials provided | Provide API key or JWT token |\n" +
    "| `AUTH_INVALID_API_KEY`          | 401         | Invalid API key                        | Verify API key is correct    |\n" +
    "| `AUTH_INVALID_JWT`              | 401         | Invalid or malformed JWT token         | Obtain new JWT token         |\n" +
    "| `AUTH_EXPIRED_JWT`              | 401         | JWT token has expired                  | Refresh JWT token            |\n" +
    "| `AUTH_INSUFFICIENT_PERMISSIONS` | 403         | User lacks required permissions        | Contact administrator        |\n" +
    "\n" +
    "#### SIG - Signature Validation Errors (400/401)\n" +
    "\n" +
    "| Error Code                  | HTTP Status | Description                       | Resolution                              |\n" +
    "| --------------------------- | ----------- | --------------------------------- | --------------------------------------- |\n" +
    "| `SIG_MISSING`               | 400         | XML signature is missing          | Add valid XAdES-BES signature           |\n" +
    "| `SIG_INVALID`               | 401         | Signature validation failed       | Verify signature is correctly generated |\n" +
    "| `SIG_CERT_EXPIRED`          | 401         | Signing certificate has expired   | Renew certificate                       |\n" +
    "| `SIG_CERT_REVOKED`          | 401         | Certificate has been revoked      | Obtain new certificate                  |\n" +
    "| `SIG_CERT_NOT_TRUSTED`      | 401         | Certificate not in trust store    | Register certificate with SPS PKI       |\n" +
    "| `SIG_ALGORITHM_UNSUPPORTED` | 400         | Signature algorithm not supported | Use RSA-SHA256                          |\n" +
    "\n" +
    "#### XML - XML Processing Errors (400)\n" +
    "\n" +
    "| Error Code           | HTTP Status | Description                         | Resolution                        |\n" +
    "| -------------------- | ----------- | ----------------------------------- | --------------------------------- |\n" +
    "| `XML_MALFORMED`      | 400         | XML is not well-formed              | Fix XML syntax errors             |\n" +
    "| `XML_SCHEMA_INVALID` | 400         | XML does not match ISO 20022 schema | Validate against XSD schema       |\n" +
    "| `XML_MISSING_FIELD`  | 400         | Required field is missing           | Add required field                |\n" +
    "| `XML_INVALID_VALUE`  | 400         | Field contains invalid value        | Correct field value               |\n" +
    "| `XML_XXE_DETECTED`   | 400         | XML External Entity attack detected | Remove external entity references |\n" +
    "| `XML_TOO_LARGE`      | 413         | XML payload exceeds size limit      | Reduce payload size (max 10MB)    |\n" +
    "\n" +
    "#### MSG - Message Processing Errors (400/404)\n" +
    "\n" +
    "| Error Code                | HTTP Status | Description                | Resolution                 |\n" +
    "| ------------------------- | ----------- | -------------------------- | -------------------------- |\n" +
    "| `MSG_UNSUPPORTED_TYPE`    | 400         | Message type not supported | Use supported message type |\n" +
    "| `MSG_UNSUPPORTED_VERSION` | 400         | ISO version not supported  | Use supported ISO version  |\n" +
    "| `MSG_DUPLICATE`           | 409         | Duplicate message ID       | Use unique message ID      |\n" +
    "| `MSG_TX_NOT_FOUND`        | 404         | Transaction not found      | Verify transaction ID      |\n" +
    "| `MSG_INVALID_CURRENCY`    | 400         | Currency code invalid      | Use valid ISO 4217 code    |\n" +
    "| `MSG_INVALID_AMOUNT`      | 400         | Amount format invalid      | Use valid decimal format   |\n" +
    "| `MSG_INVALID_ACCOUNT`     | 400         | Account number invalid     | Verify account format      |\n" +
    "\n" +
    "#### COREBANK - CoreBank Integration Errors (502/504)\n" +
    "\n" +
    "| Error Code                    | HTTP Status | Description                   | Resolution                         |\n" +
    "| ----------------------------- | ----------- | ----------------------------- | ---------------------------------- |\n" +
    "| `COREBANK_UNAVAILABLE`        | 502         | CoreBank system unavailable   | Retry later, check CoreBank status |\n" +
    "| `COREBANK_TIMEOUT`            | 504         | CoreBank request timed out    | Retry with longer timeout          |\n" +
    "| `COREBANK_REJECTED`           | 400         | CoreBank rejected transaction | Review rejection reason            |\n" +
    "| `COREBANK_INSUFFICIENT_FUNDS` | 400         | Insufficient funds            | Verify account balance             |\n" +
    "| `COREBANK_ACCOUNT_BLOCKED`    | 400         | Account is blocked            | Contact bank                       |\n" +
    "\n" +
    "#### INTERNAL - Internal System Errors (500)\n" +
    "\n" +
    "| Error Code              | HTTP Status | Description               | Resolution                          |\n" +
    "| ----------------------- | ----------- | ------------------------- | ----------------------------------- |\n" +
    "| `INTERNAL_ERROR`        | 500         | Unexpected internal error | Contact support with correlation ID |\n" +
    "| `INTERNAL_DB_ERROR`     | 500         | Database error            | Contact support                     |\n" +
    "| `INTERNAL_CONFIG_ERROR` | 500         | Configuration error       | Verify system configuration         |\n" +
    "\n" +
    "#### RATE - Rate Limiting Errors (429)\n" +
    "\n" +
    "| Error Code            | HTTP Status | Description       | Resolution                              |\n" +
    "| --------------------- | ----------- | ----------------- | --------------------------------------- |\n" +
    "| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests | Wait and retry (see Retry-After header) |\n" +
    "\n" +
    "### Error Response Examples\n" +
    "\n" +
    "#### Example 1: Invalid Signature\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"status\": \"Failed\",\n" +
    "  \"errorCode\": \"SIG_INVALID\",\n" +
    "  \"message\": \"XML signature validation failed\",\n" +
    "  \"details\": \"Signature digest does not match computed digest\",\n" +
    "  \"timestamp\": \"2024-11-27T13:00:00Z\",\n" +
    "  \"correlationId\": \"550e8400-e29b-41d4-a716-446655440000\",\n" +
    "  \"path\": \"/api/v1/incoming\"\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "#### Example 2: Transaction Not Found\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"status\": \"Failed\",\n" +
    "  \"errorCode\": \"MSG_TX_NOT_FOUND\",\n" +
    "  \"message\": \"Transaction not found\",\n" +
    "  \"details\": \"No transaction found with TxId: TX-NOTFOUND-001\",\n" +
    "  \"timestamp\": \"2024-11-27T13:00:00Z\",\n" +
    "  \"correlationId\": \"550e8400-e29b-41d4-a716-446655440000\",\n" +
    "  \"path\": \"/api/v1/incoming\"\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "#### Example 3: CoreBank Timeout\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"status\": \"Failed\",\n" +
    "  \"errorCode\": \"COREBANK_TIMEOUT\",\n" +
    "  \"message\": \"CoreBank request timed out\",\n" +
    "  \"details\": \"Request to CoreBank exceeded 30 second timeout\",\n" +
    "  \"timestamp\": \"2024-11-27T13:00:00Z\",\n" +
    "  \"correlationId\": \"550e8400-e29b-41d4-a716-446655440000\",\n" +
    "  \"path\": \"/api/v1/gateway/Payment\"\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## PKI & Signing Architecture\n" +
    "\n" +
    "### Key Management Overview\n" +
    "\n" +
    "| Component        | Key Type                 | Key Use                           | Storage                        |\n" +
    "| ---------------- | ------------------------ | --------------------------------- | ------------------------------ |\n" +
    "| **SIPS Connect** | RSA 2048-bit Private Key | Sign outgoing ISO 20022 messages  | Encrypted file with passphrase |\n" +
    "| **SIPS Connect** | X509 Certificate         | Identify SIPS Connect to banks    | Certificate file               |\n" +
    "| **SIPS Connect** | Public Key Store         | Validate incoming bank signatures | SPS Public Key Repository      |\n" +
    "| **Banks**        | RSA 2048-bit Private Key | Sign incoming ISO 20022 messages  | Bank's secure storage          |\n" +
    "| **Banks**        | X509 Certificate         | Registered with SPS PKI           | SPS Certificate Authority      |\n" +
    "\n" +
    "### PKI Workflow\n" +
    "\n" +
    "```\n" +
    "┌─────────────────────────────────────────────────────────────────┐\n" +
    "│                    SPS Certificate Authority                    │\n" +
    "│  - Issues certificates to banks                                 │\n" +
    "│  - Maintains public key repository                              │\n" +
    "│  - Handles certificate revocation                               │\n" +
    "└────────────────────────┬────────────────────────────────────────┘\n" +
    "                         │\n" +
    "                         │ Certificate Registration\n" +
    "                         │\n" +
    "         ┌───────────────┴───────────────┐\n" +
    "         │                               │\n" +
    "         ▼                               ▼\n" +
    "┌─────────────────┐             ┌─────────────────┐\n" +
    "│  SIPS Connect   │             │   Bank System   │\n" +
    "│                 │             │                 │\n" +
    "│ Private Key     │             │ Private Key     │\n" +
    "│ (Signs outgoing)│             │ (Signs incoming)│\n" +
    "│                 │             │                 │\n" +
    "│ Public Keys     │             │ Certificate     │\n" +
    "│ (Validates)     │             │ (Registered)    │\n" +
    "└────────┬────────┘             └────────┬────────┘\n" +
    "         │                               │\n" +
    "         │  1. Bank signs pacs.008       │\n" +
    "         │<──────────────────────────────│\n" +
    "         │                               │\n" +
    "         │  2. SIPS validates signature  │\n" +
    "         │     using bank's public key   │\n" +
    "         │                               │\n" +
    "         │  3. SIPS signs pacs.002       │\n" +
    "         │──────────────────────────────>│\n" +
    "         │                               │\n" +
    "         │  4. Bank validates signature  │\n" +
    "         │     using SIPS public key     │\n" +
    "         │                               │\n" +
    "```\n" +
    "\n" +
    "### Certificate Requirements\n" +
    "\n" +
    "#### Certificate Specifications\n" +
    "\n" +
    "- **Algorithm:** RSA\n" +
    "- **Key Size:** 2048 bits minimum (4096 bits recommended)\n" +
    "- **Signature Algorithm:** SHA-256 with RSA\n" +
    "- **Validity Period:** Maximum 3 years\n" +
    "- **Key Usage:** Digital Signature, Non-Repudiation\n" +
    "- **Extended Key Usage:** Client Authentication\n" +
    "\n" +
    "#### Certificate Subject\n" +
    "\n" +
    "```\n" +
    "CN=<BIC-Code>\n" +
    "O=<Organization-Name>\n" +
    "C=SO\n" +
    "```\n" +
    "\n" +
    "Example: `CN=BANKSOMOXXXX, O=Example Bank, C=SO`\n" +
    "\n" +
    "### Private Key Protection\n" +
    "\n" +
    "#### Encryption\n" +
    "\n" +
    "- **Algorithm:** AES-256\n" +
    "- **Passphrase:** Minimum 20 characters\n" +
    "- **Storage:** Encrypted file, never plain text\n" +
    "- **Configuration:** Passphrase encrypted in appsettings.json\n" +
    "\n" +
    "#### Example Private Key Generation\n" +
    "\n" +
    "```bash\n" +
    "# Generate encrypted private key\n" +
    "openssl req -new -newkey rsa:4096 \\\n" +
    "  -keyout private.key \\\n" +
    "  -out request.csr \\\n" +
    "  -subj \"/CN=SIPSSOMOXXXX/O=SIPS Connect/C=SO\"\n" +
    "# Prompts for passphrase\n" +
    "\n" +
    "# Verify key is encrypted\n" +
    "openssl rsa -in private.key -noout\n" +
    "# Should prompt for passphrase\n" +
    "```\n" +
    "\n" +
    "### Certificate Validation Process\n" +
    "\n" +
    "#### On Message Receipt\n" +
    "\n" +
    "1. **Extract Certificate** from `ds:X509Certificate` element\n" +
    "2. **Verify Certificate Chain** against SPS CA root\n" +
    "3. **Check Certificate Expiry** (NotBefore/NotAfter)\n" +
    "4. **Check Revocation Status** (if CRL/OCSP configured)\n" +
    "5. **Validate Signature** using certificate's public key\n" +
    "6. **Verify BIC Match** (certificate CN matches message sender BIC)\n" +
    "\n" +
    "#### Validation Queries\n" +
    "\n" +
    "```bash\n" +
    "# Validate certificate chain\n" +
    "openssl verify -verbose -CAfile chain.pem certificate.cer\n" +
    "\n" +
    "# Check expiry\n" +
    "openssl x509 -in certificate.cer -noout -dates\n" +
    "\n" +
    "# Verify modulus matches private key\n" +
    "openssl x509 -noout -modulus -in certificate.cer | openssl md5\n" +
    "openssl rsa -noout -modulus -in private.key | openssl md5\n" +
    "# MD5 hashes must match\n" +
    "```\n" +
    "\n" +
    "### Certificate Rotation\n" +
    "\n" +
    "#### Rotation Schedule\n" +
    "\n" +
    "- **Recommended:** Every 12 months\n" +
    "- **Maximum:** Before expiry (3 years)\n" +
    "- **Overlap Period:** 30 days (old and new certs both valid)\n" +
    "\n" +
    "#### Rotation Process\n" +
    "\n" +
    "1. Generate new CSR\n" +
    "2. Submit to SPS CA\n" +
    "3. Receive new certificate\n" +
    "4. Configure new certificate in SIPS Connect\n" +
    "5. Test with new certificate\n" +
    "6. Switch to new certificate\n" +
    "7. Notify partners\n" +
    "8. Decommission old certificate after overlap period\n" +
    "\n" +
    "**Reference:** See `pki_docs.md` for detailed procedures\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Test Environment Setup\n" +
    "\n" +
    "### Prerequisites\n" +
    "\n" +
    "1. **Docker** (required for containerized deployment)\n" +
    "2. **PostgreSQL** database (v13+)\n" +
    "3. **Valid certificates** for signing/verification\n" +
    "4. **Test data** seeded in database\n" +
    "\n" +
    "### Quick Start\n" +
    "\n" +
    "```bash\n" +
    "# 1. Clone repository\n" +
    "git clone https://github.com/SPS-SIPS/SIPS.Connect.git\n" +
    "cd SIPS.Connect\n" +
    "\n" +
    "# 2. Configure environment\n" +
    "cp .env.example .env\n" +
    "# Edit .env with your configuration\n" +
    "\n" +
    "# 3. Create Docker network\n" +
    "docker network create --driver bridge sips-network\n" +
    "\n" +
    "# 4. Start services\n" +
    "docker-compose up -d\n" +
    "\n" +
    "# 5. Verify health\n" +
    "curl -k https://localhost:443/health\n" +
    "```\n" +
    "\n" +
    "### Test Configuration Files\n" +
    "\n" +
    "- **TestScripts/test-config.json** - Test configuration\n" +
    "- **TestScripts/Payloads/** - Sample XML payloads\n" +
    "- **TestScripts/test-scenarios.md** - Detailed test scenarios\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Functional Test Cases\n" +
    "\n" +
    "### 1. IncomingTransactionHandler (pacs.008)\n" +
    "\n" +
    "**Purpose:** Process incoming payment requests\n" +
    "\n" +
    "#### Test Case 1.1: Successful Payment Request\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.008.xml`\n" +
    "\n" +
    "**Steps:**\n" +
    "\n" +
    "1. Send POST request to `/api/v1/incoming` with pacs.008 XML\n" +
    "2. Handler validates XML signature\n" +
    "3. Parses pacs.008 message\n" +
    "4. Records transaction in database\n" +
    "5. Calls CoreBank payment endpoint\n" +
    "6. Returns signed pacs.002 response\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Response contains signed FPEnvelope\n" +
    "- ✅ Response contains pacs.002 document\n" +
    "- ✅ Transaction persisted with Status = Pending or Success\n" +
    "- ✅ CoreBank callback invoked\n" +
    "\n" +
    "**Database Validation:**\n" +
    "\n" +
    "```sql\n" +
    "SELECT * FROM iso_messages WHERE TxId = 'AGROSOS0528910638962089436554484';\n" +
    "-- Should show Status = Success or Pending\n" +
    "```\n" +
    "\n" +
    "#### Test Case 1.2: CoreBank Callback Failure\n" +
    "\n" +
    "**Setup:** Configure CoreBank endpoint to return error\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK (handler still returns response)\n" +
    "- ✅ Transaction Status = Failed or Pending\n" +
    "- ✅ Error logged in system\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 2. IncomingVerificationHandler (acmt.023)\n" +
    "\n" +
    "**Purpose:** Process account verification requests\n" +
    "\n" +
    "#### Test Case 2.1: Successful Verification\n" +
    "\n" +
    "**Payload:** `Payloads/acmt.023.xml`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Response contains signed FPEnvelope\n" +
    "- ✅ Response contains acmt.024 document\n" +
    "- ✅ Verification result persisted\n" +
    "\n" +
    "#### Test Case 2.2: Verification Service Unavailable\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK or 500\n" +
    "- ✅ Error logged\n" +
    "- ✅ Appropriate error message in response\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 3. IncomingTransactionStatusHandler (pacs.002)\n" +
    "\n" +
    "**Purpose:** Process transaction status updates\n" +
    "\n" +
    "#### Test Case 3.1: Status Update for Existing Transaction\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-status.xml`\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "\n" +
    "- Transaction with TxId exists in database\n" +
    "- Transaction Status = Pending\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction status updated in database\n" +
    "- ✅ ISOMessageStatus record created\n" +
    "- ✅ Response contains acknowledgment\n" +
    "\n" +
    "**Database Validation:**\n" +
    "\n" +
    "```sql\n" +
    "SELECT * FROM iso_message_statuses\n" +
    "WHERE ISOMessageId = (SELECT Id FROM iso_messages WHERE TxId = 'TX-TEST-001')\n" +
    "ORDER BY CreatedAt DESC LIMIT 1;\n" +
    "```\n" +
    "\n" +
    "#### Test Case 3.2: Status for Non-Existent Transaction\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-notfound.xml`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK (with admi.002) or 404\n" +
    "- ✅ Response indicates transaction not found\n" +
    "- ✅ No database changes\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 4. IncomingPaymentStatusReportHandler (pacs.002)\n" +
    "\n" +
    "**Purpose:** Process payment status reports with business logic\n" +
    "\n" +
    "#### Test Case 4.1: ACSC Status - CoreBank Success\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-acsc.xml`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status = Success\n" +
    "- ✅ Transaction Reason contains success message\n" +
    "- ✅ CoreBank callback invoked\n" +
    "- ✅ ISOMessageStatus persisted\n" +
    "\n" +
    "**Database Validation:**\n" +
    "\n" +
    "```sql\n" +
    "SELECT Status, Reason, AdditionalInfo\n" +
    "FROM iso_messages\n" +
    "WHERE TxId = 'TX-ACSC-001';\n" +
    "-- Status should be 'Success'\n" +
    "```\n" +
    "\n" +
    "#### Test Case 4.2: RJCT Status - Payment Rejection\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-rjct.xml`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status = Failed\n" +
    "- ✅ Transaction Reason = \"Received rejection confirmation\"\n" +
    "- ✅ CoreBank callback NOT invoked\n" +
    "- ✅ Rejection reason captured in AdditionalInfo (e.g., \"AM04 - Insufficient funds\")\n" +
    "\n" +
    "#### Test Case 4.3: Idempotency - Duplicate Processing\n" +
    "\n" +
    "**Test:** Send same ACSC message twice\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK for both requests\n" +
    "- ✅ Transaction Status remains Success\n" +
    "- ✅ CoreBank callback NOT invoked second time (idempotency)\n" +
    "- ✅ New ISOMessageStatus record created (audit trail)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 5. Gateway API Tests\n" +
    "\n" +
    "#### Test Case 5.1: Verify Endpoint\n" +
    "\n" +
    "**Endpoint:** `POST /api/v1/gateway/Verify`\n" +
    "\n" +
    "**Authentication:** Bearer token or API Key headers\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST https://localhost:443/api/v1/gateway/Verify \\\n" +
    "  -H \"Authorization: Bearer JWT_TOKEN\" \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -d @verification_request.json\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK with valid credentials\n" +
    "- ✅ HTTP Status: 401 Unauthorized without credentials\n" +
    "- ✅ Valid verification response returned\n" +
    "\n" +
    "#### Test Case 5.2: Payment Endpoint\n" +
    "\n" +
    "**Endpoint:** `POST /api/v1/gateway/Payment`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 200 OK with valid request\n" +
    "- ✅ Payment processed and signed\n" +
    "- ✅ Transaction recorded in database\n" +
    "\n" +
    "#### Test Case 5.3: Status Endpoint\n" +
    "\n" +
    "**Endpoint:** `POST /api/v1/gateway/status`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Returns current transaction status\n" +
    "- ✅ Status matches database records\n" +
    "\n" +
    "#### Test Case 5.4: Return Endpoint\n" +
    "\n" +
    "**Endpoint:** `POST /api/v1/gateway/return`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Return request processed\n" +
    "- ✅ Appropriate response returned\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 6. SomQR API Tests\n" +
    "\n" +
    "#### Test Case 6.1: Generate Merchant QR\n" +
    "\n" +
    "**Endpoint:** `POST /api/v1/somqr/GenerateMerchantQR`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Valid QR code generated\n" +
    "- ✅ QR code parseable\n" +
    "\n" +
    "#### Test Case 6.2: Generate Person QR\n" +
    "\n" +
    "**Endpoint:** `POST /api/v1/somqr/GeneratePersonQR`\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Valid P2P QR code generated\n" +
    "- ✅ Contains correct account information\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Security Test Scenarios\n" +
    "\n" +
    "### 1. Authentication & Authorization Tests\n" +
    "\n" +
    "#### Security Test 1.1: API Key Authentication\n" +
    "\n" +
    "**Test:** Access protected endpoints with/without API keys\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```bash\n" +
    "# Valid API key\n" +
    "curl -X POST https://localhost:443/api/v1/gateway/Payment \\\n" +
    "  -H \"X-API-KEY: valid_key\" \\\n" +
    "  -H \"X-API-SECRET: valid_secret\" \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -d @payment_request.json\n" +
    "\n" +
    "# Invalid API key\n" +
    "curl -X POST https://localhost:443/api/v1/gateway/Payment \\\n" +
    "  -H \"X-API-KEY: invalid_key\" \\\n" +
    "  -H \"X-API-SECRET: invalid_secret\"\n" +
    "\n" +
    "# Missing API key\n" +
    "curl -X POST https://localhost:443/api/v1/gateway/Payment\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Valid credentials: HTTP 200 OK\n" +
    "- ✅ Invalid credentials: HTTP 401 Unauthorized\n" +
    "- ✅ Missing credentials: HTTP 401 Unauthorized\n" +
    "- ✅ Error messages do not reveal system details\n" +
    "\n" +
    "#### Security Test 1.2: JWT Bearer Token Authentication\n" +
    "\n" +
    "**Test:** Access with valid/expired/malformed JWT tokens\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Valid token: HTTP 200 OK\n" +
    "- ✅ Expired token: HTTP 401 Unauthorized\n" +
    "- ✅ Malformed token: HTTP 401 Unauthorized\n" +
    "- ✅ Token validation enforced\n" +
    "\n" +
    "#### Security Test 1.3: Authorization Bypass Attempts\n" +
    "\n" +
    "**Test:** Access endpoints without proper authorization\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ All protected endpoints require authentication\n" +
    "- ✅ No authorization bypass possible\n" +
    "- ✅ Proper role-based access control enforced\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 2. XML Signature Validation Tests\n" +
    "\n" +
    "#### Security Test 2.1: Valid Signature Verification\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.008.xml` (properly signed)\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Signature validated successfully\n" +
    "- ✅ Message processed\n" +
    "- ✅ HTTP 200 OK\n" +
    "\n" +
    "#### Security Test 2.2: Invalid Signature Detection\n" +
    "\n" +
    "**Test:** Send message with tampered signature\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ HTTP Status: 401 Unauthorized or 400 Bad Request\n" +
    "- ✅ Error message indicates signature failure\n" +
    "- ✅ No database changes\n" +
    "- ✅ Security event logged\n" +
    "\n" +
    "#### Security Test 2.3: Missing Signature\n" +
    "\n" +
    "**Test:** Send unsigned message\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Request rejected\n" +
    "- ✅ Appropriate error response\n" +
    "- ✅ No processing occurs\n" +
    "\n" +
    "#### Security Test 2.4: Certificate Expiry\n" +
    "\n" +
    "**Test:** Use expired certificate for signing\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Certificate validation fails\n" +
    "- ✅ Request rejected\n" +
    "- ✅ Error logged\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 3. Data Protection & Encryption Tests\n" +
    "\n" +
    "#### Security Test 3.1: Data Protection Keys Encryption\n" +
    "\n" +
    "**Test:** Verify Data Protection keys are encrypted at rest\n" +
    "\n" +
    "**Validation:**\n" +
    "\n" +
    "```bash\n" +
    "# Check key files contain encrypted content\n" +
    "cat keys/key-*.xml | grep \"encryptedSecret\"\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Keys encrypted with X509 certificate or DPAPI\n" +
    "- ✅ No plain-text key material in files\n" +
    "- ✅ Warning shown if keys are unencrypted (dev only)\n" +
    "- ✅ Encrypted keys contain `<encryptedSecret>` elements\n" +
    "\n" +
    "**Reference:** See `DATA_PROTECTION_KEY_SECURITY.md` for detailed procedures\n" +
    "\n" +
    "#### Security Test 3.2: Private Key Protection\n" +
    "\n" +
    "**Test:** Verify private keys are encrypted with passphrase\n" +
    "\n" +
    "**Validation:**\n" +
    "\n" +
    "```bash\n" +
    "# Attempt to read private key without passphrase\n" +
    "openssl rsa -in private.key -noout\n" +
    "# Should prompt for passphrase\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Private key file is encrypted (AES-256)\n" +
    "- ✅ Passphrase required to use key\n" +
    "- ✅ Passphrase stored encrypted in configuration (ENCRYPTED: prefix)\n" +
    "- ✅ No plain-text passphrases in version control\n" +
    "\n" +
    "**Reference:** See `pki_docs.md` for certificate generation procedures\n" +
    "\n" +
    "#### Security Test 3.3: Database Connection Security\n" +
    "\n" +
    "**Test:** Verify database credentials are protected\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Connection strings encrypted in configuration\n" +
    "- ✅ SSL/TLS enabled for database connections\n" +
    "- ✅ No credentials in logs or error messages\n" +
    "- ✅ Database access restricted by IP/firewall\n" +
    "\n" +
    "#### Security Test 3.4: Secrets Management\n" +
    "\n" +
    "**Test:** Verify sensitive configuration is encrypted\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```bash\n" +
    "# Check appsettings.json for encrypted values\n" +
    "grep \"ENCRYPTED:\" appsettings.json\n" +
    "\n" +
    "# Verify encryption API works\n" +
    "curl -X POST https://localhost:443/api/v1/SecretManagement/encrypt \\\n" +
    "  -H \"Authorization: Bearer TOKEN\" \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -d '\"test-secret\"'\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ API secrets encrypted with `ENCRYPTED:` prefix\n" +
    "- ✅ Certificate passwords encrypted\n" +
    "- ✅ Encryption/decryption API available\n" +
    "- ✅ Data Protection keys used for encryption\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 4. Input Validation & Injection Tests\n" +
    "\n" +
    "#### Security Test 4.1: XML Injection\n" +
    "\n" +
    "**Test:** Send malicious XML payloads\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```xml\n" +
    "<!-- XXE Attack -->\n" +
    "<!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>\n" +
    "<root>&xxe;</root>\n" +
    "\n" +
    "<!-- XML Bomb -->\n" +
    "<!DOCTYPE lolz [\n" +
    "  <!ENTITY lol \"lol\">\n" +
    "  <!ENTITY lol2 \"&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;\">\n" +
    "]>\n" +
    "<root>&lol2;</root>\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ XXE attacks prevented\n" +
    "- ✅ XML bombs detected and rejected\n" +
    "- ✅ Malformed XML rejected with 400 Bad Request\n" +
    "- ✅ No system information leaked in errors\n" +
    "\n" +
    "#### Security Test 4.2: SQL Injection\n" +
    "\n" +
    "**Test:** Attempt SQL injection via transaction IDs and parameters\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```sql\n" +
    "-- Test with malicious TxId\n" +
    "TxId: \"TX-001'; DROP TABLE iso_messages; --\"\n" +
    "TxId: \"TX-001' OR '1'='1\"\n" +
    "TxId: \"TX-001' UNION SELECT * FROM users--\"\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Parameterized queries prevent injection\n" +
    "- ✅ Input sanitized\n" +
    "- ✅ No database errors exposed\n" +
    "- ✅ Malicious input logged\n" +
    "\n" +
    "#### Security Test 4.3: Command Injection\n" +
    "\n" +
    "**Test:** Attempt OS command injection\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```bash\n" +
    "# Test in various fields\n" +
    "AccountNumber: \"12345; rm -rf /\"\n" +
    "Name: \"Test`whoami`\"\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ No command execution possible\n" +
    "- ✅ Input validation prevents injection\n" +
    "- ✅ System calls properly sanitized\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 5. Network Security Tests\n" +
    "\n" +
    "#### Security Test 5.1: TLS/SSL Configuration\n" +
    "\n" +
    "**Test:** Verify HTTPS configuration\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```bash\n" +
    "# Check SSL/TLS version\n" +
    "openssl s_client -connect localhost:443 -tls1_2\n" +
    "\n" +
    "# Check cipher suites\n" +
    "nmap --script ssl-enum-ciphers -p 443 localhost\n" +
    "\n" +
    "# Verify certificate\n" +
    "openssl s_client -connect localhost:443 -showcerts\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ TLS 1.2 or higher enforced\n" +
    "- ✅ Strong cipher suites only\n" +
    "- ✅ Valid SSL certificate\n" +
    "- ✅ HTTP redirects to HTTPS\n" +
    "- ✅ No weak protocols (SSLv3, TLS 1.0, TLS 1.1)\n" +
    "\n" +
    "#### Security Test 5.2: CORS Configuration\n" +
    "\n" +
    "**Test:** Cross-Origin Resource Sharing policies\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ CORS properly configured\n" +
    "- ✅ Only allowed origins accepted\n" +
    "- ✅ Credentials handling secure\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 6. Error Handling & Information Disclosure Tests\n" +
    "\n" +
    "#### Security Test 6.1: Error Message Analysis\n" +
    "\n" +
    "**Test:** Trigger various error conditions\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "- Invalid XML format\n" +
    "- Missing required fields\n" +
    "- Database connection failure\n" +
    "- Invalid transaction ID\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ No stack traces in production\n" +
    "- ✅ No database schema information leaked\n" +
    "- ✅ No internal paths exposed\n" +
    "- ✅ Generic error messages to clients\n" +
    "- ✅ Detailed errors logged server-side only\n" +
    "\n" +
    "#### Security Test 6.2: Security Headers\n" +
    "\n" +
    "**Test:** Verify security headers present\n" +
    "\n" +
    "**Test:**\n" +
    "\n" +
    "```bash\n" +
    "curl -I https://localhost:443/health\n" +
    "```\n" +
    "\n" +
    "**Expected Headers:**\n" +
    "\n" +
    "```\n" +
    "X-Content-Type-Options: nosniff\n" +
    "X-Frame-Options: DENY\n" +
    "X-XSS-Protection: 1; mode=block\n" +
    "Strict-Transport-Security: max-age=31536000\n" +
    "Content-Security-Policy: default-src 'self'\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ All security headers present\n" +
    "- ✅ Headers properly configured\n" +
    "- ✅ No sensitive information in headers\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 7. Audit & Logging Tests\n" +
    "\n" +
    "#### Security Test 7.1: Security Event Logging\n" +
    "\n" +
    "**Test:** Verify security events are logged\n" +
    "\n" +
    "**Events to Log:**\n" +
    "\n" +
    "- Authentication failures\n" +
    "- Authorization failures\n" +
    "- Signature validation failures\n" +
    "- Invalid input attempts\n" +
    "- Configuration changes\n" +
    "- Administrative actions\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ All security events logged\n" +
    "- ✅ Logs include timestamp, user, action, IP address\n" +
    "- ✅ Logs protected from tampering\n" +
    "- ✅ No sensitive data in logs (passwords, keys, full card numbers)\n" +
    "\n" +
    "#### Security Test 7.2: Audit Trail Completeness\n" +
    "\n" +
    "**Test:** Verify complete audit trail for transactions\n" +
    "\n" +
    "**Database Validation:**\n" +
    "\n" +
    "```sql\n" +
    "-- Check transaction audit trail\n" +
    "SELECT im.TxId, im.Status, im.CreatedAt, ims.Status, ims.CreatedAt\n" +
    "FROM iso_messages im\n" +
    "LEFT JOIN iso_message_statuses ims ON im.Id = ims.ISOMessageId\n" +
    "WHERE im.TxId = 'TX-TEST-001'\n" +
    "ORDER BY ims.CreatedAt;\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ All transactions recorded\n" +
    "- ✅ Status changes tracked\n" +
    "- ✅ Timestamps accurate\n" +
    "- ✅ Immutable audit records\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 8. Certificate & PKI Tests\n" +
    "\n" +
    "#### Security Test 8.1: Certificate Validation\n" +
    "\n" +
    "**Test:** Verify certificate validation process\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "```bash\n" +
    "# Validate certificate chain\n" +
    "openssl verify -verbose -CAfile chain.pem certificate.cer\n" +
    "\n" +
    "# Check certificate expiry\n" +
    "openssl x509 -in certificate.cer -noout -dates\n" +
    "\n" +
    "# Verify modulus consistency\n" +
    "openssl x509 -noout -modulus -in certificate.cer | openssl md5\n" +
    "openssl rsa -noout -modulus -in private.key | openssl md5\n" +
    "# Both MD5 hashes must match\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Certificate chain validated\n" +
    "- ✅ Certificates not expired\n" +
    "- ✅ Modulus matches between cert and key\n" +
    "- ✅ Certificate revocation checked (if applicable)\n" +
    "\n" +
    "**Reference:** See `pki_docs.md` for detailed procedures\n" +
    "\n" +
    "#### Security Test 8.2: Certificate Rotation\n" +
    "\n" +
    "**Test:** Verify certificate rotation process\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Old certificates gracefully deprecated\n" +
    "- ✅ New certificates activated smoothly\n" +
    "- ✅ No service interruption\n" +
    "- ✅ Rollback procedure available\n" +
    "\n" +
    "---\n" +
    "\n" +
    "### 9. Denial of Service (DoS) Tests\n" +
    "\n" +
    "#### Security Test 9.1: Rate Limiting\n" +
    "\n" +
    "**Test:** Send excessive requests\n" +
    "\n" +
    "**Test:**\n" +
    "\n" +
    "```bash\n" +
    "# Send 1000 requests rapidly\n" +
    "for i in {1..1000}; do\n" +
    "  curl -X POST https://localhost:443/api/v1/incoming \\\n" +
    "    -H \"Content-Type: application/xml\" \\\n" +
    "    -d @Payloads/pacs.008.xml &\n" +
    "done\n" +
    "```\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Rate limiting enforced\n" +
    "- ✅ HTTP 429 Too Many Requests returned\n" +
    "- ✅ Service remains available\n" +
    "- ✅ Legitimate requests not affected\n" +
    "\n" +
    "#### Security Test 9.2: Resource Exhaustion\n" +
    "\n" +
    "**Test:** Large payload handling\n" +
    "\n" +
    "**Test Cases:**\n" +
    "\n" +
    "- Very large XML files (>10MB)\n" +
    "- Deeply nested XML structures\n" +
    "- Excessive concurrent connections\n" +
    "\n" +
    "**Expected Results:**\n" +
    "\n" +
    "- ✅ Request size limits enforced\n" +
    "- ✅ Connection limits enforced\n" +
    "- ✅ Timeouts prevent resource exhaustion\n" +
    "- ✅ Service remains stable\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Performance Test Scenarios\n" +
    "\n" +
    "### Load Test Scenario\n" +
    "\n" +
    "**Objective:** Test handler performance under load\n" +
    "\n" +
    "**Setup:**\n" +
    "\n" +
    "1. Use Apache JMeter or similar tool\n" +
    "2. Send 100 concurrent requests\n" +
    "3. Monitor response times and error rates\n" +
    "\n" +
    "**Validation Points:**\n" +
    "\n" +
    "- ✅ Average response time < 500ms\n" +
    "- ✅ 95th percentile < 1000ms\n" +
    "- ✅ Error rate < 1%\n" +
    "- ✅ No database deadlocks\n" +
    "- ✅ All transactions processed correctly\n" +
    "\n" +
    "**Test Script:**\n" +
    "\n" +
    "```bash\n" +
    "# Using Apache Bench\n" +
    "ab -n 1000 -c 100 -p Payloads/pacs.008.xml \\\n" +
    "   -T \"application/xml\" \\\n" +
    "   https://localhost:443/api/v1/incoming\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Test Automation Scripts\n" +
    "\n" +
    "### Available Test Scripts\n" +
    "\n" +
    "#### 1. PowerShell Test Script\n" +
    "\n" +
    "**File:** `TestScripts/test-handlers.ps1`\n" +
    "\n" +
    "**Usage:**\n" +
    "\n" +
    "```powershell\n" +
    "# Basic usage\n" +
    ".\\test-handlers.ps1 -BaseUrl \"https://localhost:443\"\n" +
    "\n" +
    "# With all options\n" +
    ".\\test-handlers.ps1 -BaseUrl \"https://localhost:443\" `\n" +
    "  -JsonOutput -VerboseOutput -RetryCount 3 -Timeout 60\n" +
    "```\n" +
    "\n" +
    "**Features:**\n" +
    "\n" +
    "- ✅ Comprehensive test reporting with statistics\n" +
    "- ✅ JSON output for CI/CD integration\n" +
    "- ✅ Retry logic for failed tests\n" +
    "- ✅ Response validation (XML structure, transaction IDs)\n" +
    "- ✅ Configurable timeouts\n" +
    "- ✅ Color-coded output\n" +
    "- ✅ Exit codes for automation\n" +
    "\n" +
    "#### 2. Bash Test Script\n" +
    "\n" +
    "**File:** `TestScripts/curl-examples.sh`\n" +
    "\n" +
    "**Usage:**\n" +
    "\n" +
    "```bash\n" +
    "# Basic usage\n" +
    "./curl-examples.sh https://localhost:443\n" +
    "\n" +
    "# With options\n" +
    "./curl-examples.sh https://localhost:443 --json-output --verbose --retry 3\n" +
    "```\n" +
    "\n" +
    "#### 3. Health Check Script\n" +
    "\n" +
    "**File:** `TestScripts/test-health.sh`\n" +
    "\n" +
    "**Usage:**\n" +
    "\n" +
    "```bash\n" +
    "./test-health.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "**Expected Output:**\n" +
    "\n" +
    "```\n" +
    "✅ Health check passed - All systems operational\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Test Data & Payloads\n" +
    "\n" +
    "### Available Test Payloads\n" +
    "\n" +
    "Located in `TestScripts/Payloads/`:\n" +
    "\n" +
    "1. **pacs.008.xml** - Payment request\n" +
    "2. **acmt.023.xml** - Verification request\n" +
    "3. **pacs.002-status.xml** - Transaction status\n" +
    "4. **pacs.002-payment-status.xml** - Payment status report\n" +
    "5. **pacs.002-payment-status-acsc.xml** - Success scenario\n" +
    "6. **pacs.002-payment-status-rjct.xml** - Rejection scenario\n" +
    "7. **pacs.002-payment-status-notfound.xml** - Not found scenario\n" +
    "\n" +
    "### Test Data Management\n" +
    "\n" +
    "**Creating Test Transactions:**\n" +
    "\n" +
    "```sql\n" +
    "INSERT INTO iso_messages (TxId, EndToEndId, BizMsgIdr, MsgDefIdr, MsgId, Status, CreatedAt)\n" +
    "VALUES ('TX-TEST-001', 'E2E-TEST-001', 'MSG-TEST-001', 'pacs.008.001.10', 'MSG-001', 'Pending', NOW());\n" +
    "```\n" +
    "\n" +
    "**Cleaning Up Test Data:**\n" +
    "\n" +
    "```sql\n" +
    "DELETE FROM iso_message_statuses WHERE ISOMessageId IN (SELECT Id FROM iso_messages WHERE TxId LIKE 'TX-TEST-%');\n" +
    "DELETE FROM transactions WHERE ISOMessageId IN (SELECT Id FROM iso_messages WHERE TxId LIKE 'TX-TEST-%');\n" +
    "DELETE FROM iso_messages WHERE TxId LIKE 'TX-TEST-%';\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Expected Results & Validation\n" +
    "\n" +
    "### Success Criteria\n" +
    "\n" +
    "Your implementation passes testing if:\n" +
    "\n" +
    "- ✅ All functional tests return HTTP 200\n" +
    "- ✅ Responses contain valid signed XML\n" +
    "- ✅ Database shows expected status updates\n" +
    "- ✅ No errors in application logs\n" +
    "- ✅ CoreBank callbacks invoked correctly\n" +
    "- ✅ All security tests pass\n" +
    "- ✅ Performance meets requirements\n" +
    "- ✅ Audit logs complete and accurate\n" +
    "\n" +
    "### Transaction Status Values\n" +
    "\n" +
    "- **Pending:** Initial state, awaiting processing\n" +
    "- **Success:** Transaction completed successfully\n" +
    "- **Failed:** Transaction failed (rejected or error)\n" +
    "- **ReadyForReturn:** Awaiting manual return processing\n" +
    "\n" +
    "### HTTP Status Codes\n" +
    "\n" +
    "- **200 OK:** Request processed successfully\n" +
    "- **400 Bad Request:** Invalid request format\n" +
    "- **401 Unauthorized:** Invalid signature or credentials\n" +
    "- **404 Not Found:** Transaction not found\n" +
    "- **429 Too Many Requests:** Rate limit exceeded\n" +
    "- **500 Internal Server Error:** Handler processing error\n" +
    "\n" +
    "### ISO 20022 Status Codes\n" +
    "\n" +
    "- **ACSC:** AcceptedSettlementCompleted\n" +
    "- **RJCT:** Rejected\n" +
    "- **PDNG:** Pending\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Additional Documentation\n" +
    "\n" +
    "### Reference Documents\n" +
    "\n" +
    "1. **test-scenarios.md** - Detailed test scenarios (460 lines)\n" +
    "2. **DATA_PROTECTION_KEY_SECURITY.md** - Data protection guide (452 lines)\n" +
    "3. **pki_docs.md** - Certificate management (177 lines)\n" +
    "4. **Readme.md** - Platform documentation (710 lines)\n" +
    "5. **TROUBLESHOOTING.md** - Troubleshooting guide\n" +
    "6. **QUICK_START.md** - Quick start guide\n" +
    "\n" +
    "### Support & Contact\n" +
    "\n" +
    "For issues or questions:\n" +
    "\n" +
    "- **Support Portal:** [www.support.sps.so](https://support.sps.so)\n" +
    "- Review test-scenarios.md for expected behaviors\n" +
    "- Check API logs for detailed error messages\n" +
    "- Verify test-config.json settings\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Test Report Template\n" +
    "\n" +
    "After running tests, provide this information:\n" +
    "\n" +
    "### Test Execution Summary\n" +
    "\n" +
    "- **Test Date:** [Date]\n" +
    "- **Tester:** [Name]\n" +
    "- **Environment:** [Dev/Staging/Production]\n" +
    "- **Total Tests:** [Number]\n" +
    "- **Passed:** [Number]\n" +
    "- **Failed:** [Number]\n" +
    "- **Success Rate:** [Percentage]\n" +
    "\n" +
    "### Failed Tests\n" +
    "\n" +
    "| Test Case | Expected | Actual   | Notes     |\n" +
    "| --------- | -------- | -------- | --------- |\n" +
    "| [Name]    | [Result] | [Result] | [Details] |\n" +
    "\n" +
    "### Security Findings\n" +
    "\n" +
    "| Severity | Finding       | Status        | Remediation |\n" +
    "| -------- | ------------- | ------------- | ----------- |\n" +
    "| [Level]  | [Description] | [Open/Closed] | [Action]    |\n" +
    "\n" +
    "### Performance Results\n" +
    "\n" +
    "- **Average Response Time:** [ms]\n" +
    "- **95th Percentile:** [ms]\n" +
    "- **Error Rate:** [%]\n" +
    "- **Throughput:** [requests/second]\n" +
    "\n" +
    "---\n" +
    "\n" +
    "**End of Test Documentation**\n" +
    "\n" +
    "_This document should be used in conjunction with the detailed test scenarios in `TestScripts/test-scenarios.md` and security documentation in `DATA_PROTECTION_KEY_SECURITY.md` and `pki_docs.md`._"

export default function TestCases() {
    return <MarkdownRenderer markdown={markdown} />;
}