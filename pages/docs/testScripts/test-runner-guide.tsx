import MarkdownRenderer from "../../../component/MarkdownRenderer";
const markdown = "# SIPS Connect - Automated Test Runner Guide\n" +
    "\n" +
    "**Version:** 1.0  \n" +
    "**Last Updated:** November 28, 2024\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🚀 Quick Start\n" +
    "\n" +
    "### Basic Usage (No Authentication)\n" +
    "\n" +
    "```bash\n" +
    "# Run all tests without authentication\n" +
    "./run-all-tests.sh --skip-auth\n" +
    "\n" +
    "# Run with custom URL\n" +
    "./run-all-tests.sh --url https://localhost:443 --skip-auth\n" +
    "```\n" +
    "\n" +
    "### With Authentication\n" +
    "\n" +
    "```bash\n" +
    "# Run with API key authentication\n" +
    "./run-all-tests.sh \\\n" +
    "  --url http://localhost:5000 \\\n" +
    "  --api-key \"your-api-key\" \\\n" +
    "  --api-secret \"your-api-secret\"\n" +
    "```\n" +
    "\n" +
    "### Generate Reports\n" +
    "\n" +
    "```bash\n" +
    "# Generate both JSON and HTML reports (default)\n" +
    "./run-all-tests.sh --skip-auth\n" +
    "\n" +
    "# Generate only JSON report\n" +
    "./run-all-tests.sh --skip-auth --format json\n" +
    "\n" +
    "# Generate only HTML report\n" +
    "./run-all-tests.sh --skip-auth --format html\n" +
    "\n" +
    "# Custom report directory\n" +
    "./run-all-tests.sh --skip-auth --report-dir ./my-reports\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📋 Command Line Options\n" +
    "\n" +
    "| Option | Description | Default | Example |\n" +
    "|--------|-------------|---------|---------|\n" +
    "| `--url URL` | API base URL | `http://localhost:5000` | `--url https://api.example.com` |\n" +
    "| `--api-key KEY` | API key for authentication | None | `--api-key \"abc123\"` |\n" +
    "| `--api-secret SECRET` | API secret for authentication | None | `--api-secret \"xyz789\"` |\n" +
    "| `--skip-auth` | Skip authentication headers | false | `--skip-auth` |\n" +
    "| `--report-dir DIR` | Report output directory | `./test-reports` | `--report-dir ./reports` |\n" +
    "| `--format FORMAT` | Report format: json, html, both | `both` | `--format json` |\n" +
    "| `--verbose` | Show detailed output | false | `--verbose` |\n" +
    "| `--help` | Show help message | - | `--help` |\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📊 Test Coverage\n" +
    "\n" +
    "The automated test runner executes the following tests:\n" +
    "\n" +
    "### XML Message Tests (7 tests)\n" +
    "\n" +
    "1. ✅ Payment Request (pacs.008)\n" +
    "2. ✅ Verification Request (acmt.023)\n" +
    "3. ✅ Transaction Status (pacs.002)\n" +
    "4. ✅ Payment Status - ACSC (Success)\n" +
    "5. ✅ Payment Status - RJCT (Rejection)\n" +
    "6. ✅ Return Request (pacs.004)\n" +
    "7. ✅ Status Request (pacs.028)\n" +
    "\n" +
    "### Gateway API Tests (4 tests)\n" +
    "\n" +
    "8. ✅ Gateway - Verify Account\n" +
    "9. ✅ Gateway - Payment Request\n" +
    "10. ✅ Gateway - Status Request\n" +
    "11. ✅ Gateway - Return Request\n" +
    "\n" +
    "### SomQR API Tests (2 tests)\n" +
    "\n" +
    "12. ✅ SomQR - Generate Merchant QR\n" +
    "13. ✅ SomQR - Generate Person QR\n" +
    "\n" +
    "**Total:** 13 automated tests\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📁 Report Formats\n" +
    "\n" +
    "### JSON Report\n" +
    "\n" +
    "**File:** `test-reports/test-report-YYYYMMDD_HHMMSS.json`\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"summary\": {\n" +
    "    \"total\": 13,\n" +
    "    \"passed\": 11,\n" +
    "    \"failed\": 2,\n" +
    "    \"skipped\": 0,\n" +
    "    \"success_rate\": 84.6,\n" +
    "    \"duration\": 5,\n" +
    "    \"start_time\": \"2024-11-28 15:30:00\",\n" +
    "    \"end_time\": \"2024-11-28 15:30:05\",\n" +
    "    \"base_url\": \"http://localhost:5000\",\n" +
    "    \"authentication\": true\n" +
    "  },\n" +
    "  \"tests\": [\n" +
    "    {\n" +
    "      \"test\": \"Payment Request (pacs.008)\",\n" +
    "      \"status\": \"passed\",\n" +
    "      \"http_code\": 200,\n" +
    "      \"duration\": 0.45,\n" +
    "      \"tx_id\": \"ZKBASOS0533212638999283678329850\"\n" +
    "    },\n" +
    "    {\n" +
    "      \"test\": \"Gateway - Verify Account\",\n" +
    "      \"status\": \"failed\",\n" +
    "      \"http_code\": 403,\n" +
    "      \"expected\": 200,\n" +
    "      \"duration\": 0.12\n" +
    "    }\n" +
    "  ]\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "### HTML Report\n" +
    "\n" +
    "**File:** `test-reports/test-report-YYYYMMDD_HHMMSS.html`\n" +
    "\n" +
    "Interactive HTML report with:\n" +
    "- ✅ Visual summary dashboard\n" +
    "- ✅ Color-coded test results\n" +
    "- ✅ Grouped by test category\n" +
    "- ✅ Detailed test information\n" +
    "- ✅ Responsive design\n" +
    "\n" +
    "**Open in browser:**\n" +
    "```bash\n" +
    "open test-reports/test-report-*.html\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔧 Usage Examples\n" +
    "\n" +
    "### Example 1: Local Development Testing\n" +
    "\n" +
    "```bash\n" +
    "# Start your API locally\n" +
    "cd /path/to/SIPS.Connect\n" +
    "dotnet run\n" +
    "\n" +
    "# In another terminal, run tests\n" +
    "cd TestScripts\n" +
    "./run-all-tests.sh --skip-auth --verbose\n" +
    "```\n" +
    "\n" +
    "### Example 2: CI/CD Integration\n" +
    "\n" +
    "```bash\n" +
    "#!/bin/bash\n" +
    "# ci-test.sh\n" +
    "\n" +
    "# Run tests and capture exit code\n" +
    "./run-all-tests.sh \\\n" +
    "  --url $API_URL \\\n" +
    "  --api-key $API_KEY \\\n" +
    "  --api-secret $API_SECRET \\\n" +
    "  --report-dir ./ci-reports \\\n" +
    "  --format json\n" +
    "\n" +
    "EXIT_CODE=$?\n" +
    "\n" +
    "# Upload reports to artifact storage\n" +
    "aws s3 cp ./ci-reports/ s3://my-bucket/test-reports/ --recursive\n" +
    "\n" +
    "# Fail build if tests failed\n" +
    "exit $EXIT_CODE\n" +
    "```\n" +
    "\n" +
    "### Example 3: Staging Environment Testing\n" +
    "\n" +
    "```bash\n" +
    "./run-all-tests.sh \\\n" +
    "  --url https://staging-api.example.com \\\n" +
    "  --api-key \"staging-key\" \\\n" +
    "  --api-secret \"staging-secret\" \\\n" +
    "  --report-dir ./staging-reports \\\n" +
    "  --format both\n" +
    "```\n" +
    "\n" +
    "### Example 4: Production Smoke Tests\n" +
    "\n" +
    "```bash\n" +
    "# Run only critical tests\n" +
    "./run-all-tests.sh \\\n" +
    "  --url https://api.example.com \\\n" +
    "  --api-key \"prod-key\" \\\n" +
    "  --api-secret \"prod-secret\" \\\n" +
    "  --format json\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📈 Interpreting Results\n" +
    "\n" +
    "### Console Output\n" +
    "\n" +
    "```\n" +
    "==========================================\n" +
    "SIPS Connect - Automated Test Runner\n" +
    "==========================================\n" +
    "Base URL: http://localhost:5000\n" +
    "Authentication: Disabled\n" +
    "Report Directory: ./test-reports\n" +
    "Report Format: both\n" +
    "Start Time: 2024-11-28 15:30:00\n" +
    "==========================================\n" +
    "\n" +
    "=== XML Message Tests ===\n" +
    "\n" +
    "[Test 1] Payment Request (pacs.008)\n" +
    "✓ PASSED (HTTP 200) [0.45s]\n" +
    "  Transaction ID: ZKBASOS0533212638999283678329850\n" +
    "\n" +
    "[Test 2] Verification Request (acmt.023)\n" +
    "✗ FAILED (HTTP 403, Expected: 200) [0.12s]\n" +
    "\n" +
    "...\n" +
    "\n" +
    "==========================================\n" +
    "Test Summary\n" +
    "==========================================\n" +
    "Total Tests:    13\n" +
    "Passed:         11\n" +
    "Failed:         2\n" +
    "Skipped:        0\n" +
    "Success Rate:   84.6%\n" +
    "Total Duration: 5s\n" +
    "End Time:       2024-11-28 15:30:05\n" +
    "==========================================\n" +
    "\n" +
    "✓ JSON report saved: ./test-reports/test-report-20241128_153000.json\n" +
    "✓ HTML report saved: ./test-reports/test-report-20241128_153000.html\n" +
    "\n" +
    "Reports saved to: ./test-reports\n" +
    "```\n" +
    "\n" +
    "### Exit Codes\n" +
    "\n" +
    "- **0** - All tests passed\n" +
    "- **1** - One or more tests failed\n" +
    "\n" +
    "Use in scripts:\n" +
    "```bash\n" +
    "if ./run-all-tests.sh --skip-auth; then\n" +
    "    echo \"All tests passed!\"\n" +
    "else\n" +
    "    echo \"Tests failed!\"\n" +
    "    exit 1\n" +
    "fi\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔍 Troubleshooting\n" +
    "\n" +
    "### Issue: All Tests Return 403 Forbidden\n" +
    "\n" +
    "**Cause:** API requires authentication\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Option 1: Provide credentials\n" +
    "./run-all-tests.sh --api-key \"your-key\" --api-secret \"your-secret\"\n" +
    "\n" +
    "# Option 2: If endpoint doesn't require auth (development)\n" +
    "./run-all-tests.sh --skip-auth\n" +
    "```\n" +
    "\n" +
    "### Issue: Connection Refused\n" +
    "\n" +
    "**Cause:** API is not running\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Check API is running\n" +
    "./check-api.sh\n" +
    "\n" +
    "# Start API\n" +
    "cd .. && dotnet run\n" +
    "```\n" +
    "\n" +
    "### Issue: Payload Not Found\n" +
    "\n" +
    "**Cause:** Payload files missing\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Verify payloads exist\n" +
    "ls -la Payloads/\n" +
    "ls -la Payloads/JSON/\n" +
    "\n" +
    "# Re-copy from real-world samples if needed\n" +
    "cp real-world/*.xml Payloads/\n" +
    "```\n" +
    "\n" +
    "### Issue: Tests Timeout\n" +
    "\n" +
    "**Cause:** API is slow or unresponsive\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Check API health\n" +
    "curl -I http://localhost:5000/health\n" +
    "\n" +
    "# Check API logs for errors\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔄 CI/CD Integration\n" +
    "\n" +
    "### GitHub Actions\n" +
    "\n" +
    "```yaml\n" +
    "name: API Tests\n" +
    "\n" +
    "on: [push, pull_request]\n" +
    "\n" +
    "jobs:\n" +
    "  test:\n" +
    "    runs-on: ubuntu-latest\n" +
    "    steps:\n" +
    "      - uses: actions/checkout@v3\n" +
    "      \n" +
    "      - name: Setup .NET\n" +
    "        uses: actions/setup-dotnet@v3\n" +
    "        with:\n" +
    "          dotnet-version: '8.0.x'\n" +
    "      \n" +
    "      - name: Start API\n" +
    "        run: |\n" +
    "          dotnet run --project SIPS.Connect.csproj &\n" +
    "          sleep 10\n" +
    "      \n" +
    "      - name: Run Tests\n" +
    "        run: |\n" +
    "          cd TestScripts\n" +
    "          chmod +x run-all-tests.sh\n" +
    "          ./run-all-tests.sh --skip-auth --format json\n" +
    "      \n" +
    "      - name: Upload Test Reports\n" +
    "        if: always()\n" +
    "        uses: actions/upload-artifact@v3\n" +
    "        with:\n" +
    "          name: test-reports\n" +
    "          path: TestScripts/test-reports/\n" +
    "      \n" +
    "      - name: Publish Test Results\n" +
    "        if: always()\n" +
    "        uses: dorny/test-reporter@v1\n" +
    "        with:\n" +
    "          name: SIPS Connect Tests\n" +
    "          path: TestScripts/test-reports/*.json\n" +
    "          reporter: json\n" +
    "```\n" +
    "\n" +
    "### Azure DevOps\n" +
    "\n" +
    "```yaml\n" +
    "steps:\n" +
    "  - task: Bash@3\n" +
    "    displayName: 'Run API Tests'\n" +
    "    inputs:\n" +
    "      targetType: 'filePath'\n" +
    "      filePath: 'TestScripts/run-all-tests.sh'\n" +
    "      arguments: '--url $(API_URL) --api-key $(API_KEY) --api-secret $(API_SECRET) --format json'\n" +
    "  \n" +
    "  - task: PublishTestResults@2\n" +
    "    condition: always()\n" +
    "    inputs:\n" +
    "      testResultsFormat: 'JUnit'\n" +
    "      testResultsFiles: 'TestScripts/test-reports/*.json'\n" +
    "      testRunTitle: 'SIPS Connect API Tests'\n" +
    "  \n" +
    "  - task: PublishBuildArtifacts@1\n" +
    "    condition: always()\n" +
    "    inputs:\n" +
    "      pathToPublish: 'TestScripts/test-reports'\n" +
    "      artifactName: 'test-reports'\n" +
    "```\n" +
    "\n" +
    "### Jenkins\n" +
    "\n" +
    "```groovy\n" +
    "pipeline {\n" +
    "    agent any\n" +
    "    \n" +
    "    stages {\n" +
    "        stage('Run Tests') {\n" +
    "            steps {\n" +
    "                sh '''\n" +
    "                    cd TestScripts\n" +
    "                    chmod +x run-all-tests.sh\n" +
    "                    ./run-all-tests.sh \\\n" +
    "                        --url $API_URL \\\n" +
    "                        --api-key $API_KEY \\\n" +
    "                        --api-secret $API_SECRET \\\n" +
    "                        --format both\n" +
    "                '''\n" +
    "            }\n" +
    "        }\n" +
    "    }\n" +
    "    \n" +
    "    post {\n" +
    "        always {\n" +
    "            publishHTML([\n" +
    "                reportDir: 'TestScripts/test-reports',\n" +
    "                reportFiles: '*.html',\n" +
    "                reportName: 'Test Report'\n" +
    "            ])\n" +
    "            archiveArtifacts artifacts: 'TestScripts/test-reports/*', allowEmptyArchive: true\n" +
    "        }\n" +
    "    }\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📝 Customization\n" +
    "\n" +
    "### Adding New Tests\n" +
    "\n" +
    "Edit `run-all-tests.sh` and add your test:\n" +
    "\n" +
    "```bash\n" +
    "# For XML tests\n" +
    "run_xml_test \"Your Test Name\" \"/api/endpoint\" \"$PAYLOADS_DIR/your-payload.xml\" 200\n" +
    "\n" +
    "# For JSON tests\n" +
    "run_json_test \"Your Test Name\" \"/api/endpoint\" \"$JSON_PAYLOADS_DIR/your-payload.json\" 200\n" +
    "```\n" +
    "\n" +
    "### Custom Report Templates\n" +
    "\n" +
    "Modify the HTML template in `run-all-tests.sh` starting at line ~300 to customize the report appearance.\n" +
    "\n" +
    "### Environment-Specific Configuration\n" +
    "\n" +
    "Create environment-specific scripts:\n" +
    "\n" +
    "```bash\n" +
    "# test-dev.sh\n" +
    "./run-all-tests.sh \\\n" +
    "  --url https://dev-api.example.com \\\n" +
    "  --api-key \"$DEV_API_KEY\" \\\n" +
    "  --api-secret \"$DEV_API_SECRET\" \\\n" +
    "  --report-dir ./dev-reports\n" +
    "\n" +
    "# test-staging.sh\n" +
    "./run-all-tests.sh \\\n" +
    "  --url https://staging-api.example.com \\\n" +
    "  --api-key \"$STAGING_API_KEY\" \\\n" +
    "  --api-secret \"$STAGING_API_SECRET\" \\\n" +
    "  --report-dir ./staging-reports\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🎯 Best Practices\n" +
    "\n" +
    "### 1. Run Tests Before Deployment\n" +
    "\n" +
    "```bash\n" +
    "# Pre-deployment check\n" +
    "./run-all-tests.sh --url $STAGING_URL --api-key $KEY --api-secret $SECRET\n" +
    "if [ $? -eq 0 ]; then\n" +
    "    echo \"✓ Tests passed - Safe to deploy\"\n" +
    "    ./deploy.sh\n" +
    "else\n" +
    "    echo \"✗ Tests failed - Deployment aborted\"\n" +
    "    exit 1\n" +
    "fi\n" +
    "```\n" +
    "\n" +
    "### 2. Schedule Regular Tests\n" +
    "\n" +
    "```bash\n" +
    "# crontab entry - run tests every hour\n" +
    "0 * * * * cd /path/to/TestScripts && ./run-all-tests.sh --skip-auth --format json\n" +
    "```\n" +
    "\n" +
    "### 3. Monitor Test Trends\n" +
    "\n" +
    "```bash\n" +
    "# Keep historical reports\n" +
    "./run-all-tests.sh --report-dir ./reports/$(date +%Y-%m-%d)\n" +
    "```\n" +
    "\n" +
    "### 4. Alert on Failures\n" +
    "\n" +
    "```bash\n" +
    "#!/bin/bash\n" +
    "./run-all-tests.sh --skip-auth --format json\n" +
    "if [ $? -ne 0 ]; then\n" +
    "    # Send alert\n" +
    "    curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \\\n" +
    "      -H 'Content-Type: application/json' \\\n" +
    "      -d '{\"text\":\"⚠️ SIPS Connect tests failed!\"}'\n" +
    "fi\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📚 Related Documentation\n" +
    "\n" +
    "- **README.md** - Main test scripts documentation\n" +
    "- **test-scenarios.md** - Detailed test scenarios\n" +
    "- **Payloads/README.md** - XML payloads documentation\n" +
    "- **Payloads/JSON/README.md** - JSON payloads documentation\n" +
    "- **PAYLOAD_UPDATE_SUMMARY.md** - Payload update history\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🆘 Support\n" +
    "\n" +
    "### Getting Help\n" +
    "\n" +
    "1. Check this guide for common issues\n" +
    "2. Review test reports for detailed error information\n" +
    "3. Check API logs: `docker-compose logs sips-connect`\n" +
    "4. Verify payloads are correct\n" +
    "5. Contact SIPS Connect team\n" +
    "\n" +
    "### Reporting Issues\n" +
    "\n" +
    "When reporting test failures, include:\n" +
    "- Test report (JSON or HTML)\n" +
    "- Console output\n" +
    "- API logs\n" +
    "- Environment details (URL, authentication method)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "**Happy Testing! 🚀**\n" +
    "\n" +
    "*Automated testing ensures quality and reliability of your SIPS Connect integration.*";

export default function TestRunnerGuide() {
    return <MarkdownRenderer markdown={markdown} />;
}