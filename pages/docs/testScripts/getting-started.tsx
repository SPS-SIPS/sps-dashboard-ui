import MarkdownRenderer from "../../../component/MarkdownRenderer";
const markdown = "# SIPS Handler Test Scripts\n" +
    "\n" +
    "This directory contains automated test scripts and sample payloads for testing SIPS handlers from the API project.\n" +
    "\n" +
    "## Overview\n" +
    "\n" +
    "These scripts allow you to test the following handlers:\n" +
    "\n" +
    "1. **IncomingTransactionHandler** - Processes incoming pacs.008 payment requests\n" +
    "2. **IncomingVerificationHandler** - Processes acmt.023 verification requests\n" +
    "3. **IncomingTransactionStatusHandler** - Processes incoming pacs.002 status reports\n" +
    "4. **IncomingPaymentStatusReportHandler** - Processes pacs.002 payment status reports\n" +
    "\n" +
    "## Key Features\n" +
    "\n" +
    "✨ **Test Automation:**\n" +
    "\n" +
    "- ✅ Automated test runner with comprehensive reporting\n" +
    "- ✅ JSON output for CI/CD integration\n" +
    "- ✅ Retry logic for failed tests\n" +
    "- ✅ Response validation (XML structure, transaction IDs)\n" +
    "- ✅ Configurable timeouts\n" +
    "- ✅ Verbose mode for detailed debugging\n" +
    "- ✅ Color-coded output for better readability\n" +
    "- ✅ Test duration tracking\n" +
    "- ✅ Exit codes for automation\n" +
    "- ✅ Health check utilities\n" +
    "\n" +
    "## Directory Structure\n" +
    "\n" +
    "```\n" +
    "TestScripts/\n" +
    "├── README.md                           # This file\n" +
    "├── QUICK_START.md                      # Quick start guide\n" +
    "├── QUICK_REFERENCE.md                  # Quick reference for common commands\n" +
    "├── TEST_RUNNER_GUIDE.md                # Detailed test runner documentation\n" +
    "├── TROUBLESHOOTING.md                  # Troubleshooting guide\n" +
    "├── AUTOMATED_TESTING_SUMMARY.md        # Automated testing overview\n" +
    "├── JSON_PAYLOADS_SUMMARY.md            # JSON payload documentation\n" +
    "├── PAYLOAD_UPDATE_SUMMARY.md           # Payload update history\n" +
    "├── test-config.json                    # Test configuration file\n" +
    "├── test-scenarios.md                   # Detailed test scenarios\n" +
    "├── Payloads/                           # Sample XML and JSON payloads\n" +
    "│   ├── pacs.008.xml                    # Payment request\n" +
    "│   ├── acmt.023.xml                    # Verification request\n" +
    "│   ├── pacs.002-status.xml             # Transaction status\n" +
    "│   ├── pacs.002-payment-status.xml     # Payment status report\n" +
    "│   ├── pacs.002-payment-status-acsc.xml # Success scenario\n" +
    "│   ├── pacs.002-payment-status-rjct.xml # Rejection scenario\n" +
    "│   ├── pacs.002-payment-status-notfound.xml # Not found scenario\n" +
    "│   └── [JSON payloads for Gateway APIs]\n" +
    "├── run-all-tests.sh                    # Main test runner script\n" +
    "├── check-api.sh                        # API health check script\n" +
    "├── test-health.sh                      # Health endpoint test\n" +
    "├── postman-collection.json             # Postman collection\n" +
    "└── test-reports/                       # Generated test reports\n" +
    "\n" +
    "## Quick Start\n" +
    "\n" +
    "### Prerequisites\n" +
    "\n" +
    "1. Your API project is running (e.g., `http://localhost:5000`)\n" +
    "2. You have the necessary authentication/API keys configured (if required)\n" +
    "3. The handlers are properly registered in your API project\n" +
    "\n" +
    "### Using the Main Test Runner\n" +
    "\n" +
    "```bash\n" +
    "# Basic usage - runs all tests\n" +
    "./run-all-tests.sh\n" +
    "\n" +
    "# Specify custom base URL\n" +
    "./run-all-tests.sh http://localhost:5000\n" +
    "\n" +
    "# With verbose output for debugging\n" +
    "./run-all-tests.sh http://localhost:5000 --verbose\n" +
    "\n" +
    "# With retry logic (retry failed tests 3 times)\n" +
    "./run-all-tests.sh http://localhost:5000 --retry 3\n" +
    "\n" +
    "# With custom timeout (60 seconds)\n" +
    "./run-all-tests.sh http://localhost:5000 --timeout 60\n" +
    "\n" +
    "# All options combined\n" +
    "./run-all-tests.sh http://localhost:5000 --verbose --retry 3 --timeout 60\n" +
    "```\n" +
    "\n" +
    "### Check API Health\n" +
    "\n" +
    "```bash\n" +
    "# Check if API is running and healthy\n" +
    "./check-api.sh\n" +
    "\n" +
    "# Check specific URL\n" +
    "./check-api.sh https://localhost:443\n" +
    "\n" +
    "# Test health endpoint\n" +
    "./test-health.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "### Using Individual cURL Commands\n" +
    "\n" +
    "```bash\n" +
    "# All handlers use the same endpoint: /api/v1/incoming\n" +
    "# The API automatically routes to the correct handler based on message type\n" +
    "\n" +
    "# Test IncomingTransactionHandler (pacs.008)\n" +
    "curl -X POST http://localhost:5000/api/v1/incoming \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.008.xml\n" +
    "\n" +
    "# Test IncomingVerificationHandler (acmt.023)\n" +
    "curl -X POST http://localhost:5000/api/v1/incoming \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/acmt.023.xml\n" +
    "\n" +
    "# Test IncomingTransactionStatusHandler (pacs.002)\n" +
    "curl -X POST http://localhost:5000/api/v1/incoming \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.002-status.xml\n" +
    "\n" +
    "# Test IncomingPaymentStatusReportHandler (pacs.002)\n" +
    "curl -X POST http://localhost:5000/api/v1/incoming \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.002-payment-status.xml\n" +
    "```\n" +
    "\n" +
    "### Using Postman\n" +
    "\n" +
    "1. Import `postman-collection.json` into Postman\n" +
    "2. Update the `{{baseUrl}}` variable to your API endpoint (e.g., `http://localhost:5000`)\n" +
    "3. Run the collection or individual requests\n" +
    "\n" +
    "### Using Test Configuration\n" +
    "\n" +
    "Edit `test-config.json` to customize:\n" +
    "\n" +
    "- API base URLs for different environments\n" +
    "- Timeout and retry settings\n" +
    "- Payload file locations\n" +
    "- Validation options\n" +
    "\n" +
    "## Expected Responses\n" +
    "\n" +
    "### Success Scenarios\n" +
    "\n" +
    "All handlers should return a signed XML envelope on success:\n" +
    "\n" +
    "- **Status Code:** 200 OK\n" +
    "- **Content-Type:** application/xml\n" +
    "- **Body:** Signed FPEnvelope with appropriate response message\n" +
    "- **Validation:** Response contains `<FPEnvelope>` and transaction ID\n" +
    "\n" +
    "### Error Scenarios\n" +
    "\n" +
    "- **400 Bad Request:** Invalid XML format or missing required fields\n" +
    "- **401 Unauthorized:** Invalid signature\n" +
    "- **404 Not Found:** Transaction not found (for status handlers)\n" +
    "- **500 Internal Server Error:** Handler processing error\n" +
    "\n" +
    "## Test Output\n" +
    "\n" +
    "### Console Output\n" +
    "\n" +
    "The enhanced scripts provide detailed console output:\n" +
    "\n" +
    "```\n" +
    "==========================================\n" +
    "SIPS Handler Test Scripts - Enhanced\n" +
    "==========================================\n" +
    "Base URL: http://localhost:5000\n" +
    "Timeout: 30s\n" +
    "Retry Count: 0\n" +
    "JSON Output: false\n" +
    "Verbose: false\n" +
    "Start Time: 2024-11-16 10:35:00\n" +
    "==========================================\n" +
    "\n" +
    "=== Core Handler Tests ===\n" +
    "\n" +
    "[Test 1] IncomingTransactionHandler (pacs.008)\n" +
    "Endpoint: http://localhost:5000/api/v1/incoming\n" +
    "Payload: pacs.008.xml\n" +
    "✓ SUCCESS (HTTP 200) [0.45s]\n" +
    "  Valid XML response | TxId: AGROSOS0528910638962089436554484\n" +
    "\n" +
    "------------------------------------------\n" +
    "\n" +
    "...\n" +
    "\n" +
    "==========================================\n" +
    "Test Summary\n" +
    "==========================================\n" +
    "Total Tests:    7\n" +
    "Passed:         7\n" +
    "Failed:         0\n" +
    "Success Rate:   100.0%\n" +
    "Total Duration: 3s\n" +
    "End Time:       2024-11-16 10:35:03\n" +
    "==========================================\n" +
    "```\n" +
    "\n" +
    "### JSON Report Output\n" +
    "\n" +
    "When using `--json-output` or `-JsonOutput`, a JSON report is generated:\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"summary\": {\n" +
    "    \"total\": 7,\n" +
    "    \"passed\": 7,\n" +
    "    \"failed\": 0,\n" +
    "    \"success_rate\": 100.0,\n" +
    "    \"duration\": 3.2,\n" +
    "    \"start_time\": \"2024-11-16 10:35:00\",\n" +
    "    \"end_time\": \"2024-11-16 10:35:03\",\n" +
    "    \"base_url\": \"http://localhost:5000\"\n" +
    "  },\n" +
    "  \"tests\": [\n" +
    "    {\n" +
    "      \"test\": \"IncomingTransactionHandler (pacs.008)\",\n" +
    "      \"status\": \"passed\",\n" +
    "      \"http_code\": 200,\n" +
    "      \"response_time\": 0.45,\n" +
    "      \"duration\": 1\n" +
    "    }\n" +
    "  ]\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "### Exit Codes\n" +
    "\n" +
    "- **0:** All tests passed\n" +
    "- **1:** One or more tests failed\n" +
    "\n" +
    "This makes the scripts perfect for CI/CD pipelines.\n" +
    "\n" +
    "## Test Data\n" +
    "\n" +
    "All sample payloads use test data:\n" +
    "\n" +
    "- **Sender BIC:** SENDERBIC\n" +
    "- **Receiver BIC:** RECEIVERBIC\n" +
    "- **Test Transaction IDs:** TX-TEST-001, TX-TEST-002, etc.\n" +
    "- **Test Amounts:** Various amounts in USD\n" +
    "\n" +
    "## Customization\n" +
    "\n" +
    "### Customizing Test Data\n" +
    "\n" +
    "1. Edit the XML files in `Payloads/`\n" +
    "2. Update transaction IDs, amounts, account numbers as needed\n" +
    "3. Ensure your test database has matching records for status queries\n" +
    "\n" +
    "### Customizing Test Configuration\n" +
    "\n" +
    "Edit `test-config.json` to:\n" +
    "\n" +
    "- Change default base URLs\n" +
    "- Configure different environments (local, dev, staging, production)\n" +
    "- Adjust timeout and retry settings\n" +
    "- Enable/disable validation options\n" +
    "\n" +
    "### Adding New Tests\n" +
    "\n" +
    "To add new test scenarios, edit `run-all-tests.sh` and add your test:\n" +
    "\n" +
    "```bash\n" +
    "# Add to the test runner script\n" +
    "test_handler \\\n" +
    "    \"Your Test Name\" \\\n" +
    "    \"/api/v1/incoming\" \\\n" +
    "    \"$PAYLOADS_DIR/your-payload.xml\" \\\n" +
    "    200\n" +
    "```\n" +
    "\n" +
    "Or create a new payload file in the `Payloads/` directory and the test runner will automatically detect it based on the configuration in `test-config.json`.\n" +
    "\n" +
    "## CI/CD Integration\n" +
    "\n" +
    "### GitHub Actions Example\n" +
    "\n" +
    "```yaml\n" +
    "name: API Integration Tests\n" +
    "\n" +
    "on: [push, pull_request]\n" +
    "\n" +
    "jobs:\n" +
    "  test:\n" +
    "    runs-on: ubuntu-latest\n" +
    "    steps:\n" +
    "      - uses: actions/checkout@v3\n" +
    "\n" +
    "      - name: Start API\n" +
    "        run: |\n" +
    "          dotnet run --project SIPS.Connect.csproj &\n" +
    "          sleep 10\n" +
    "\n" +
    "      - name: Run Tests\n" +
    "        run: |\n" +
    "          cd TestScripts\n" +
    "          chmod +x run-all-tests.sh\n" +
    "          ./run-all-tests.sh http://localhost:5000 --retry 2\n" +
    "\n" +
    "      - name: Upload Test Report\n" +
    "        if: always()\n" +
    "        uses: actions/upload-artifact@v3\n" +
    "        with:\n" +
    "          name: test-report\n" +
    "          path: TestScripts/test-reports/*.json\n" +
    "```\n" +
    "\n" +
    "### GitLab CI Example\n" +
    "\n" +
    "```yaml\n" +
    "test:\n" +
    "  stage: test\n" +
    "  script:\n" +
    "    - cd TestScripts\n" +
    "    - chmod +x run-all-tests.sh\n" +
    "    - ./run-all-tests.sh http://localhost:5000 --retry 2\n" +
    "  artifacts:\n" +
    "    when: always\n" +
    "    paths:\n" +
    "      - TestScripts/test-reports/\n" +
    "    reports:\n" +
    "      junit: TestScripts/test-reports/*.xml\n" +
    "```\n" +
    "\n" +
    "## Troubleshooting\n" +
    "\n" +
    "### Common Issues\n" +
    "\n" +
    "1. **Connection Refused**\n" +
    "\n" +
    "   - Ensure the API is running on the specified port\n" +
    "   - Check firewall settings\n" +
    "   - Verify the base URL is correct\n" +
    "\n" +
    "2. **Timeout Errors**\n" +
    "\n" +
    "   - Increase timeout: `--timeout 60` or `-Timeout 60`\n" +
    "   - Check API performance and database connectivity\n" +
    "\n" +
    "3. **Signature Validation Fails**\n" +
    "\n" +
    "   - Ensure your API has the correct public key configured\n" +
    "   - Check that the XML signature is properly formatted\n" +
    "   - Verify certificate validity\n" +
    "\n" +
    "4. **Transaction Not Found**\n" +
    "\n" +
    "   - Verify the transaction exists in your database\n" +
    "   - Check the transaction ID matches exactly\n" +
    "   - Ensure database is seeded with test data\n" +
    "\n" +
    "5. **All Tests Failing**\n" +
    "   - Verify API endpoint: `/api/v1/incoming` (not `/api/incoming/*`)\n" +
    "   - Check API logs for errors\n" +
    "   - Ensure handlers are registered in DI container\n" +
    "   - Verify database connection string\n" +
    "\n" +
    "### Debug Mode\n" +
    "\n" +
    "For detailed debugging:\n" +
    "\n" +
    "```bash\n" +
    "# Verbose mode with detailed output\n" +
    "./run-all-tests.sh http://localhost:5000 --verbose\n" +
    "\n" +
    "# Check API connectivity\n" +
    "./check-api.sh http://localhost:5000\n" +
    "\n" +
    "# Test health endpoint\n" +
    "./test-health.sh http://localhost:5000\n" +
    "```\n" +
    "\n" +
    "## Additional Resources\n" +
    "\n" +
    "- **QUICK_START.md** - Quick start guide for getting started\n" +
    "- **QUICK_REFERENCE.md** - Quick reference for common commands\n" +
    "- **TEST_RUNNER_GUIDE.md** - Detailed test runner documentation\n" +
    "- **TROUBLESHOOTING.md** - Comprehensive troubleshooting guide\n" +
    "- **test-scenarios.md** - Detailed test scenarios and validation points\n" +
    "- **test-config.json** - Configuration file for test settings\n" +
    "- **AUTOMATED_TESTING_SUMMARY.md** - Automated testing overview\n" +
    "- **JSON_PAYLOADS_SUMMARY.md** - JSON payload documentation\n" +
    "- **PAYLOAD_UPDATE_SUMMARY.md** - Payload update history\n" +
    "\n" +
    "## Test Runner Features\n" +
    "\n" +
    "| Feature              | Status |\n" +
    "| -------------------- | ------ |\n" +
    "| Automated test execution | ✅ |\n" +
    "| Test statistics & reporting | ✅ |\n" +
    "| JSON output for CI/CD | ✅ |\n" +
    "| Retry logic | ✅ |\n" +
    "| Response validation | ✅ |\n" +
    "| Configurable timeout | ✅ |\n" +
    "| Verbose mode | ✅ |\n" +
    "| Exit codes for automation | ✅ |\n" +
    "| Health checks | ✅ |\n" +
    "| XML & JSON payload support | ✅ |\n" +
    "\n" +
    "## Support\n" +
    "\n" +
    "For issues or questions:\n" +
    "\n" +
    "1. Check the troubleshooting section above\n" +
    "2. Review test-scenarios.md for expected behaviors\n" +
    "3. Check API logs for detailed error messages\n" +
    "4. Verify test-config.json settings";

export default function GettingStarted() {
    return <MarkdownRenderer markdown={markdown} />;
}