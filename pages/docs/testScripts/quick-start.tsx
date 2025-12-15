import MarkdownRenderer from "../../../component/MarkdownRenderer";

const markdown = "# Quick Start Guide - SIPS API Testing\n" +
    "\n" +
    "## Prerequisites\n" +
    "\n" +
    "- .NET 8.0 SDK installed\n" +
    "- Your API project with SIPS handlers configured\n" +
    "- Terminal/Command Prompt access\n" +
    "\n" +
    "## Step 1: Start Your API\n" +
    "\n" +
    "```bash\n" +
    "# Navigate to your API project directory\n" +
    "cd /path/to/your/api/project\n" +
    "\n" +
    "# Start the API (adjust command as needed)\n" +
    "dotnet run\n" +
    "# or\n" +
    "dotnet watch\n" +
    "```\n" +
    "\n" +
    "**Note:** Keep this terminal open - the API will run here and show logs.\n" +
    "\n" +
    "**Default URL:** The scripts assume your API runs on `https://localhost:443`. If your API uses a different URL, pass it as a parameter.\n" +
    "\n" +
    "## Step 2: Verify API is Running\n" +
    "\n" +
    "Open a **new terminal** and run:\n" +
    "\n" +
    "```bash\n" +
    "cd /path/to/TestScripts\n" +
    "\n" +
    "# Check API health (uses http://localhost:443 by default)\n" +
    "./check-api.sh\n" +
    "\n" +
    "# Or specify a custom URL\n" +
    "./check-api.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "You should see:\n" +
    "\n" +
    "```\n" +
    "✅ API is reachable!\n" +
    "   HTTP Status: 200\n" +
    "```\n" +
    "\n" +
    "## Step 3: Run the Tests\n" +
    "\n" +
    "```bash\n" +
    "# Basic test run (uses default http://localhost:443)\n" +
    "./curl-examples.sh\n" +
    "\n" +
    "# Specify custom URL\n" +
    "./curl-examples.sh https://localhost:443\n" +
    "\n" +
    "# With verbose output for debugging\n" +
    "./curl-examples.sh https://localhost:443 --verbose\n" +
    "\n" +
    "# With JSON output for CI/CD\n" +
    "./curl-examples.sh https://localhost:443 --json-output\n" +
    "\n" +
    "# With retry logic\n" +
    "./curl-examples.sh https://localhost:443 --retry 3\n" +
    "\n" +
    "# All options combined\n" +
    "./curl-examples.sh https://localhost:443 --json-output --verbose --retry 3 --timeout 60\n" +
    "```\n" +
    "\n" +
    "## Expected Output\n" +
    "\n" +
    "```\n" +
    "==========================================\n" +
    "SIPS Handler Test Scripts - Enhanced\n" +
    "==========================================\n" +
    "Base URL: http://localhost:443\n" +
    "Timeout: 30s\n" +
    "Retry Count: 0\n" +
    "JSON Output: false\n" +
    "Verbose: false\n" +
    "Start Time: 2024-11-16 10:50:00\n" +
    "==========================================\n" +
    "\n" +
    "=== Core Handler Tests ===\n" +
    "\n" +
    "[Test 1] IncomingTransactionHandler (pacs.008)\n" +
    "Endpoint: http://localhost:443/api/v1/incoming\n" +
    "Payload: pacs.008.xml\n" +
    "✓ SUCCESS (HTTP 200) [0.45s]\n" +
    "  Valid XML response\n" +
    "\n" +
    "------------------------------------------\n" +
    "...\n" +
    "\n" +
    "==========================================\n" +
    "Test Summary\n" +
    "==========================================\n" +
    "Total Tests:    7\n" +
    "Passed:         7\n" +
    "Failed:         0\n" +
    "Success Rate:   100.0%\n" +
    "Total Duration: 1s\n" +
    "==========================================\n" +
    "```\n" +
    "\n" +
    "## Troubleshooting\n" +
    "\n" +
    "### API Not Reachable (HTTP 000)\n" +
    "\n" +
    "1. Make sure your API is running: `dotnet run` or `dotnet watch`\n" +
    "2. Check if the port is in use: `lsof -i :443` (or your port)\n" +
    "3. Verify the base URL matches your API configuration\n" +
    "4. For HTTPS endpoints, the scripts support self-signed certificates\n" +
    "\n" +
    "### HTTP 403 Forbidden\n" +
    "\n" +
    "This may be expected if:\n" +
    "\n" +
    "- The endpoint requires authentication\n" +
    "- The payload needs a valid signature\n" +
    "- CORS settings are blocking the request\n" +
    "- Check your API logs for detailed error messages\n" +
    "\n" +
    "### Tests Failing\n" +
    "\n" +
    "1. Use verbose mode: `./curl-examples.sh https://localhost:443 --verbose`\n" +
    "2. Check your API logs for error details\n" +
    "3. Verify payload files exist in `Payloads/` directory\n" +
    "4. Ensure handlers are properly registered in your DI container\n" +
    "5. Review `TROUBLESHOOTING.md` for detailed help\n" +
    "\n" +
    "## Quick Start Guide - SIPS Handler Testing\n" +
    "\n" +
    "## 🚀 Get Started in 5 Minutes\n" +
    "\n" +
    "### Step 1: Ensure Your API is Running\n" +
    "\n" +
    "```bash\n" +
    "# Start your API project (adjust command as needed)\n" +
    "cd /path/to/your/api/project\n" +
    "dotnet run\n" +
    "```\n" +
    "\n" +
    "Your API should be accessible at `http://localhost:443` (or your configured port).\n" +
    "\n" +
    "### Step 2: Choose Your Testing Method\n" +
    "\n" +
    "#### Option A: Using Bash Script (Mac/Linux)\n" +
    "\n" +
    "```bash\n" +
    "cd /path/to/SIPS.Core.Tests/TestScripts\n" +
    "./curl-examples.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "#### Option B: Using PowerShell (Windows)\n" +
    "\n" +
    "```powershell\n" +
    "cd \\path\\to\\SIPS.Core.Tests\\TestScripts\n" +
    ".\\test-handlers.ps1 -BaseUrl \"https://localhost:443\"\n" +
    "```\n" +
    "\n" +
    "#### Option C: Using cURL Manually\n" +
    "\n" +
    "```bash\n" +
    "# Test IncomingTransactionHandler\n" +
    "curl -X POST https://localhost:443/api/incoming/transaction \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.008.xml\n" +
    "\n" +
    "# Test IncomingPaymentStatusReportHandler\n" +
    "curl -X POST https://localhost:443/api/incoming/payment-status \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.002-payment-status.xml\n" +
    "```\n" +
    "\n" +
    "#### Option D: Using Postman\n" +
    "\n" +
    "1. Open Postman\n" +
    "2. Import `postman-collection.json`\n" +
    "3. Set the `baseUrl` variable to your API endpoint\n" +
    "4. Run the collection or individual requests\n" +
    "\n" +
    "### Step 3: Verify Results\n" +
    "\n" +
    "**Success Response:**\n" +
    "\n" +
    "- HTTP Status: 200 OK\n" +
    "- Content-Type: application/xml\n" +
    "- Body: Signed FPEnvelope with response message\n" +
    "\n" +
    "**Check Database:**\n" +
    "\n" +
    "```sql\n" +
    "-- View recent transactions\n" +
    "SELECT TxId, Status, Reason, CreatedAt\n" +
    "FROM iso_messages\n" +
    "ORDER BY CreatedAt DESC\n" +
    "LIMIT 10;\n" +
    "\n" +
    "-- View status updates\n" +
    "SELECT ims.*, im.TxId\n" +
    "FROM iso_message_statuses ims\n" +
    "JOIN iso_messages im ON ims.ISOMessageId = im.Id\n" +
    "ORDER BY ims.CreatedAt DESC\n" +
    "LIMIT 10;\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📋 Handler Endpoints Reference\n" +
    "\n" +
    "Adjust these endpoints to match your API routing:\n" +
    "\n" +
    "| Handler                            | Endpoint                       | Message Type |\n" +
    "| ---------------------------------- | ------------------------------ | ------------ |\n" +
    "| IncomingTransactionHandler         | `/api/incoming/transaction`    | pacs.008     |\n" +
    "| IncomingVerificationHandler        | `/api/incoming/verification`   | acmt.023     |\n" +
    "| IncomingTransactionStatusHandler   | `/api/incoming/status`         | pacs.002     |\n" +
    "| IncomingPaymentStatusReportHandler | `/api/incoming/payment-status` | pacs.002     |\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🧪 Common Test Scenarios\n" +
    "\n" +
    "### 1. Test Successful Payment\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST https://localhost:443/api/incoming/payment-status \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.002-payment-status-acsc.xml\n" +
    "```\n" +
    "\n" +
    "**Expected:** Transaction status updated to Success\n" +
    "\n" +
    "### 2. Test Rejected Payment\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST https://localhost:443/api/incoming/payment-status \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.002-payment-status-rjct.xml\n" +
    "```\n" +
    "\n" +
    "**Expected:** Transaction status updated to Failed\n" +
    "\n" +
    "### 3. Test Transaction Not Found\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST https://localhost:443/api/incoming/payment-status \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.002-payment-status-notfound.xml\n" +
    "```\n" +
    "\n" +
    "**Expected:** HTTP 404 or admi.002 error response\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔧 Customizing Test Data\n" +
    "\n" +
    "### Update Transaction IDs\n" +
    "\n" +
    "Edit the XML files in `Payloads/` to match your test data:\n" +
    "\n" +
    "```xml\n" +
    "<!-- Change this -->\n" +
    "<document:OrgnlTxId>TX-TEST-001</document:OrgnlTxId>\n" +
    "\n" +
    "<!-- To match your database -->\n" +
    "<document:OrgnlTxId>YOUR-TRANSACTION-ID</document:OrgnlTxId>\n" +
    "```\n" +
    "\n" +
    "### Create Test Transactions\n" +
    "\n" +
    "Before testing status handlers, ensure transactions exist:\n" +
    "\n" +
    "```sql\n" +
    "INSERT INTO iso_messages (TxId, EndToEndId, Status, CreatedAt)\n" +
    "VALUES ('TX-TEST-001', 'E2E-TEST-001', 'Pending', NOW());\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## ❗ Troubleshooting\n" +
    "\n" +
    "### Issue: Connection Refused\n" +
    "\n" +
    "**Solution:** Ensure your API is running\n" +
    "\n" +
    "```bash\n" +
    "# Check if API is running\n" +
    "curl https://localhost:443/health  # or your health endpoint\n" +
    "```\n" +
    "\n" +
    "### Issue: 401 Unauthorized\n" +
    "\n" +
    "**Solution:** Signature validation failing\n" +
    "\n" +
    "- Check public key configuration\n" +
    "- Verify XML signature is valid\n" +
    "- Ensure certificates are not expired\n" +
    "\n" +
    "### Issue: 404 Not Found\n" +
    "\n" +
    "**Solution:** Endpoint not configured\n" +
    "\n" +
    "- Verify API routing configuration\n" +
    "- Check handler registration in DI container\n" +
    "- Confirm endpoint URLs match your API\n" +
    "\n" +
    "### Issue: Transaction Not Found\n" +
    "\n" +
    "**Solution:** Test data not seeded\n" +
    "\n" +
    "```sql\n" +
    "-- Check if transaction exists\n" +
    "SELECT * FROM iso_messages WHERE TxId = 'TX-TEST-001';\n" +
    "\n" +
    "-- If not, insert it\n" +
    "INSERT INTO iso_messages (TxId, EndToEndId, Status, CreatedAt)\n" +
    "VALUES ('TX-TEST-001', 'E2E-TEST-001', 'Pending', NOW());\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📚 Next Steps\n" +
    "\n" +
    "1. **Review Detailed Scenarios:** See `test-scenarios.md` for comprehensive test cases\n" +
    "2. **Customize Payloads:** Edit XML files in `Payloads/` directory\n" +
    "3. **Automate Testing:** Integrate scripts into your CI/CD pipeline\n" +
    "4. **Monitor Logs:** Check application logs for detailed error messages\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🎯 Success Criteria\n" +
    "\n" +
    "Your handlers are working correctly if:\n" +
    "\n" +
    "- ✅ All test scripts return HTTP 200\n" +
    "- ✅ Responses contain valid signed XML\n" +
    "- ✅ Database shows expected status updates\n" +
    "- ✅ No errors in application logs\n" +
    "- ✅ CoreBank callbacks are invoked (where applicable)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📞 Need Help?\n" +
    "\n" +
    "- See `README.md` for full documentation\n" +
    "- See `test-scenarios.md` for detailed test cases\n" +
    "- Check application logs for error details\n" +
    "- Review unit tests in `../Tests/` for expected behavior\n" +
    "\n" +
    "---\n" +
    "\n" +
    "**Happy Testing! 🚀**";

export default function TestRunnerGuide() {
    return <MarkdownRenderer markdown={markdown}/>;
}