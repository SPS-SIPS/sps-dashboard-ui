import MarkdownRenderer from "../../component/MarkdownRenderer";


const markdown = "# Data Protection Key Security Guide\n" +
    "\n" +
    "## 🔐 Problem: Unencrypted Key Files\n" +
    "\n" +
    "ASP.NET Core Data Protection keys are stored as **plain XML files** by default in the `keys/` directory. These files contain the master encryption keys used to encrypt/decrypt your application secrets.\n" +
    "\n" +
    "**Example key file:**\n" +
    "```xml\n" +
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<key id=\"6236f9b4-6964-4c67-b91e-061e86660530\" version=\"1\">\n" +
    "  <creationDate>2025-11-18T11:00:00Z</creationDate>\n" +
    "  <activationDate>2025-11-18T11:00:00Z</activationDate>\n" +
    "  <expirationDate>2026-02-16T11:00:00Z</expirationDate>\n" +
    "  <descriptor deserializerType=\"Microsoft.AspNetCore.DataProtection...\">\n" +
    "    <descriptor>\n" +
    "      <encryption algorithm=\"AES_256_CBC\" />\n" +
    "      <validation algorithm=\"HMACSHA256\" />\n" +
    "      <masterKey>\n" +
    "        <!-- UNENCRYPTED KEY DATA HERE -->\n" +
    "        <value>BASE64_ENCODED_KEY_MATERIAL</value>\n" +
    "      </masterKey>\n" +
    "    </descriptor>\n" +
    "  </descriptor>\n" +
    "</key>\n" +
    "```\n" +
    "\n" +
    "⚠️ **Security Risk**: Anyone with access to these files can decrypt ALL your application secrets!\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## ✅ Solution: Encrypt Keys at Rest\n" +
    "\n" +
    "The application now supports **three methods** to encrypt Data Protection keys:\n" +
    "\n" +
    "### **Method 1: X509 Certificate (Recommended for Production)**\n" +
    "### **Method 2: Windows DPAPI (Windows servers only)**\n" +
    "### **Method 3: File System Permissions (Development/Linux)**\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🎯 Method 1: X509 Certificate Encryption (Recommended)\n" +
    "\n" +
    "### **How it works:**\n" +
    "- Keys are encrypted using a certificate's public key\n" +
    "- Only the certificate's private key can decrypt them\n" +
    "- Works on all platforms (Windows, Linux, macOS, Docker)\n" +
    "\n" +
    "### **Step 1: Generate a Certificate**\n" +
    "\n" +
    "```bash\n" +
    "# Generate a self-signed certificate for key encryption\n" +
    "openssl req -x509 -newkey rsa:4096 \\\n" +
    "  -keyout dataprotection-key.pem \\\n" +
    "  -out dataprotection-cert.pem \\\n" +
    "  -days 3650 -nodes \\\n" +
    "  -subj \"/CN=SIPS.Connect.DataProtection\"\n" +
    "\n" +
    "# Convert to PFX format (required by .NET)\n" +
    "openssl pkcs12 -export \\\n" +
    "  -out dataprotection.pfx \\\n" +
    "  -inkey dataprotection-key.pem \\\n" +
    "  -in dataprotection-cert.pem \\\n" +
    "  -password pass:YourStrongPassword123\n" +
    "\n" +
    "# Secure the files\n" +
    "chmod 600 dataprotection.pfx\n" +
    "```\n" +
    "\n" +
    "### **Step 2: Configure in appsettings.json**\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"DataProtection\": {\n" +
    "    \"CertificatePath\": \"./certs/dataprotection.pfx\",\n" +
    "    \"CertificatePassword\": \"ENCRYPTED:CfDJ8...\"\n" +
    "  }\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "**Important**: Encrypt the certificate password using the secret management tool:\n" +
    "```bash\n" +
    "dotnet run -- secrets encrypt \"YourStrongPassword123\"\n" +
    "# Copy output to CertificatePassword\n" +
    "```\n" +
    "\n" +
    "### **Step 3: Deploy Certificate**\n" +
    "\n" +
    "```bash\n" +
    "# Copy certificate to deployment server\n" +
    "scp dataprotection.pfx user@server:/path/to/deployment/certs/\n" +
    "\n" +
    "# Update docker-compose.yml (already has certs volume)\n" +
    "# volumes:\n" +
    "#   - ./certs:/certs:ro\n" +
    "\n" +
    "# Set proper permissions\n" +
    "chmod 600 /path/to/deployment/certs/dataprotection.pfx\n" +
    "```\n" +
    "\n" +
    "### **Step 4: Restart Application**\n" +
    "\n" +
    "```bash\n" +
    "# Delete old unencrypted keys\n" +
    "rm -rf keys/*\n" +
    "\n" +
    "# Restart to generate new encrypted keys\n" +
    "docker compose restart sips-connect\n" +
    "\n" +
    "# Check logs\n" +
    "docker compose logs sips-connect | grep \"Data Protection\"\n" +
    "# Should show: \"Data Protection keys encrypted with certificate\"\n" +
    "```\n" +
    "\n" +
    "### **Verification**\n" +
    "\n" +
    "```bash\n" +
    "# Check new key files - should show encrypted content\n" +
    "cat keys/key-*.xml\n" +
    "```\n" +
    "\n" +
    "**Encrypted key file example:**\n" +
    "```xml\n" +
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<key id=\"...\" version=\"1\">\n" +
    "  <creationDate>2025-11-18T11:00:00Z</creationDate>\n" +
    "  <descriptor>\n" +
    "    <encryptedSecret decryptorType=\"Microsoft.AspNetCore.DataProtection.XmlEncryption.EncryptedXmlDecryptor\">\n" +
    "      <EncryptedData Type=\"http://www.w3.org/2001/04/xmlenc#Element\">\n" +
    "        <!-- ENCRYPTED KEY DATA - SAFE! -->\n" +
    "        <CipherData>\n" +
    "          <CipherValue>BASE64_ENCRYPTED_DATA</CipherValue>\n" +
    "        </CipherData>\n" +
    "      </EncryptedData>\n" +
    "    </encryptedSecret>\n" +
    "  </descriptor>\n" +
    "</key>\n" +
    "```\n" +
    "\n" +
    "✅ Keys are now encrypted!\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🪟 Method 2: Windows DPAPI (Windows Only)\n" +
    "\n" +
    "### **How it works:**\n" +
    "- Uses Windows Data Protection API\n" +
    "- Keys encrypted using machine or user credentials\n" +
    "- Automatic on Windows servers\n" +
    "- **Not portable** - keys only work on the same machine\n" +
    "\n" +
    "### **Configuration:**\n" +
    "\n" +
    "No configuration needed! The application automatically uses DPAPI on Windows if no certificate is configured.\n" +
    "\n" +
    "### **Verification:**\n" +
    "\n" +
    "```powershell\n" +
    "# Start application\n" +
    "dotnet run\n" +
    "\n" +
    "# Check logs\n" +
    "# Should show: \"Data Protection keys encrypted with Windows DPAPI\"\n" +
    "```\n" +
    "\n" +
    "### **Limitations:**\n" +
    "- ❌ Keys not portable between servers\n" +
    "- ❌ Doesn't work in Docker Linux containers\n" +
    "- ❌ Requires Windows Server\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🐧 Method 3: File System Permissions (Development/Linux)\n" +
    "\n" +
    "### **How it works:**\n" +
    "- Keys stored unencrypted\n" +
    "- Protected by file system permissions\n" +
    "- **Not recommended for production**\n" +
    "\n" +
    "### **Configuration:**\n" +
    "\n" +
    "```bash\n" +
    "# Restrict access to keys directory\n" +
    "chmod 700 keys/\n" +
    "chmod 600 keys/*.xml\n" +
    "\n" +
    "# Ensure only app user can access\n" +
    "chown -R appuser:appuser keys/\n" +
    "```\n" +
    "\n" +
    "### **Verification:**\n" +
    "\n" +
    "```bash\n" +
    "# Check permissions\n" +
    "ls -la keys/\n" +
    "# Should show: drwx------ (700)\n" +
    "\n" +
    "# Check file permissions\n" +
    "ls -la keys/*.xml\n" +
    "# Should show: -rw------- (600)\n" +
    "```\n" +
    "\n" +
    "### **Limitations:**\n" +
    "- ❌ Keys still unencrypted\n" +
    "- ❌ Root user can still read them\n" +
    "- ❌ Not suitable for production\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📊 Comparison\n" +
    "\n" +
    "| Method | Security | Portability | Platform | Recommended |\n" +
    "|--------|----------|-------------|----------|-------------|\n" +
    "| **X509 Certificate** | ⭐⭐⭐⭐⭐ | ✅ Yes | All | ✅ Production |\n" +
    "| **Windows DPAPI** | ⭐⭐⭐⭐ | ❌ No | Windows | Windows only |\n" +
    "| **File Permissions** | ⭐⭐ | ✅ Yes | Linux/macOS | Development |\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🚀 Production Deployment Checklist\n" +
    "\n" +
    "### **Before Deployment:**\n" +
    "\n" +
    "- [ ] Generate Data Protection certificate\n" +
    "- [ ] Encrypt certificate password\n" +
    "- [ ] Add certificate configuration to appsettings.json\n" +
    "- [ ] Copy certificate to deployment server\n" +
    "- [ ] Set certificate file permissions (600)\n" +
    "- [ ] Delete old unencrypted keys\n" +
    "\n" +
    "### **After Deployment:**\n" +
    "\n" +
    "- [ ] Verify logs show \"Data Protection keys encrypted with certificate\"\n" +
    "- [ ] Check key files contain `<encryptedSecret>` elements\n" +
    "- [ ] Test application can decrypt secrets\n" +
    "- [ ] Backup encrypted certificate securely\n" +
    "- [ ] Document certificate location and password\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🔄 Key Rotation\n" +
    "\n" +
    "### **When to Rotate:**\n" +
    "- Every 90 days (recommended)\n" +
    "- After security incident\n" +
    "- When certificate expires\n" +
    "- When moving to new infrastructure\n" +
    "\n" +
    "### **How to Rotate:**\n" +
    "\n" +
    "```bash\n" +
    "# 1. Generate new certificate\n" +
    "openssl pkcs12 -export \\\n" +
    "  -out dataprotection-new.pfx \\\n" +
    "  -inkey dataprotection-key.pem \\\n" +
    "  -in dataprotection-cert.pem \\\n" +
    "  -password pass:NewPassword456\n" +
    "\n" +
    "# 2. Update appsettings.json with new certificate\n" +
    "# DataProtection:CertificatePath = \"./certs/dataprotection-new.pfx\"\n" +
    "# DataProtection:CertificatePassword = \"ENCRYPTED:...\"\n" +
    "\n" +
    "# 3. Backup old keys\n" +
    "tar -czf keys-backup-$(date +%Y%m%d).tar.gz keys/\n" +
    "\n" +
    "# 4. Delete old keys\n" +
    "rm -rf keys/*\n" +
    "\n" +
    "# 5. Restart application (generates new encrypted keys)\n" +
    "docker compose restart sips-connect\n" +
    "\n" +
    "# 6. Re-encrypt all application secrets with new keys\n" +
    "dotnet run -- secrets encrypt-file appsettings.json\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🆘 Troubleshooting\n" +
    "\n" +
    "### **Problem: \"Failed to load Data Protection certificate\"**\n" +
    "\n" +
    "**Cause:** Certificate file not found or wrong password\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Check certificate exists\n" +
    "ls -la certs/dataprotection.pfx\n" +
    "\n" +
    "# Test certificate can be loaded\n" +
    "openssl pkcs12 -in certs/dataprotection.pfx -noout\n" +
    "# Enter password when prompted\n" +
    "\n" +
    "# Verify password is correct in appsettings.json\n" +
    "```\n" +
    "\n" +
    "### **Problem: Keys still unencrypted after configuration**\n" +
    "\n" +
    "**Cause:** Old keys generated before certificate was configured\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Delete old keys\n" +
    "rm -rf keys/*\n" +
    "\n" +
    "# Restart to generate new encrypted keys\n" +
    "docker compose restart sips-connect\n" +
    "```\n" +
    "\n" +
    "### **Problem: \"Cannot decrypt secrets\" after key rotation**\n" +
    "\n" +
    "**Cause:** Application secrets encrypted with old keys\n" +
    "\n" +
    "**Solution:**\n" +
    "```bash\n" +
    "# Restore old keys temporarily\n" +
    "tar -xzf keys-backup-YYYYMMDD.tar.gz\n" +
    "\n" +
    "# Decrypt secrets\n" +
    "dotnet run -- secrets decrypt-file appsettings.json > appsettings-plain.json\n" +
    "\n" +
    "# Switch to new keys\n" +
    "rm -rf keys/*\n" +
    "docker compose restart sips-connect\n" +
    "\n" +
    "# Re-encrypt with new keys\n" +
    "dotnet run -- secrets encrypt-file appsettings-plain.json\n" +
    "mv appsettings-plain.json appsettings.json\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🛡️ Security Best Practices\n" +
    "\n" +
    "### **Certificate Management:**\n" +
    "\n" +
    "1. **Store certificate securely**\n" +
    "   - Use hardware security module (HSM) if available\n" +
    "   - Or encrypted storage with restricted access\n" +
    "   - Never commit to Git\n" +
    "\n" +
    "2. **Protect certificate password**\n" +
    "   - Use strong password (20+ characters)\n" +
    "   - Store encrypted in appsettings.json\n" +
    "   - Or use environment variable\n" +
    "\n" +
    "3. **Backup certificate**\n" +
    "   - Keep encrypted backup in secure location\n" +
    "   - Document recovery procedure\n" +
    "   - Test restore process\n" +
    "\n" +
    "### **Key File Protection:**\n" +
    "\n" +
    "1. **Restrict file access**\n" +
    "   ```bash\n" +
    "   chmod 700 keys/\n" +
    "   chmod 600 keys/*.xml\n" +
    "   chown appuser:appuser keys/\n" +
    "   ```\n" +
    "\n" +
    "2. **Monitor access**\n" +
    "   ```bash\n" +
    "   # Enable audit logging\n" +
    "   auditctl -w /path/to/keys -p rwa -k dataprotection_keys\n" +
    "   ```\n" +
    "\n" +
    "3. **Regular backups**\n" +
    "   ```bash\n" +
    "   # Automated backup script\n" +
    "   tar -czf keys-backup-$(date +%Y%m%d).tar.gz keys/\n" +
    "   gpg -c keys-backup-$(date +%Y%m%d).tar.gz\n" +
    "   ```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 📝 Configuration Examples\n" +
    "\n" +
    "### **Development (Unencrypted - Warning shown)**\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"DataProtection\": {\n" +
    "    // No configuration - keys stored unencrypted\n" +
    "  }\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "**Log output:**\n" +
    "```\n" +
    "⚠️  Data Protection keys are stored UNENCRYPTED. For production, configure DataProtection:CertificatePath\n" +
    "```\n" +
    "\n" +
    "### **Production (Certificate-encrypted)**\n" +
    "\n" +
    "```json\n" +
    "{\n" +
    "  \"DataProtection\": {\n" +
    "    \"CertificatePath\": \"./certs/dataprotection.pfx\",\n" +
    "    \"CertificatePassword\": \"ENCRYPTED:CfDJ8LT5NmJkaWdMuR4GHoZmBTBGFIayVVur3z1m62ZTzpTI...\"\n" +
    "  }\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "**Log output:**\n" +
    "```\n" +
    "Data Protection keys encrypted with certificate: ./certs/dataprotection.pfx\n" +
    "```\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## 🎯 Summary\n" +
    "\n" +
    "### **Current Implementation:**\n" +
    "\n" +
    "✅ **Automatic encryption detection**\n" +
    "- Certificate (if configured) → Best security\n" +
    "- Windows DPAPI (if on Windows) → Good security\n" +
    "- Unencrypted (with warning) → Development only\n" +
    "\n" +
    "✅ **Cross-platform support**\n" +
    "- Works on Windows, Linux, macOS, Docker\n" +
    "\n" +
    "✅ **Flexible configuration**\n" +
    "- Certificate path in appsettings.json\n" +
    "- Password encrypted using secret management\n" +
    "\n" +
    "### **Recommended Setup:**\n" +
    "\n" +
    "**Development:**\n" +
    "```bash\n" +
    "# No configuration needed\n" +
    "# Warning shown in logs\n" +
    "```\n" +
    "\n" +
    "**Production:**\n" +
    "```bash\n" +
    "# Generate certificate\n" +
    "openssl pkcs12 -export -out dataprotection.pfx ...\n" +
    "\n" +
    "# Configure in appsettings.json\n" +
    "{\n" +
    "  \"DataProtection\": {\n" +
    "    \"CertificatePath\": \"./certs/dataprotection.pfx\",\n" +
    "    \"CertificatePassword\": \"ENCRYPTED:...\"\n" +
    "  }\n" +
    "}\n" +
    "\n" +
    "# Deploy and verify\n" +
    "docker compose up -d\n" +
    "docker compose logs | grep \"Data Protection\"\n" +
    "```\n" +
    "\n" +
    "**Your Data Protection keys are now secure!** 🔐✅";

export default function DataProtectionKeys() {
    return <MarkdownRenderer markdown={markdown} />;
}