import MarkdownRenderer from "../../../component/MarkdownRenderer";
const markdown = "# SIPS Handler Test Scenarios\n" +
    "\n" +
    "This document provides detailed test scenarios for each handler with expected behaviors and validation points.\n" +
    "\n" +
    "## Table of Contents\n" +
    "1. [IncomingTransactionHandler](#incomingtransactionhandler)\n" +
    "2. [IncomingVerificationHandler](#incomingverificationhandler)\n" +
    "3. [IncomingTransactionStatusHandler](#incomingtransactionstatushandler)\n" +
    "4. [IncomingPaymentStatusReportHandler](#incomingpaymentstatusreporthandler)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## IncomingTransactionHandler\n" +
    "\n" +
    "**Purpose:** Processes incoming pacs.008 payment requests\n" +
    "\n" +
    "### Test Scenario 1: Successful Payment Request\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.008.xml`\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler validates XML signature\n" +
    "2. Parses pacs.008 message\n" +
    "3. Records incoming transaction in database\n" +
    "4. Calls CoreBank payment endpoint\n" +
    "5. Returns signed pacs.002 response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Response contains signed FPEnvelope\n" +
    "- ✅ Response contains pacs.002 document\n" +
    "- ✅ Transaction persisted with Status = Pending or Success\n" +
    "- ✅ CoreBank callback was invoked\n" +
    "\n" +
    "**Database Checks:**\n" +
    "```sql\n" +
    "SELECT * FROM iso_messages WHERE TxId = 'AGROSOS0528910638962089436554484';\n" +
    "-- Should show Status = Success or Pending\n" +
    "```\n" +
    "\n" +
    "### Test Scenario 2: CoreBank Callback Failure\n" +
    "\n" +
    "**Setup:** Configure CoreBank endpoint to return error or be unavailable\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler processes message\n" +
    "2. CoreBank callback fails\n" +
    "3. Transaction marked as Failed or Pending\n" +
    "4. Returns appropriate response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK (handler still returns response)\n" +
    "- ✅ Transaction Status = Failed or Pending\n" +
    "- ✅ Error logged in system\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## IncomingVerificationHandler\n" +
    "\n" +
    "**Purpose:** Processes incoming acmt.023 verification requests\n" +
    "\n" +
    "### Test Scenario 1: Successful Verification\n" +
    "\n" +
    "**Payload:** `Payloads/acmt.023.xml`\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler validates XML signature\n" +
    "2. Parses acmt.023 message\n" +
    "3. Calls verification service\n" +
    "4. Returns signed acmt.024 response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Response contains signed FPEnvelope\n" +
    "- ✅ Response contains acmt.024 document\n" +
    "- ✅ Verification result persisted\n" +
    "\n" +
    "### Test Scenario 2: Verification Service Unavailable\n" +
    "\n" +
    "**Setup:** Configure verification service to be unavailable\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler processes message\n" +
    "2. Verification service call fails\n" +
    "3. Returns error response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK or 500\n" +
    "- ✅ Error logged\n" +
    "- ✅ Appropriate error message in response\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## IncomingTransactionStatusHandler\n" +
    "\n" +
    "**Purpose:** Processes incoming pacs.002 transaction status reports\n" +
    "\n" +
    "### Test Scenario 1: Status Update for Existing Transaction\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-status.xml`\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "- Transaction with TxId exists in database\n" +
    "- Transaction Status = Pending\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler validates XML signature\n" +
    "2. Parses pacs.002 message\n" +
    "3. Retrieves existing transaction\n" +
    "4. Updates transaction status\n" +
    "5. Returns signed response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction status updated in database\n" +
    "- ✅ ISOMessageStatus record created\n" +
    "- ✅ Response contains acknowledgment\n" +
    "\n" +
    "**Database Checks:**\n" +
    "```sql\n" +
    "SELECT * FROM iso_message_statuses \n" +
    "WHERE ISOMessageId = (SELECT Id FROM iso_messages WHERE TxId = 'TX-TEST-001')\n" +
    "ORDER BY CreatedAt DESC LIMIT 1;\n" +
    "-- Should show latest status update\n" +
    "```\n" +
    "\n" +
    "### Test Scenario 2: Status for Non-Existent Transaction\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-notfound.xml`\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler attempts to retrieve transaction\n" +
    "2. Transaction not found\n" +
    "3. Returns admi.002 error response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK (with admi.002) or 404\n" +
    "- ✅ Response indicates transaction not found\n" +
    "- ✅ No database changes\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## IncomingPaymentStatusReportHandler\n" +
    "\n" +
    "**Purpose:** Processes pacs.002 payment status reports with business logic\n" +
    "\n" +
    "### Test Scenario 1: ACSC Status - CoreBank Success\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-acsc.xml`\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "- Transaction with matching TxId exists\n" +
    "- Transaction Status = Pending\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler validates and parses message\n" +
    "2. Retrieves transaction from database\n" +
    "3. Calls CoreBank callback with payment details\n" +
    "4. CoreBank returns success\n" +
    "5. Updates transaction Status = Success\n" +
    "6. Returns signed response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status = Success\n" +
    "- ✅ Transaction Reason contains \"Processed\" or success message\n" +
    "- ✅ CoreBank callback invoked\n" +
    "- ✅ ISOMessageStatus persisted\n" +
    "\n" +
    "**Database Checks:**\n" +
    "```sql\n" +
    "SELECT Status, Reason, AdditionalInfo \n" +
    "FROM iso_messages \n" +
    "WHERE TxId = 'TX-ACSC-001';\n" +
    "-- Status should be 'Success'\n" +
    "-- Reason should contain success message\n" +
    "```\n" +
    "\n" +
    "### Test Scenario 2: ACSC Status - CoreBank Failure\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-acsc.xml`\n" +
    "\n" +
    "**Setup:** Configure CoreBank to return error\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler processes message\n" +
    "2. Calls CoreBank callback\n" +
    "3. CoreBank returns error\n" +
    "4. Updates transaction Status = ReadyForReturn\n" +
    "5. Returns signed response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status = ReadyForReturn\n" +
    "- ✅ Transaction Reason = \"CoreBank callback failed\"\n" +
    "- ✅ Manual intervention required\n" +
    "\n" +
    "**Database Checks:**\n" +
    "```sql\n" +
    "SELECT Status, Reason \n" +
    "FROM iso_messages \n" +
    "WHERE TxId = 'TX-ACSC-001';\n" +
    "-- Status should be 'ReadyForReturn'\n" +
    "-- Reason should indicate CoreBank failure\n" +
    "```\n" +
    "\n" +
    "### Test Scenario 3: RJCT Status\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-rjct.xml`\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "- Transaction with matching TxId exists\n" +
    "- Transaction Status = Pending\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler validates and parses message\n" +
    "2. Detects RJCT status\n" +
    "3. Updates transaction Status = Failed\n" +
    "4. Does NOT call CoreBank (payment rejected by IPS)\n" +
    "5. Returns signed response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status = Failed\n" +
    "- ✅ Transaction Reason = \"Received rejection confirmation\"\n" +
    "- ✅ CoreBank callback NOT invoked\n" +
    "- ✅ Rejection reason captured in AdditionalInfo\n" +
    "\n" +
    "**Database Checks:**\n" +
    "```sql\n" +
    "SELECT Status, Reason, AdditionalInfo \n" +
    "FROM iso_messages \n" +
    "WHERE TxId = 'TX-RJCT-001';\n" +
    "-- Status should be 'Failed'\n" +
    "-- Reason should indicate rejection\n" +
    "-- AdditionalInfo should contain rejection details (e.g., \"AM04 - Insufficient funds\")\n" +
    "```\n" +
    "\n" +
    "### Test Scenario 4: Idempotency - Duplicate ACSC for Success Transaction\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-acsc.xml` (send twice)\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "- First request already processed successfully\n" +
    "- Transaction Status = Success\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler detects transaction already successful\n" +
    "2. Does NOT call CoreBank again\n" +
    "3. Persists status for audit trail\n" +
    "4. Returns signed response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status remains Success\n" +
    "- ✅ CoreBank callback NOT invoked (idempotency)\n" +
    "- ✅ New ISOMessageStatus record created (audit trail)\n" +
    "\n" +
    "### Test Scenario 5: Idempotency - Duplicate ACSC for Failed Transaction\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-acsc.xml`\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "- Transaction Status = Failed (from previous RJCT)\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler detects transaction already failed\n" +
    "2. Does NOT process again\n" +
    "3. Returns signed response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK\n" +
    "- ✅ Transaction Status remains Failed\n" +
    "- ✅ No business logic re-executed\n" +
    "\n" +
    "### Test Scenario 6: Transaction Not Found\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-notfound.xml`\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler attempts to retrieve transaction\n" +
    "2. Transaction not found in database\n" +
    "3. Returns admi.002 error response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 200 OK (with admi.002) or 404\n" +
    "- ✅ Response indicates transaction not found\n" +
    "- ✅ Error logged\n" +
    "\n" +
    "### Test Scenario 7: Invalid Signature\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.008-invalid-signature.xml`\n" +
    "\n" +
    "**Expected Behavior:**\n" +
    "1. Handler attempts signature validation\n" +
    "2. Signature validation fails\n" +
    "3. Returns error response\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ HTTP Status: 401 Unauthorized or 400 Bad Request\n" +
    "- ✅ Error message indicates signature failure\n" +
    "- ✅ No database changes\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Return Completion Scenarios\n" +
    "\n" +
    "### Test Scenario 8: Return Completion (Future Feature)\n" +
    "\n" +
    "**Note:** Current implementation does NOT support automatic return completion.\n" +
    "\n" +
    "**Payload:** `Payloads/pacs.002-payment-status-acsc.xml`\n" +
    "\n" +
    "**Prerequisites:**\n" +
    "- Transaction Status = ReadyForReturn\n" +
    "\n" +
    "**Current Behavior:**\n" +
    "1. Handler processes ACSC status\n" +
    "2. Transaction remains ReadyForReturn\n" +
    "3. CoreBank Return endpoint NOT called automatically\n" +
    "\n" +
    "**Future Behavior (when implemented):**\n" +
    "1. Handler detects ReadyForReturn status\n" +
    "2. Calls CoreBank Return endpoint\n" +
    "3. If successful, updates Status = Success\n" +
    "4. If failed, keeps Status = ReadyForReturn\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Performance Testing\n" +
    "\n" +
    "### Load Test Scenario\n" +
    "\n" +
    "**Objective:** Test handler performance under load\n" +
    "\n" +
    "**Setup:**\n" +
    "1. Use Apache JMeter or similar tool\n" +
    "2. Send 100 concurrent requests\n" +
    "3. Monitor response times and error rates\n" +
    "\n" +
    "**Validation Points:**\n" +
    "- ✅ Average response time < 500ms\n" +
    "- ✅ 95th percentile < 1000ms\n" +
    "- ✅ Error rate < 1%\n" +
    "- ✅ No database deadlocks\n" +
    "- ✅ All transactions processed correctly\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Integration Testing Checklist\n" +
    "\n" +
    "### Before Testing\n" +
    "- [ ] API project is running\n" +
    "- [ ] Database is accessible and seeded with test data\n" +
    "- [ ] CoreBank mock/test endpoints are configured\n" +
    "- [ ] Verification service is available\n" +
    "- [ ] Logging is enabled\n" +
    "- [ ] Test certificates/keys are configured\n" +
    "\n" +
    "### During Testing\n" +
    "- [ ] Monitor application logs\n" +
    "- [ ] Check database for expected changes\n" +
    "- [ ] Verify CoreBank callbacks are made\n" +
    "- [ ] Validate XML signatures in responses\n" +
    "- [ ] Check for memory leaks or performance issues\n" +
    "\n" +
    "### After Testing\n" +
    "- [ ] Review test results\n" +
    "- [ ] Clean up test data\n" +
    "- [ ] Document any issues found\n" +
    "- [ ] Update test scenarios as needed\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Troubleshooting Guide\n" +
    "\n" +
    "### Issue: Signature Validation Fails\n" +
    "\n" +
    "**Possible Causes:**\n" +
    "- Incorrect public key configuration\n" +
    "- XML signature malformed\n" +
    "- Certificate expired\n" +
    "\n" +
    "**Resolution:**\n" +
    "1. Verify public key in configuration\n" +
    "2. Check certificate validity\n" +
    "3. Validate XML signature format\n" +
    "\n" +
    "### Issue: Transaction Not Found\n" +
    "\n" +
    "**Possible Causes:**\n" +
    "- Transaction not seeded in database\n" +
    "- TxId mismatch\n" +
    "- Database connection issue\n" +
    "\n" +
    "**Resolution:**\n" +
    "1. Check database for transaction\n" +
    "2. Verify TxId in payload matches database\n" +
    "3. Test database connectivity\n" +
    "\n" +
    "### Issue: CoreBank Callback Fails\n" +
    "\n" +
    "**Possible Causes:**\n" +
    "- CoreBank endpoint unavailable\n" +
    "- Network connectivity issue\n" +
    "- Invalid request format\n" +
    "\n" +
    "**Resolution:**\n" +
    "1. Verify CoreBank endpoint URL\n" +
    "2. Check network connectivity\n" +
    "3. Review CoreBank logs\n" +
    "4. Validate request payload format\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Test Data Management\n" +
    "\n" +
    "### Creating Test Transactions\n" +
    "\n" +
    "```sql\n" +
    "-- Insert test transaction\n" +
    "INSERT INTO iso_messages (TxId, EndToEndId, BizMsgIdr, MsgDefIdr, MsgId, Status, CreatedAt)\n" +
    "VALUES ('TX-TEST-001', 'E2E-TEST-001', 'MSG-TEST-001', 'pacs.008.001.10', 'MSG-001', 'Pending', NOW());\n" +
    "\n" +
    "-- Insert transaction details\n" +
    "INSERT INTO transactions (ISOMessageId, Amount, Currency, DebtorName, CreditorName, ...)\n" +
    "VALUES (...);\n" +
    "```\n" +
    "\n" +
    "### Cleaning Up Test Data\n" +
    "\n" +
    "```sql\n" +
    "-- Remove test transactions\n" +
    "DELETE FROM iso_message_statuses WHERE ISOMessageId IN (SELECT Id FROM iso_messages WHERE TxId LIKE 'TX-TEST-%');\n" +
    "DELETE FROM transactions WHERE ISOMessageId IN (SELECT Id FROM iso_messages WHERE TxId LIKE 'TX-TEST-%');\n" +
    "DELETE FROM iso_messages WHERE TxId LIKE 'TX-TEST-%';\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Appendix: Status Codes Reference\n" +
    "\n" +
    "### Transaction Status Values\n" +
    "- **Pending:** Initial state, awaiting processing\n" +
    "- **Success:** Transaction completed successfully\n" +
    "- **Failed:** Transaction failed (rejected or error)\n" +
    "- **ReadyForReturn:** Awaiting manual return processing\n" +
    "\n" +
    "### HTTP Status Codes\n" +
    "- **200 OK:** Request processed successfully\n" +
    "- **400 Bad Request:** Invalid request format\n" +
    "- **401 Unauthorized:** Invalid signature\n" +
    "- **404 Not Found:** Transaction not found\n" +
    "- **500 Internal Server Error:** Handler processing error\n" +
    "\n" +
    "### ISO 20022 Status Codes\n" +
    "- **ACSC:** AcceptedSettlementCompleted\n" +
    "- **RJCT:** Rejected\n" +
    "- **PDNG:** Pending";

export default function TestScenarios() {
    return <MarkdownRenderer markdown={markdown} />;
}