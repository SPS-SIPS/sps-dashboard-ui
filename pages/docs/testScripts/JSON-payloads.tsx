import MarkdownRenderer from "../../../component/MarkdownRenderer";
const markdown = "# JSON Test Payloads - Summary\n" +
    "\n" +
    "**Date:** November 28, 2024  \n" +
    "**Created By:** System  \n" +
    "**Purpose:** Gateway APIs & CoreBank Callback Testing\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## ✅ What Was Created\n" +
    "\n" +
    "### New Directory Structure\n" +
    "\n" +
    "```\n" +
    "TestScripts/Payloads/\n" +
    "├── README.md (updated)\n" +
    "├── JSON/                              ← NEW DIRECTORY\n" +
    "│   ├── README.md                      ← Comprehensive documentation\n" +
    "│   ├── gateway-verify-request.json\n" +
    "│   ├── gateway-payment-request.json\n" +
    "│   ├── gateway-status-request.json\n" +
    "│   ├── gateway-return-request.json\n" +
    "│   ├── corebank-verification-request.json\n" +
    "│   ├── corebank-verification-response-success.json\n" +
    "│   ├── corebank-verification-response-miss.json\n" +
    "│   ├── corebank-payment-request.json\n" +
    "│   ├── corebank-payment-response-success.json\n" +
    "│   ├── corebank-payment-response-failed.json\n" +
    "│   ├── corebank-completion-notification.json\n" +
    "│   ├── corebank-return-request.json\n" +
    "│   ├── corebank-return-response-success.json\n" +
    "│   ├── somqr-merchant-request.json\n" +
    "│   └── somqr-person-request.json\n" +
    "└── [XML files...]\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📦 Files Created\n" +
    "\n" +
    "### Gateway API Payloads (4 files)\n" +
    "\n" +
    "These test **outbound** requests from CoreBank to SIPS Connect:\n" +
    "\n" +
    "1. **gateway-verify-request.json** - Account verification\n" +
    "   - Endpoint: `POST /api/v1/gateway/Verify`\n" +
    "   - Purpose: Verify account before payment\n" +
    "\n" +
    "2. **gateway-payment-request.json** - Payment initiation\n" +
    "   - Endpoint: `POST /api/v1/gateway/Payment`\n" +
    "   - Purpose: Send payment to another bank\n" +
    "\n" +
    "3. **gateway-status-request.json** - Status inquiry\n" +
    "   - Endpoint: `POST /api/v1/gateway/Status`\n" +
    "   - Purpose: Check transaction status\n" +
    "\n" +
    "4. **gateway-return-request.json** - Payment return\n" +
    "   - Endpoint: `POST /api/v1/gateway/Return`\n" +
    "   - Purpose: Reverse/return a payment\n" +
    "\n" +
    "### CoreBank Callback Payloads (9 files)\n" +
    "\n" +
    "These test **inbound** callbacks from SIPS Connect to CoreBank:\n" +
    "\n" +
    "5. **corebank-verification-request.json** - Verification callback\n" +
    "   - Simulates: SIPS calling CoreBank to verify account\n" +
    "   - Triggered by: Incoming acmt.023\n" +
    "\n" +
    "6. **corebank-verification-response-success.json** - Account found\n" +
    "   - Response: Account exists and active\n" +
    "\n" +
    "7. **corebank-verification-response-miss.json** - Account not found\n" +
    "   - Response: Account doesn't exist\n" +
    "\n" +
    "8. **corebank-payment-request.json** - Payment callback\n" +
    "   - Simulates: SIPS calling CoreBank to credit account\n" +
    "   - Triggered by: Incoming pacs.008\n" +
    "\n" +
    "9. **corebank-payment-response-success.json** - Payment successful\n" +
    "   - Response: Account credited successfully\n" +
    "\n" +
    "10. **corebank-payment-response-failed.json** - Payment failed\n" +
    "    - Response: Insufficient funds, account blocked, etc.\n" +
    "\n" +
    "11. **corebank-completion-notification.json** - Settlement complete\n" +
    "    - Simulates: SIPS notifying CoreBank of settlement\n" +
    "    - Triggered by: Incoming pacs.002 ACSC\n" +
    "\n" +
    "12. **corebank-return-request.json** - Return callback\n" +
    "    - Simulates: SIPS calling CoreBank to process return\n" +
    "    - Triggered by: Incoming pacs.004\n" +
    "\n" +
    "13. **corebank-return-response-success.json** - Return processed\n" +
    "    - Response: Funds returned successfully\n" +
    "\n" +
    "### SomQR API Payloads (2 files)\n" +
    "\n" +
    "14. **somqr-merchant-request.json** - Generate merchant QR\n" +
    "    - Endpoint: `POST /api/v1/somqr/GenerateMerchantQR`\n" +
    "    - Purpose: POS/merchant payment QR code\n" +
    "\n" +
    "15. **somqr-person-request.json** - Generate person QR\n" +
    "    - Endpoint: `POST /api/v1/somqr/GeneratePersonQR`\n" +
    "    - Purpose: P2P payment QR code\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🎯 Key Features\n" +
    "\n" +
    "### Real-World Data\n" +
    "\n" +
    "All payloads use **real transaction data**:\n" +
    "- ✅ Actual bank BICs: ZKBASOS0, AGROSOS0\n" +
    "- ✅ Real account numbers: SO120010201402005007303\n" +
    "- ✅ Production transaction IDs: ZKBASOS0533212638999283678329850\n" +
    "- ✅ Correct field mappings from jsonAdapter.json\n" +
    "\n" +
    "### Complete Coverage\n" +
    "\n" +
    "| API Category | Endpoints Covered | Payloads |\n" +
    "|--------------|-------------------|----------|\n" +
    "| **Gateway APIs** | 4 endpoints | 4 files |\n" +
    "| **CoreBank Callbacks** | 5 callback types | 9 files |\n" +
    "| **SomQR APIs** | 2 endpoints | 2 files |\n" +
    "| **Total** | **11 endpoints** | **15 files** |\n" +
    "\n" +
    "### Field Mappings\n" +
    "\n" +
    "All payloads follow the field mappings defined in `/jsonAdapter.json`:\n" +
    "\n" +
    "**Example:**\n" +
    "- **Your JSON field:** `\"amount\": 9.88`\n" +
    "- **Internal field:** `Amount`\n" +
    "- **ISO 20022 XML:** `<IntrBkSttlmAmt Ccy=\"USD\">9.88</IntrBkSttlmAmt>`\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔧 Usage Examples\n" +
    "\n" +
    "### Test Gateway Payment API\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST http://localhost:5000/api/v1/gateway/Payment \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"X-API-KEY: your-api-key\" \\\n" +
    "  -H \"X-API-SECRET: your-api-secret\" \\\n" +
    "  -d @TestScripts/Payloads/JSON/gateway-payment-request.json\n" +
    "```\n" +
    "\n" +
    "### Test Gateway Verify API\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST http://localhost:5000/api/v1/gateway/Verify \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"X-API-KEY: your-api-key\" \\\n" +
    "  -H \"X-API-SECRET: your-api-secret\" \\\n" +
    "  -d @TestScripts/Payloads/JSON/gateway-verify-request.json\n" +
    "```\n" +
    "\n" +
    "### Simulate CoreBank Callback\n" +
    "\n" +
    "```bash\n" +
    "# Simulate SIPS calling your CoreBank payment endpoint\n" +
    "curl -X POST http://your-corebank-url/payment \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"ApiKey: your-api-key\" \\\n" +
    "  -H \"ApiSecret: your-api-secret\" \\\n" +
    "  -d @TestScripts/Payloads/JSON/corebank-payment-request.json\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📊 Authentication Methods\n" +
    "\n" +
    "### Gateway APIs (Client → SIPS)\n" +
    "\n" +
    "**Option 1: API Keys (Recommended)**\n" +
    "```bash\n" +
    "-H \"X-API-KEY: your-api-key\"\n" +
    "-H \"X-API-SECRET: your-api-secret\"\n" +
    "```\n" +
    "\n" +
    "**Option 2: JWT Bearer Token**\n" +
    "```bash\n" +
    "-H \"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"\n" +
    "```\n" +
    "\n" +
    "### CoreBank Callbacks (SIPS → CoreBank)\n" +
    "\n" +
    "**API Keys (Different Casing!)**\n" +
    "```bash\n" +
    "-H \"ApiKey: your-api-key\"\n" +
    "-H \"ApiSecret: your-api-secret\"\n" +
    "```\n" +
    "\n" +
    "⚠️ **Important:** Note the header name differences:\n" +
    "- Client → SIPS: `X-API-KEY` / `X-API-SECRET`\n" +
    "- SIPS → CoreBank: `ApiKey` / `ApiSecret`\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔄 Message Flow\n" +
    "\n" +
    "### Outbound Payment (Gateway API)\n" +
    "\n" +
    "```\n" +
    "CoreBank → SIPS Connect → SVIP\n" +
    "  (JSON)      (XML ISO 20022)\n" +
    "```\n" +
    "\n" +
    "1. CoreBank sends JSON to `/api/v1/gateway/Payment`\n" +
    "2. SIPS converts to pacs.008 XML\n" +
    "3. SIPS signs with private key\n" +
    "4. SIPS sends to SVIP\n" +
    "5. SIPS receives pacs.002 response\n" +
    "6. SIPS converts to JSON\n" +
    "7. SIPS returns JSON to CoreBank\n" +
    "\n" +
    "### Inbound Payment (Callback)\n" +
    "\n" +
    "```\n" +
    "SVIP → SIPS Connect → CoreBank\n" +
    "  (XML ISO 20022)    (JSON)\n" +
    "```\n" +
    "\n" +
    "1. SVIP sends signed pacs.008 XML\n" +
    "2. SIPS validates signature\n" +
    "3. SIPS converts to JSON\n" +
    "4. SIPS calls CoreBank `/payment` endpoint\n" +
    "5. CoreBank processes and responds\n" +
    "6. SIPS converts response to pacs.002\n" +
    "7. SIPS signs and sends to SVIP\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📝 Documentation\n" +
    "\n" +
    "### Comprehensive README\n" +
    "\n" +
    "Created **`Payloads/JSON/README.md`** with:\n" +
    "- ✅ Complete payload inventory\n" +
    "- ✅ Field mapping explanations\n" +
    "- ✅ Testing scenarios\n" +
    "- ✅ Authentication guide\n" +
    "- ✅ Customization instructions\n" +
    "- ✅ Troubleshooting tips\n" +
    "- ✅ Workflow diagrams\n" +
    "- ✅ Response format examples\n" +
    "\n" +
    "### Updated Main README\n" +
    "\n" +
    "Updated **`Payloads/README.md`** to:\n" +
    "- ✅ Reference JSON subdirectory\n" +
    "- ✅ Show directory structure\n" +
    "- ✅ Clarify XML vs JSON payloads\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🧪 Testing Scenarios\n" +
    "\n" +
    "### Scenario 1: Complete Payment Flow\n" +
    "\n" +
    "```bash\n" +
    "# 1. Verify account\n" +
    "curl -X POST http://localhost:5000/api/v1/gateway/Verify \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"X-API-KEY: key\" -H \"X-API-SECRET: secret\" \\\n" +
    "  -d @JSON/gateway-verify-request.json\n" +
    "\n" +
    "# 2. Send payment\n" +
    "curl -X POST http://localhost:5000/api/v1/gateway/Payment \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"X-API-KEY: key\" -H \"X-API-SECRET: secret\" \\\n" +
    "  -d @JSON/gateway-payment-request.json\n" +
    "\n" +
    "# 3. Check status\n" +
    "curl -X POST http://localhost:5000/api/v1/gateway/Status \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"X-API-KEY: key\" -H \"X-API-SECRET: secret\" \\\n" +
    "  -d @JSON/gateway-status-request.json\n" +
    "```\n" +
    "\n" +
    "### Scenario 2: CoreBank Integration Testing\n" +
    "\n" +
    "Use CoreBank callback payloads to test your endpoints:\n" +
    "\n" +
    "```bash\n" +
    "# Test your verification endpoint\n" +
    "curl -X POST http://your-bank/verify \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"ApiKey: key\" -H \"ApiSecret: secret\" \\\n" +
    "  -d @JSON/corebank-verification-request.json\n" +
    "\n" +
    "# Test your payment endpoint\n" +
    "curl -X POST http://your-bank/payment \\\n" +
    "  -H \"Content-Type: application/json\" \\\n" +
    "  -H \"ApiKey: key\" -H \"ApiSecret: secret\" \\\n" +
    "  -d @JSON/corebank-payment-request.json\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🎨 Customization\n" +
    "\n" +
    "### Change Transaction IDs\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"localId\": \"YOUR-BANK-REF-123\",\n" +
    "  \"txId\": \"YOURBANK0\" + timestamp\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "### Change Amounts\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"amount\": 100.00,\n" +
    "  \"currency\": \"USD\"  // or \"SOS\"\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "### Change Accounts\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"drAccount\": \"YOUR-CUSTOMER-ACCOUNT\",\n" +
    "  \"crAccount\": \"BENEFICIARY-ACCOUNT\"\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔍 Validation\n" +
    "\n" +
    "### JSON Validation\n" +
    "\n" +
    "```bash\n" +
    "# Validate all JSON files\n" +
    "cd TestScripts/Payloads/JSON\n" +
    "for file in *.json; do\n" +
    "  echo \"Validating $file...\"\n" +
    "  jq empty \"$file\" && echo \"✅ Valid\" || echo \"❌ Invalid\"\n" +
    "done\n" +
    "```\n" +
    "\n" +
    "### Field Mapping Validation\n" +
    "\n" +
    "Check that all fields match `/jsonAdapter.json`:\n" +
    "\n" +
    "```bash\n" +
    "# Compare payload fields with jsonAdapter.json\n" +
    "jq '.Endpoints.PaymentRequest.FieldMappings[].UserField' jsonAdapter.json\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📚 Related Files\n" +
    "\n" +
    "### Configuration\n" +
    "- **jsonAdapter.json** - Field mapping definitions\n" +
    "- **test-config.json** - Test configuration (needs update for JSON)\n" +
    "\n" +
    "### Documentation\n" +
    "- **Payloads/README.md** - XML payloads documentation\n" +
    "- **Payloads/JSON/README.md** - JSON payloads documentation (NEW)\n" +
    "- **Readme.md** - Main SIPS Connect documentation\n" +
    "- **test-scenarios.md** - Test scenarios\n" +
    "\n" +
    "### Test Scripts\n" +
    "- **test-handlers.ps1** - PowerShell test script (XML only)\n" +
    "- **curl-examples.sh** - Bash test script (XML only)\n" +
    "- **postman-collection.json** - Postman collection\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## ⏭️ Next Steps\n" +
    "\n" +
    "### Immediate\n" +
    "\n" +
    "1. ✅ **JSON Payloads Created** - 15 files\n" +
    "2. ✅ **Documentation Created** - Comprehensive README\n" +
    "3. ⏳ **Create JSON Test Scripts** - PowerShell/Bash scripts for JSON APIs\n" +
    "4. ⏳ **Update Postman Collection** - Add JSON payload examples\n" +
    "5. ⏳ **Update test-config.json** - Add JSON payload references\n" +
    "\n" +
    "### Future Enhancements\n" +
    "\n" +
    "1. **Automated Tests** - Create test suite for Gateway APIs\n" +
    "2. **Mock CoreBank** - Create mock server for callback testing\n" +
    "3. **Validation Scripts** - Validate JSON against schemas\n" +
    "4. **Performance Tests** - Load testing for Gateway APIs\n" +
    "5. **Integration Tests** - End-to-end flow testing\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 💡 Benefits\n" +
    "\n" +
    "### For Developers\n" +
    "\n" +
    "✅ **Complete API Coverage** - All Gateway and CoreBank APIs covered  \n" +
    "✅ **Real Data** - Production-like test data  \n" +
    "✅ **Easy Testing** - Copy-paste curl commands  \n" +
    "✅ **Clear Documentation** - Comprehensive guides  \n" +
    "\n" +
    "### For QA/Testers\n" +
    "\n" +
    "✅ **Ready-to-Use** - No payload creation needed  \n" +
    "✅ **Multiple Scenarios** - Success, failure, edge cases  \n" +
    "✅ **Clear Examples** - Step-by-step testing guides  \n" +
    "✅ **Validation Tools** - JSON validation commands  \n" +
    "\n" +
    "### For Integration Partners\n" +
    "\n" +
    "✅ **API Examples** - Real request/response examples  \n" +
    "✅ **Field Mappings** - Clear field documentation  \n" +
    "✅ **Authentication Guide** - Both methods documented  \n" +
    "✅ **Callback Simulation** - Test your endpoints easily  \n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🆘 Support\n" +
    "\n" +
    "### Common Issues\n" +
    "\n" +
    "**Issue: 401 Unauthorized**\n" +
    "- Check API key/secret are correct\n" +
    "- Verify header names (X-API-KEY vs ApiKey)\n" +
    "\n" +
    "**Issue: 400 Bad Request**\n" +
    "- Validate JSON syntax: `jq . file.json`\n" +
    "- Check field names match jsonAdapter.json\n" +
    "\n" +
    "**Issue: Field Not Mapped**\n" +
    "- Review jsonAdapter.json for correct field names\n" +
    "- Check field type (string, double, datetime, bool)\n" +
    "\n" +
    "### Getting Help\n" +
    "\n" +
    "1. Check **Payloads/JSON/README.md** for detailed documentation\n" +
    "2. Review **jsonAdapter.json** for field mappings\n" +
    "3. Check application logs for error details\n" +
    "4. Contact SIPS Connect team for support\n" +
    "\n" +
    "---\n" +
    "\n" +
    "**Summary:** Successfully created 15 JSON test payloads covering all Gateway APIs, CoreBank callbacks, and SomQR APIs, with comprehensive documentation and usage examples! 🚀";

export default function JSONPayloads() {
    return <MarkdownRenderer markdown={markdown} />;
}