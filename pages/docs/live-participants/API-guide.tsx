import MarkdownRenderer from "../../../component/MarkdownRenderer";

export default function APIGuide  ()  {
    const markdown = "# Live Participants API - Integration Guide\n" +
        "\n" +
        "## Overview\n" +
        "\n" +
        "This guide is for external banking systems and services that need to query the real-time availability status of financial institutions participating in the payment switch network. The Live Participants API provides instant access to cached participant status without requiring complex monitoring infrastructure.\n" +
        "\n" +
        "## Use Cases\n" +
        "\n" +
        "- **Pre-transaction validation** - Check if recipient bank is online before initiating payment\n" +
        "- **Routing decisions** - Route transactions only to available institutions\n" +
        "- **Dashboard displays** - Show real-time network status\n" +
        "- **Automated failover** - Redirect traffic when primary institution is offline\n" +
        "- **SLA monitoring** - Track participant availability for compliance\n" +
        "\n" +
        "## API Endpoint\n" +
        "\n" +
        "### Base URL\n" +
        "\n" +
        "```\n" +
        "Production: https://api.sps.so/api/v1\n" +
        "Staging: https://staging-api.sps.so/api/v1\n" +
        "Development: http://localhost:5007/api/v1\n" +
        "```\n" +
        "\n" +
        "### Endpoint\n" +
        "\n" +
        "```\n" +
        "GET /participants/live\n" +
        "```\n" +
        "\n" +
        "## Authentication\n" +
        "\n" +
        "The API uses JWT Bearer token authentication.\n" +
        "\n" +
        "### Obtaining Access Token\n" +
        "\n" +
        "Contact your SPS System administrator to obtain API credentials. Once you have credentials, authenticate to receive a JWT token:\n" +
        "\n" +
        "```bash\n" +
        "POST /auth/login\n" +
        "Content-Type: application/json\n" +
        "\n" +
        "{\n" +
        "  \"username\": \"your_username\",\n" +
        "  \"password\": \"your_password\"\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "**Response:**\n" +
        "```json\n" +
        "{\n" +
        "  \"data\": {\n" +
        "    \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",\n" +
        "    \"refreshToken\": \"...\",\n" +
        "    \"expiresIn\": 1200\n" +
        "  },\n" +
        "  \"succeeded\": true\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "### Using the Token\n" +
        "\n" +
        "Include the token in the `Authorization` header for all API requests:\n" +
        "\n" +
        "```\n" +
        "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n" +
        "```\n" +
        "\n" +
        "## Request Format\n" +
        "\n" +
        "### Get All Participants with Status\n" +
        "\n" +
        "```http\n" +
        "GET /api/v1/participants/live\n" +
        "Authorization: Bearer {your_token}\n" +
        "```\n" +
        "\n" +
        "### Get Only Live Participants\n" +
        "\n" +
        "```http\n" +
        "GET /api/v1/participants/live?IsLive=true\n" +
        "Authorization: Bearer {your_token}\n" +
        "```\n" +
        "\n" +
        "### Get Only Offline Participants\n" +
        "\n" +
        "```http\n" +
        "GET /api/v1/participants/live?IsLive=false\n" +
        "Authorization: Bearer {your_token}\n" +
        "```\n" +
        "\n" +
        "## Response Format\n" +
        "\n" +
        "### Success Response\n" +
        "\n" +
        "**HTTP Status:** 200 OK\n" +
        "\n" +
        "```json\n" +
        "{\n" +
        "  \"data\": [\n" +
        "    {\n" +
        "      \"institutionBic\": \"AGROSOS0\",\n" +
        "      \"institutionName\": \"AGRO Bank UAT\",\n" +
        "      \"isLive\": true,\n" +
        "      \"lastCheckedAt\": \"2025-12-29T09:20:00Z\",\n" +
        "      \"lastStatusChangeAt\": \"2025-12-29T08:15:00Z\",\n" +
        "      \"consecutiveFailures\": 0,\n" +
        "      \"consecutiveSuccesses\": 5,\n" +
        "      \"lastError\": null\n" +
        "    },\n" +
        "    {\n" +
        "      \"institutionBic\": \"ZKBASOS0\",\n" +
        "      \"institutionName\": \"Zirat Bank UAT\",\n" +
        "      \"isLive\": false,\n" +
        "      \"lastCheckedAt\": \"2025-12-29T09:20:00Z\",\n" +
        "      \"lastStatusChangeAt\": \"2025-12-29T09:10:00Z\",\n" +
        "      \"consecutiveFailures\": 4,\n" +
        "      \"consecutiveSuccesses\": 0,\n" +
        "      \"lastError\": \"connection refused\"\n" +
        "    }\n" +
        "  ],\n" +
        "  \"succeeded\": true,\n" +
        "  \"message\": null,\n" +
        "  \"errors\": null\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "### Response Fields\n" +
        "\n" +
        "| Field | Type | Required | Description |\n" +
        "|-------|------|----------|-------------|\n" +
        "| `institutionBic` | string | Yes | Bank Identifier Code (e.g., \"AGROSOS0\") |\n" +
        "| `institutionName` | string | Yes | Full name of the institution |\n" +
        "| `isLive` | boolean | Yes | Current availability status (true = online, false = offline) |\n" +
        "| `lastCheckedAt` | ISO 8601 datetime | Yes | When the last health check was performed (UTC) |\n" +
        "| `lastStatusChangeAt` | ISO 8601 datetime | Yes | When the status last changed (UTC) |\n" +
        "| `consecutiveFailures` | integer | Yes | Number of consecutive failed health checks |\n" +
        "| `consecutiveSuccesses` | integer | Yes | Number of consecutive successful health checks |\n" +
        "| `lastError` | string | No | Most recent error message (null if no error) |\n" +
        "\n" +
        "### Error Responses\n" +
        "\n" +
        "#### 401 Unauthorized\n" +
        "```json\n" +
        "{\n" +
        "  \"data\": null,\n" +
        "  \"succeeded\": false,\n" +
        "  \"message\": \"Unauthorized\",\n" +
        "  \"errors\": [\"Invalid or expired token\"]\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "#### 403 Forbidden\n" +
        "```json\n" +
        "{\n" +
        "  \"data\": null,\n" +
        "  \"succeeded\": false,\n" +
        "  \"message\": \"Forbidden\",\n" +
        "  \"errors\": [\"Insufficient permissions\"]\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "#### 500 Internal Server Error\n" +
        "```json\n" +
        "{\n" +
        "  \"data\": null,\n" +
        "  \"succeeded\": false,\n" +
        "  \"message\": \"Internal server error\",\n" +
        "  \"errors\": [\"An unexpected error occurred\"]\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "## Integration Examples\n" +
        "\n" +
        "### JavaScript/TypeScript (Node.js)\n" +
        "\n" +
        "```javascript\n" +
        "const axios = require('axios');\n" +
        "\n" +
        "class LiveParticipantsClient {\n" +
        "  constructor(baseUrl, token) {\n" +
        "    this.baseUrl = baseUrl;\n" +
        "    this.token = token;\n" +
        "  }\n" +
        "\n" +
        "  async getLiveParticipants(isLive = null) {\n" +
        "    try {\n" +
        "      const params = isLive !== null ? { IsLive: isLive } : {};\n" +
        "      const response = await axios.get(\n" +
        "        `${this.baseUrl}/api/v1/participants/live`,\n" +
        "        {\n" +
        "          headers: {\n" +
        "            'Authorization': `Bearer ${this.token}`\n" +
        "          },\n" +
        "          params\n" +
        "        }\n" +
        "      );\n" +
        "      \n" +
        "      return response.data.data;\n" +
        "    } catch (error) {\n" +
        "      console.error('Error fetching live participants:', error.message);\n" +
        "      throw error;\n" +
        "    }\n" +
        "  }\n" +
        "\n" +
        "  async isParticipantLive(bic) {\n" +
        "    const participants = await this.getLiveParticipants(true);\n" +
        "    return participants.some(p => p.institutionBic === bic);\n" +
        "  }\n" +
        "\n" +
        "  async getAvailableParticipants() {\n" +
        "    return await this.getLiveParticipants(true);\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Usage\n" +
        "const client = new LiveParticipantsClient(\n" +
        "  'https://api.sps.so',\n" +
        "  'your_jwt_token'\n" +
        ");\n" +
        "\n" +
        "// Check if specific bank is live\n" +
        "const isLive = await client.isParticipantLive('AGROSOS0');\n" +
        "console.log(`AGRO Bank is ${isLive ? 'online' : 'offline'}`);\n" +
        "\n" +
        "// Get all live participants\n" +
        "const liveParticipants = await client.getAvailableParticipants();\n" +
        "console.log(`${liveParticipants.length} participants are currently online`);\n" +
        "```\n" +
        "\n" +
        "### Python\n" +
        "\n" +
        "```python\n" +
        "import requests\n" +
        "from typing import List, Optional, Dict\n" +
        "from datetime import datetime\n" +
        "\n" +
        "class LiveParticipantsClient:\n" +
        "    def __init__(self, base_url: str, token: str):\n" +
        "        self.base_url = base_url\n" +
        "        self.headers = {\n" +
        "            'Authorization': f'Bearer {token}',\n" +
        "            'Content-Type': 'application/json'\n" +
        "        }\n" +
        "    \n" +
        "    def get_live_participants(self, is_live: Optional[bool] = None) -> List[Dict]:\n" +
        "        \"\"\"Get participants with optional live status filter\"\"\"\n" +
        "        url = f\"{self.base_url}/api/v1/participants/live\"\n" +
        "        params = {}\n" +
        "        if is_live is not None:\n" +
        "            params['IsLive'] = str(is_live).lower()\n" +
        "        \n" +
        "        response = requests.get(url, headers=self.headers, params=params)\n" +
        "        response.raise_for_status()\n" +
        "        \n" +
        "        return response.json()['data']\n" +
        "    \n" +
        "    def is_participant_live(self, bic: str) -> bool:\n" +
        "        \"\"\"Check if a specific participant is live\"\"\"\n" +
        "        participants = self.get_live_participants(is_live=True)\n" +
        "        return any(p['institutionBic'] == bic for p in participants)\n" +
        "    \n" +
        "    def get_available_participants(self) -> List[str]:\n" +
        "        \"\"\"Get list of BICs for all live participants\"\"\"\n" +
        "        participants = self.get_live_participants(is_live=True)\n" +
        "        return [p['institutionBic'] for p in participants]\n" +
        "\n" +
        "# Usage\n" +
        "client = LiveParticipantsClient(\n" +
        "    base_url='https://api.sps.so',\n" +
        "    token='your_jwt_token'\n" +
        ")\n" +
        "\n" +
        "# Check if specific bank is live\n" +
        "if client.is_participant_live('AGROSOS0'):\n" +
        "    print(\"AGRO Bank is online - proceed with transaction\")\n" +
        "else:\n" +
        "    print(\"AGRO Bank is offline - use alternative route\")\n" +
        "\n" +
        "# Get all live participants\n" +
        "live_bics = client.get_available_participants()\n" +
        "print(f\"Available institutions: {', '.join(live_bics)}\")\n" +
        "```\n" +
        "\n" +
        "### Java (Spring Boot)\n" +
        "\n" +
        "```java\n" +
        "import org.springframework.http.*;\n" +
        "import org.springframework.web.client.RestTemplate;\n" +
        "import org.springframework.web.util.UriComponentsBuilder;\n" +
        "\n" +
        "public class LiveParticipantsClient {\n" +
        "    private final String baseUrl;\n" +
        "    private final String token;\n" +
        "    private final RestTemplate restTemplate;\n" +
        "\n" +
        "    public LiveParticipantsClient(String baseUrl, String token) {\n" +
        "        this.baseUrl = baseUrl;\n" +
        "        this.token = token;\n" +
        "        this.restTemplate = new RestTemplate();\n" +
        "    }\n" +
        "\n" +
        "    public List<ParticipantStatus> getLiveParticipants(Boolean isLive) {\n" +
        "        HttpHeaders headers = new HttpHeaders();\n" +
        "        headers.setBearerAuth(token);\n" +
        "        HttpEntity<?> entity = new HttpEntity<>(headers);\n" +
        "\n" +
        "        UriComponentsBuilder builder = UriComponentsBuilder\n" +
        "            .fromHttpUrl(baseUrl + \"/api/v1/participants/live\");\n" +
        "        \n" +
        "        if (isLive != null) {\n" +
        "            builder.queryParam(\"IsLive\", isLive);\n" +
        "        }\n" +
        "\n" +
        "        ResponseEntity<ApiResponse<List<ParticipantStatus>>> response = \n" +
        "            restTemplate.exchange(\n" +
        "                builder.toUriString(),\n" +
        "                HttpMethod.GET,\n" +
        "                entity,\n" +
        "                new ParameterizedTypeReference<ApiResponse<List<ParticipantStatus>>>() {}\n" +
        "            );\n" +
        "\n" +
        "        return response.getBody().getData();\n" +
        "    }\n" +
        "\n" +
        "    public boolean isParticipantLive(String bic) {\n" +
        "        List<ParticipantStatus> liveParticipants = getLiveParticipants(true);\n" +
        "        return liveParticipants.stream()\n" +
        "            .anyMatch(p -> p.getInstitutionBic().equals(bic));\n" +
        "    }\n" +
        "}\n" +
        "\n" +
        "// DTOs\n" +
        "@Data\n" +
        "public class ParticipantStatus {\n" +
        "    private String institutionBic;\n" +
        "    private String institutionName;\n" +
        "    private boolean isLive;\n" +
        "    private String lastCheckedAt;\n" +
        "    private String lastStatusChangeAt;\n" +
        "    private int consecutiveFailures;\n" +
        "    private int consecutiveSuccesses;\n" +
        "    private String lastError;\n" +
        "}\n" +
        "\n" +
        "@Data\n" +
        "public class ApiResponse<T> {\n" +
        "    private T data;\n" +
        "    private boolean succeeded;\n" +
        "    private String message;\n" +
        "    private List<String> errors;\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "### C# (.NET)\n" +
        "\n" +
        "```csharp\n" +
        "using System;\n" +
        "using System.Collections.Generic;\n" +
        "using System.Linq;\n" +
        "using System.Net.Http;\n" +
        "using System.Net.Http.Headers;\n" +
        "using System.Text.Json;\n" +
        "using System.Threading.Tasks;\n" +
        "\n" +
        "public class LiveParticipantsClient\n" +
        "{\n" +
        "    private readonly HttpClient _httpClient;\n" +
        "    private readonly string _baseUrl;\n" +
        "\n" +
        "    public LiveParticipantsClient(string baseUrl, string token)\n" +
        "    {\n" +
        "        _baseUrl = baseUrl;\n" +
        "        _httpClient = new HttpClient();\n" +
        "        _httpClient.DefaultRequestHeaders.Authorization = \n" +
        "            new AuthenticationHeaderValue(\"Bearer\", token);\n" +
        "    }\n" +
        "\n" +
        "    public async Task<List<ParticipantStatus>> GetLiveParticipantsAsync(bool? isLive = null)\n" +
        "    {\n" +
        "        var url = $\"{_baseUrl}/api/v1/participants/live\";\n" +
        "        if (isLive.HasValue)\n" +
        "        {\n" +
        "            url += $\"?IsLive={isLive.Value.ToString().ToLower()}\";\n" +
        "        }\n" +
        "\n" +
        "        var response = await _httpClient.GetAsync(url);\n" +
        "        response.EnsureSuccessStatusCode();\n" +
        "\n" +
        "        var json = await response.Content.ReadAsStringAsync();\n" +
        "        var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<ParticipantStatus>>>(\n" +
        "            json,\n" +
        "            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }\n" +
        "        );\n" +
        "\n" +
        "        return apiResponse.Data;\n" +
        "    }\n" +
        "\n" +
        "    public async Task<bool> IsParticipantLiveAsync(string bic)\n" +
        "    {\n" +
        "        var liveParticipants = await GetLiveParticipantsAsync(isLive: true);\n" +
        "        return liveParticipants.Any(p => p.InstitutionBic == bic);\n" +
        "    }\n" +
        "\n" +
        "    public async Task<List<string>> GetAvailableParticipantsAsync()\n" +
        "    {\n" +
        "        var liveParticipants = await GetLiveParticipantsAsync(isLive: true);\n" +
        "        return liveParticipants.Select(p => p.InstitutionBic).ToList();\n" +
        "    }\n" +
        "}\n" +
        "\n" +
        "// DTOs\n" +
        "public class ParticipantStatus\n" +
        "{\n" +
        "    public string InstitutionBic { get; set; }\n" +
        "    public string InstitutionName { get; set; }\n" +
        "    public bool IsLive { get; set; }\n" +
        "    public DateTimeOffset LastCheckedAt { get; set; }\n" +
        "    public DateTimeOffset LastStatusChangeAt { get; set; }\n" +
        "    public int ConsecutiveFailures { get; set; }\n" +
        "    public int ConsecutiveSuccesses { get; set; }\n" +
        "    public string LastError { get; set; }\n" +
        "}\n" +
        "\n" +
        "public class ApiResponse<T>\n" +
        "{\n" +
        "    public T Data { get; set; }\n" +
        "    public bool Succeeded { get; set; }\n" +
        "    public string Message { get; set; }\n" +
        "    public List<string> Errors { get; set; }\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "### cURL\n" +
        "\n" +
        "```bash\n" +
        "# Get all participants\n" +
        "curl -X GET \"https://api.sps.so/api/v1/participants/live\" \\\n" +
        "  -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\\n" +
        "  -H \"Content-Type: application/json\"\n" +
        "\n" +
        "# Get only live participants\n" +
        "curl -X GET \"https://api.sps.so/api/v1/participants/live?IsLive=true\" \\\n" +
        "  -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\\n" +
        "  -H \"Content-Type: application/json\"\n" +
        "\n" +
        "# Get only offline participants\n" +
        "curl -X GET \"https://api.sps.so/api/v1/participants/live?IsLive=false\" \\\n" +
        "  -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\\n" +
        "  -H \"Content-Type: application/json\"\n" +
        "```\n" +
        "\n" +
        "## Best Practices\n" +
        "\n" +
        "### 1. Caching Strategy\n" +
        "\n" +
        "The API returns cached data that is updated every 2 minutes. You can implement your own caching layer:\n" +
        "\n" +
        "```javascript\n" +
        "class CachedLiveParticipantsClient {\n" +
        "  constructor(client, cacheDurationMs = 60000) { // 1 minute cache\n" +
        "    this.client = client;\n" +
        "    this.cacheDurationMs = cacheDurationMs;\n" +
        "    this.cache = null;\n" +
        "    this.lastFetch = null;\n" +
        "  }\n" +
        "\n" +
        "  async getLiveParticipants(isLive = null) {\n" +
        "    const now = Date.now();\n" +
        "    \n" +
        "    if (this.cache && this.lastFetch && \n" +
        "        (now - this.lastFetch) < this.cacheDurationMs) {\n" +
        "      return this.filterCache(isLive);\n" +
        "    }\n" +
        "\n" +
        "    this.cache = await this.client.getLiveParticipants();\n" +
        "    this.lastFetch = now;\n" +
        "    \n" +
        "    return this.filterCache(isLive);\n" +
        "  }\n" +
        "\n" +
        "  filterCache(isLive) {\n" +
        "    if (isLive === null) return this.cache;\n" +
        "    return this.cache.filter(p => p.isLive === isLive);\n" +
        "  }\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "### 2. Error Handling\n" +
        "\n" +
        "Always implement proper error handling:\n" +
        "\n" +
        "```python\n" +
        "def get_live_participants_with_retry(client, max_retries=3):\n" +
        "    for attempt in range(max_retries):\n" +
        "        try:\n" +
        "            return client.get_live_participants(is_live=True)\n" +
        "        except requests.exceptions.RequestException as e:\n" +
        "            if attempt == max_retries - 1:\n" +
        "                raise\n" +
        "            time.sleep(2 ** attempt)  # Exponential backoff\n" +
        "```\n" +
        "\n" +
        "### 3. Pre-Transaction Validation\n" +
        "\n" +
        "```javascript\n" +
        "async function validateRecipient(recipientBic, client) {\n" +
        "  try {\n" +
        "    const isLive = await client.isParticipantLive(recipientBic);\n" +
        "    \n" +
        "    if (!isLive) {\n" +
        "      return {\n" +
        "        valid: false,\n" +
        "        reason: 'Recipient institution is currently offline'\n" +
        "      };\n" +
        "    }\n" +
        "    \n" +
        "    return { valid: true };\n" +
        "  } catch (error) {\n" +
        "    // Fail open - allow transaction if status check fails\n" +
        "    console.warn('Could not verify recipient status:', error);\n" +
        "    return { valid: true, warning: 'Status verification unavailable' };\n" +
        "  }\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "### 4. Monitoring Integration\n" +
        "\n" +
        "```python\n" +
        "import time\n" +
        "from prometheus_client import Gauge\n" +
        "\n" +
        "# Prometheus metrics\n" +
        "live_participants_gauge = Gauge(\n" +
        "    'payment_switch_live_participants',\n" +
        "    'Number of live participants in payment switch'\n" +
        ")\n" +
        "\n" +
        "def update_metrics(client):\n" +
        "    while True:\n" +
        "        try:\n" +
        "            live_count = len(client.get_live_participants(is_live=True))\n" +
        "            live_participants_gauge.set(live_count)\n" +
        "        except Exception as e:\n" +
        "            print(f\"Error updating metrics: {e}\")\n" +
        "        \n" +
        "        time.sleep(60)  # Update every minute\n" +
        "```\n" +
        "\n" +
        "## Rate Limiting\n" +
        "\n" +
        "- **Rate Limit:** 100 requests per minute per API key\n" +
        "- **Burst Limit:** 10 requests per second\n" +
        "\n" +
        "If you exceed the rate limit, you'll receive a `429 Too Many Requests` response:\n" +
        "\n" +
        "```json\n" +
        "{\n" +
        "  \"data\": null,\n" +
        "  \"succeeded\": false,\n" +
        "  \"message\": \"Rate limit exceeded\",\n" +
        "  \"errors\": [\"Too many requests. Please try again later.\"]\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "## Data Freshness\n" +
        "\n" +
        "- Status is updated every **2 minutes** by the background worker\n" +
        "- Health checks are performed every **1 minute** by the monitoring service\n" +
        "- Maximum data staleness: **2 minutes**\n" +
        "\n" +
        "## Support & Contact\n" +
        "\n" +
        "For API access, technical support, or to report issues:\n" +
        "\n" +
        "- **Email:** api-support@sps.so\n" +
        "- **Technical Documentation:** https://docs.sps.so\n" +
        "- **Status Page:** https://status.sps.so\n" +
        "\n" +
        "## Changelog\n" +
        "\n" +
        "### Version 1.0 (December 2025)\n" +
        "- Initial release\n" +
        "- Live participants endpoint\n" +
        "- JWT authentication\n" +
        "- Real-time status caching\n" +
        "\n" +
        "## Appendix: Status Determination Logic\n" +
        "\n" +
        "The system uses intelligent thresholds to determine participant status:\n" +
        "\n" +
        "- **Transition to LIVE:** Requires 2+ consecutive successful health checks\n" +
        "- **Transition to OFFLINE:** Requires 3+ consecutive failed health checks\n" +
        "- **Maintain Status:** If thresholds not met, status remains unchanged\n" +
        "\n" +
        "This prevents status \"flapping\" due to temporary network issues while ensuring quick detection of actual outages.\n" +
        "\n" +
        "## Security Considerations\n" +
        "\n" +
        "1. **Token Security:** Store JWT tokens securely, never in source code\n" +
        "2. **HTTPS Only:** Always use HTTPS in production\n" +
        "3. **Token Rotation:** Refresh tokens before expiration\n" +
        "4. **IP Whitelisting:** Request IP whitelisting for production systems\n" +
        "5. **Audit Logging:** All API calls are logged for security auditing\n" +
        "\n" +
        "## SLA & Availability\n" +
        "\n" +
        "- **API Uptime:** 99.9% guaranteed\n" +
        "- **Response Time:** < 100ms (95th percentile)\n" +
        "- **Data Freshness:** < 2 minutes\n" +
        "- **Support Response:** < 4 hours for critical issues"
    return <MarkdownRenderer markdown={markdown} />;
}