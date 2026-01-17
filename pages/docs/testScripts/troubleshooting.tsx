import MarkdownRenderer from "../../../component/MarkdownRenderer";
const markdown = "# Troubleshooting Guide\n" +
    "\n" +
    "## Issue: HTTP 000 - Connection Failed\n" +
    "\n" +
    "### Symptoms\n" +
    "\n" +
    "```\n" +
    "✗ FAILED (HTTP 000, Expected: 200)\n" +
    "Response:\n" +
    "000\n" +
    "```\n" +
    "\n" +
    "### Cause\n" +
    "\n" +
    "The API is not running or not reachable at the specified URL.\n" +
    "\n" +
    "### Solution\n" +
    "\n" +
    "#### 1. Check API Status\n" +
    "\n" +
    "```bash\n" +
    "./check-api.sh\n" +
    "# or with custom URL\n" +
    "./check-api.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "#### 2. Start the API\n" +
    "\n" +
    "```bash\n" +
    "cd /path/to/your/api/project\n" +
    "dotnet run\n" +
    "# or\n" +
    "dotnet watch\n" +
    "```\n" +
    "\n" +
    "**Note:** The default scripts assume `http://localhost:5000`. Adjust the URL parameter if your API uses a different port.\n" +
    "\n" +
    "#### 3. Find Running Ports\n" +
    "\n" +
    "```bash\n" +
    "# Check port 5000\n" +
    "lsof -i :5000\n" +
    "\n" +
    "# Check port 8080\n" +
    "lsof -i :8080\n" +
    "```\n" +
    "\n" +
    "#### 4. Test Correct URL\n" +
    "\n" +
    "Make sure the URL matches where your API is actually running.\n" +
    "\n" +
    "```bash\n" +
    "# Default (http://localhost:5000)\n" +
    "./curl-examples.sh\n" +
    "\n" +
    "# Custom URL\n" +
    "./curl-examples.sh https://localhost:443\n" +
    "\n" +
    "# Wrong - using 0.0.0.0\n" +
    "./curl-examples.sh https://0.0.0.0:8080\n" +
    "```\n" +
    "\n" +
    "## Issue: AWK Syntax Error (Fixed)\n" +
    "\n" +
    "### Symptoms\n" +
    "\n" +
    "```\n" +
    "awk: syntax error at source line 1\n" +
    "Success Rate:    Success Rate:\n" +
    "```\n" +
    "\n" +
    "### Cause\n" +
    "\n" +
    "macOS uses BSD awk which has different syntax than GNU awk.\n" +
    "\n" +
    "### Solution\n" +
    "\n" +
    "✅ **Already fixed!** The script now uses `bc` instead of `awk` for calculations.\n" +
    "\n" +
    "## Issue: HTTP 403 - Forbidden\n" +
    "\n" +
    "### Symptoms\n" +
    "\n" +
    "```\n" +
    "HTTP Status: 403\n" +
    "Status: Forbidden\n" +
    "```\n" +
    "\n" +
    "### Cause\n" +
    "\n" +
    "The API endpoint may require authentication or the request is missing required headers.\n" +
    "\n" +
    "### Solution\n" +
    "\n" +
    "#### Check if authentication is required\n" +
    "\n" +
    "Look at the API configuration in `Program.cs` or `Startup.cs`:\n" +
    "\n" +
    "```csharp\n" +
    "// If you see this, authentication is required\n" +
    "[Authorize(Roles = Gateway)]\n" +
    "```\n" +
    "\n" +
    "#### For the `/api/v1/incoming` endpoint\n" +
    "\n" +
    "This endpoint should NOT require authentication for incoming ISO 20022 messages. If you're getting 403, check:\n" +
    "\n" +
    "1. **CORS settings** - May be blocking the request\n" +
    "2. **Request headers** - Ensure Content-Type is set correctly\n" +
    "3. **API logs** - Check for detailed error messages\n" +
    "\n" +
    "## Issue: HTTP 401 - Unauthorized\n" +
    "\n" +
    "### Symptoms\n" +
    "\n" +
    "```\n" +
    "HTTP Status: 401\n" +
    "```\n" +
    "\n" +
    "### Cause\n" +
    "\n" +
    "Authentication required but not provided.\n" +
    "\n" +
    "### Solution\n" +
    "\n" +
    "Add authentication headers to the test script or disable authentication for testing.\n" +
    "\n" +
    "## Issue: HTTP 404 - Not Found\n" +
    "\n" +
    "### Symptoms\n" +
    "\n" +
    "```\n" +
    "HTTP Status: 404\n" +
    "```\n" +
    "\n" +
    "### Cause\n" +
    "\n" +
    "The endpoint path is incorrect.\n" +
    "\n" +
    "### Solution\n" +
    "\n" +
    "Verify the endpoint:\n" +
    "\n" +
    "- ✅ Correct: `/api/v1/incoming`\n" +
    "\n" +
    "## Quick Reference\n" +
    "\n" +
    "### Check API Health\n" +
    "\n" +
    "```bash\n" +
    "./check-api.sh\n" +
    "# or explicitly\n" +
    "./check-api.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "### Run Tests (Basic)\n" +
    "\n" +
    "```bash\n" +
    "./curl-examples.sh\n" +
    "# or explicitly\n" +
    "./curl-examples.sh https://localhost:443\n" +
    "```\n" +
    "\n" +
    "### Run Tests (Verbose for debugging)\n" +
    "\n" +
    "```bash\n" +
    "./curl-examples.sh https://localhost:443 --verbose\n" +
    "```\n" +
    "\n" +
    "### Run Tests (With retry)\n" +
    "\n" +
    "```bash\n" +
    "./curl-examples.sh https://localhost:443 --retry 3\n" +
    "```\n" +
    "\n" +
    "### Test Single Endpoint\n" +
    "\n" +
    "```bash\n" +
    "curl -X POST https://localhost:443/api/v1/incoming \\\n" +
    "  -H \"Content-Type: application/xml\" \\\n" +
    "  -d @Payloads/pacs.008.xml\n" +
    "```\n" +
    "\n" +
    "## Common Port Configurations\n" +
    "\n" +
    "| Environment               | URL                     | How to Start                         |\n" +
    "| ------------------------- | ----------------------- | ------------------------------------ |\n" +
    "| Local Development (HTTP)  | http://localhost:5000   | `dotnet run`                         |\n" +
    "| Local Development (HTTPS) | https://localhost:5001  | `dotnet run` (with HTTPS configured) |\n" +
    "| Docker                    | http://localhost:8080   | `docker-compose up`                  |\n" +
    "| Production                | https://api.example.com | Deployment-specific                  |\n" +
    "\n" +
    "## Getting Help\n" +
    "\n" +
    "1. **Check API logs** - Look for error messages in your API console\n" +
    "2. **Use verbose mode** - `./curl-examples.sh http://localhost:5000 --verbose`\n" +
    "3. **Check health endpoint** - `./check-api.sh`\n" +
    "4. **Verify API is running** - `lsof -i :5000` (or your port)\n" +
    "5. **Check test configuration** - Review `test-config.json`\n" +
    "\n" +
    "## Next Steps\n" +
    "\n" +
    "After fixing connection issues:\n" +
    "\n" +
    "1. ✅ Start API: `cd /path/to/your/api && dotnet run`\n" +
    "2. ✅ Verify API is running: `./check-api.sh`\n" +
    "3. ✅ Run tests: `./curl-examples.sh`\n" +
    "4. ✅ Check results and fix any failures\n" +
    "5. ✅ Review API logs for detailed error messages";

export default function Troubleshooting() {
    return <MarkdownRenderer markdown={markdown} />;
}