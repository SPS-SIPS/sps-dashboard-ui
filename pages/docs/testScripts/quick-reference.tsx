import MarkdownRenderer from "../../../component/MarkdownRenderer";
const markdown = "# SIPS Connect Testing - Quick Reference Card\n" +
    "\n" +
    "## 🚀 Run Tests\n" +
    "\n" +
    "```bash\n" +
    "# Basic (no auth)\n" +
    "./run-all-tests.sh --skip-auth\n" +
    "\n" +
    "# With authentication\n" +
    "./run-all-tests.sh --api-key \"KEY\" --api-secret \"SECRET\"\n" +
    "\n" +
    "# Custom URL\n" +
    "./run-all-tests.sh --url https://api.example.com --skip-auth\n" +
    "\n" +
    "# Verbose output\n" +
    "./run-all-tests.sh --skip-auth --verbose\n" +
    "\n" +
    "# JSON report only\n" +
    "./run-all-tests.sh --skip-auth --format json\n" +
    "```\n" +
    "\n" +
    "## 📊 View Reports\n" +
    "\n" +
    "```bash\n" +
    "# Open HTML report\n" +
    "open test-reports/test-report-*.html\n" +
    "\n" +
    "# View JSON report\n" +
    "cat test-reports/test-report-*.json | jq .\n" +
    "\n" +
    "# Check latest results\n" +
    "ls -lt test-reports/\n" +
    "```\n" +
    "\n" +
    "## 🔍 Check API Health\n" +
    "\n" +
    "```bash\n" +
    "# Health check\n" +
    "./check-api.sh\n" +
    "\n" +
    "# Custom URL\n" +
    "./check-api.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "## 📝 Test Coverage\n" +
    "\n" +
    "- **13 Automated Tests**\n" +
    "  - 7 XML Message Tests\n" +
    "  - 4 Gateway API Tests\n" +
    "  - 2 SomQR API Tests\n" +
    "\n" +
    "## 📁 Key Files\n" +
    "\n" +
    "| File | Purpose |\n" +
    "|------|---------|\n" +
    "| `run-all-tests.sh` | Automated test runner |\n" +
    "| `TEST_RUNNER_GUIDE.md` | Complete documentation |\n" +
    "| `test-reports/` | Generated reports |\n" +
    "| `Payloads/` | XML test data |\n" +
    "| `Payloads/JSON/` | JSON test data |\n" +
    "\n" +
    "## 🔧 Common Issues\n" +
    "\n" +
    "### 403 Forbidden\n" +
    "```bash\n" +
    "# Add authentication\n" +
    "./run-all-tests.sh --api-key \"KEY\" --api-secret \"SECRET\"\n" +
    "```\n" +
    "\n" +
    "### Connection Refused\n" +
    "```bash\n" +
    "# Check API is running\n" +
    "./check-api.sh\n" +
    "```\n" +
    "\n" +
    "### Payload Not Found\n" +
    "```bash\n" +
    "# Verify payloads exist\n" +
    "ls Payloads/*.xml\n" +
    "ls Payloads/JSON/*.json\n" +
    "```\n" +
    "\n" +
    "## 🎯 Exit Codes\n" +
    "\n" +
    "- **0** = All tests passed ✅\n" +
    "- **1** = Tests failed ❌\n" +
    "\n" +
    "## 📚 Documentation\n" +
    "\n" +
    "- `TEST_RUNNER_GUIDE.md` - Full guide\n" +
    "- `AUTOMATED_TESTING_SUMMARY.md` - Implementation summary\n" +
    "- `Payloads/README.md` - XML payloads\n" +
    "- `Payloads/JSON/README.md` - JSON payloads\n" +
    "\n" +
    "## 💡 Quick Tips\n" +
    "\n" +
    "```bash\n" +
    "# CI/CD integration\n" +
    "./run-all-tests.sh --skip-auth && deploy.sh\n" +
    "\n" +
    "# Save reports with date\n" +
    "./run-all-tests.sh --report-dir ./reports/$(date +%Y-%m-%d)\n" +
    "\n" +
    "# Test specific environment\n" +
    "./run-all-tests.sh --url $STAGING_URL --api-key $KEY --api-secret $SECRET\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "**Need help?** Run `./run-all-tests.sh --help`";

export default function QuickReference() {
    return <MarkdownRenderer markdown={markdown} />;
}