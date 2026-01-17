import MarkdownRenderer from "../../component/MarkdownRenderer";

const markdown = "## Certificate Generation and Validation Process\n" +
    "#### Overview\n" +
    "understanding of the below commands is a mandatory requirement for the below procedure.\n" +
    "#### Pre-requisites\n" +
    "1. **OpenSSL**  \n" +
    "   Ensure that OpenSSL is installed on your machine.  \n" +
    "   ```bash\n" +
    "   # For macOS, use the following command\n" +
    "   brew install openssl\n" +
    "\n" +
    "   # For Windows, download the installer from https://slproweb.com/products/Win32OpenSSL.html\n" +
    "\n" +
    "   # For Linux, use the following command\n" +
    "   sudo apt-get install openssl\n" +
    "   ```\n" +
    "```bash\n" +
    "2. **Certificate Authority (CA)**\n" +
    "    Contact the SPS CA team to get a user account and access to the CA server.\n" +
    "```\n" +
    "1. **Generate a Certificate Signing Request (CSR) and Encrypted Private Key**  \n" +
    "   Execute the following command to create a CSR and an **encrypted** private key:  \n" +
    "   ```bash\n" +
    "   # This will prompt you for a passphrase to encrypt the private key\n" +
    "   openssl req -new -newkey rsa:2048 -keyout private.key -out request.csr -subj \"/CN=<your-bic>\"\n" +
    "   \n" +
    "   # You will be prompted to enter and verify a passphrase\n" +
    "   # IMPORTANT: Store this passphrase securely - you'll need it to use the private key\n" +
    "   # Add the passphrase to appsettings.json under Xades.PrivateKeyPassphrase\n" +
    "   ```\n" +
    "   \n" +
    "   **⚠️ Security Note:** The private key is now encrypted with AES-256. Never use the `-nodes` flag in production as it creates an unencrypted key.\n" +
    "### Procedure for Generating and Verifying Certificates Using OpenSSL\n" +
    "2. **Submit the CSR to the Certificate Authority (CA)**  \n" +
    "   Copy the CSR content and submit it to the CA server:  \n" +
    "   ```bash\n" +
    "   # For macOS, use the following command\n" +
    "   cat request.csr | pbcopy \n" +
    "\n" +
    "   # For Windows, use the following command\n" +
    "   type request.csr | clip\n" +
    "\n" +
    "   # For Linux, use the following command\n" +
    "   xclip -sel clip < request.csr\n" +
    "\n" +
    "   # just in case, you can also use the following command to copy the content\n" +
    "   cat request.csr\n" +
    "\n" +
    "   ```\n" +
    "   Paste the content into the CA's CSR submission form.\n" +
    "\n" +
    "3. **Retrieve the Certificate**  \n" +
    "   After the CA administrator approves the CSR, download the `certnew.p7b` file in PEM format.\n" +
    "\n" +
    "4. **Extract the Certificate Chain**  \n" +
    "   Convert the `certnew.p7b` file into a PEM format chain:  \n" +
    "   ```bash\n" +
    "   openssl pkcs7 -print_certs -in certnew.p7b -out chain.pem\n" +
    "\n" +
    "   # Extract the certificate from the chain file it's the first certificate in the chain\n" +
    "    openssl x509 -in chain.pem -out certificate.cer\n" +
    "    \n" +
    "    # You can also normally cut the certificate from the chain file using the following command\n" +
    "    cat chain.pem | sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > certificate.cer\n" +
    "\n" +
    "    # Also you can use normal text editor to cut the certificate from the chain file and save it as certificate.cer file\n" +
    "\n" +
    "    # Remove the certificate from the chain file\n" +
    "    sed -i '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/d' chain.pem\n" +
    "\n" +
    "    # Now the chain.pem file contains the chain of certificates (intermediate and root certificates)\n" +
    "   ```\n" +
    "\n" +
    "5. **Validate Modulus Consistency**  \n" +
    "   Ensure the modulus of the private key, the certificate, and the CSR match:  \n" +
    "   ```bash\n" +
    "   openssl req -noout -modulus -in request.csr | openssl md5\n" +
    "   openssl x509 -noout -modulus -in certificate.cer | openssl md5\n" +
    "   \n" +
    "   # For encrypted private key, you'll be prompted for the passphrase\n" +
    "   openssl rsa -noout -modulus -in private.key | openssl md5\n" +
    "   \n" +
    "   # All three MD5 hashes must match exactly\n" +
    "   ```\n" +
    "\n" +
    "6. **Validate Certificate and Chain Modulus Consistency**  \n" +
    "   Verify that the modulus of the certificate matches the chain:  \n" +
    "   ```bash\n" +
    "   openssl x509 -noout -modulus -in certificate.cer | openssl md5\n" +
    "   openssl x509 -noout -modulus -in chain.pem | openssl md5\n" +
    "   ```\n" +
    "\n" +
    "7. **Verify Certificate Validity**  \n" +
    "   Confirm the certificate's validity against the provided CA chain:  \n" +
    "   ```bash\n" +
    "   openssl verify -verbose -CAfile chain.pem certificate.cer\n" +
    "   ```\n" +
    "\n" +
    "8. **Verify Certificate and Chain Completeness**  \n" +
    "   Check the certificate's validity and completeness of the chain:  \n" +
    "   ```bash\n" +
    "   openssl verify -verbose -CAfile chain.pem -untrusted chain.pem certificate.cer\n" +
    "   ```\n" +
    "\n" +
    "9. **Install both intermediate and root certificates in your machine**  \n" +
    "   ```bash\n" +
    "    # For macOS, use the following command\n" +
    "    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain intermediate.crt\n" +
    "\n" +
    "    # For Windows, use the following command\n" +
    "    certutil -addstore -f \"ROOT\" intermediate.crt\n" +
    "\n" +
    "    # For Linux, use the following command\n" +
    "    sudo cp intermediate.crt /usr/local/share/ca-certificates/intermediate.crt\n" +
    "    sudo update-ca-certificates\n" +
    "   ```\n" +
    "\n" +
    "This structured process ensures the secure generation, verification, and validation of certificates.\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Configuring the Private Key Passphrase in SIPS.Connect\n" +
    "\n" +
    "After generating your encrypted private key, you need to configure the passphrase in your application:\n" +
    "\n" +
    "### Option 1: Plain Text (Development Only)\n" +
    "```json\n" +
    "{\n" +
    "  \"Xades\": {\n" +
    "    \"PrivateKeyPassphrase\": \"your-passphrase-here\"\n" +
    "  }\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "### Option 2: Encrypted (Recommended for Production)\n" +
    "\n" +
    "1. **Encrypt the passphrase using the Secret Management API:**\n" +
    "   ```bash\n" +
    "   curl -X POST https://localhost:443/api/v1/SecretManagement/encrypt \\\n" +
    "     -H \"Authorization: Bearer YOUR_TOKEN\" \\\n" +
    "     -H \"Content-Type: application/json\" \\\n" +
    "     -d '\"your-passphrase-here\"'\n" +
    "   ```\n" +
    "\n" +
    "2. **Update appsettings.json with the encrypted value:**\n" +
    "   ```json\n" +
    "   {\n" +
    "     \"Xades\": {\n" +
    "       \"PrivateKeyPassphrase\": \"ENCRYPTED:CfDJ8...\"\n" +
    "     }\n" +
    "   }\n" +
    "   ```\n" +
    "\n" +
    "3. **Or use the Configuration API:**\n" +
    "   ```bash\n" +
    "   curl -X PUT https://localhost:443/api/v1/Configurations/Xades \\\n" +
    "     -H \"Authorization: Bearer YOUR_TOKEN\" \\\n" +
    "     -H \"Content-Type: application/json\" \\\n" +
    "     -d '{\n" +
    "       \"CertificatePath\": \"./certs/certificate.pem\",\n" +
    "       \"PrivateKeyPath\": \"./certs/private.key\",\n" +
    "       \"PrivateKeyPassphrase\": \"your-passphrase-here\",\n" +
    "       \"ChainPath\": \"./certs/chain.pem\"\n" +
    "     }'\n" +
    "   ```\n" +
    "   The API will automatically encrypt the passphrase before saving.\n" +
    "\n" +
    "**⚠️ Security Best Practice:**\n" +
    "- Never commit plain text passphrases to version control\n" +
    "- Always use encrypted passphrases in production\n" +
    "- Store the Data Protection keys securely (see `DATA_PROTECTION_KEY_SECURITY.md`)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## I do not use windows or linux, so the commands are not tested on those platforms. Please test them on your own before using them, or simply use macOS 😬.\n" +
    "## Certification Disclaimer\n" +
    "This document is intended only to provide general guidance to the certificate generation and validation process. It is not intended to provide legal advice or to be a comprehensive guide to the certificate generation and validation process. It is not intended to be a substitute for professional advice. You should not act upon information contained in this document without seeking professional advice. The information contained in this document is provided on an \"as is\" basis with no guarantees of completeness, accuracy, usefulness, or timeliness. The information contained in this document is subject to change without notice. The author disclaims all warranties, express or implied, including, but not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the author be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this document, even if advised of the possibility of such damage.";

export default function Pki() {
    return <MarkdownRenderer markdown={markdown} />;
}