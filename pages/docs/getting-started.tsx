import MarkdownRenderer from "../../component/MarkdownRenderer";

const markdown = "# SIPS Connect Platform Documentation\n" +
    "\n" +
    "## Table of Contents\n" +
    "\n" +
    "- [SIPS Connect Platform Documentation](#sips-connect-platform-documentation)\n" +
    "  - [Table of Contents](#table-of-contents)\n" +
    "  - [Introduction](#introduction)\n" +
    "  - [Features](#features)\n" +
    "  - [Installation](#installation)\n" +
    "  - [Sample `.env` File](#sample-env-file)\n" +
    "  - [Architecture Overview](#architecture-overview)\n" +
    "  - [API Reference](#api-reference)\n" +
    "    - [Transaction Gateway](#transaction-gateway)\n" +
    "      - [POST `/api/v1/gateway/Verify`](#post-apiv1gatewayverify)\n" +
    "      - [POST `/api/v1/gateway/Payment`](#post-apiv1gatewaypayment)\n" +
    "      - [POST `/api/v1/gateway/status`](#post-apiv1gatewaystatus)\n" +
    "      - [POST `/api/v1/gateway/return`](#post-apiv1gatewayreturn)\n" +
    "    - [Incoming Messages](#incoming-messages)\n" +
    "      - [POST `/api/v1/incoming`](#post-apiv1incoming)\n" +
    "      - [POST `/api/v1/incoming`](#post-apiv1incoming-1)\n" +
    "      - [POST `/api/v1/incoming`](#post-apiv1incoming-2)\n" +
    "      - [POST `/api/v1/incoming`](#post-apiv1incoming-3)\n" +
    "      - [POST `/api/v1/incoming`](#post-apiv1incoming-4)\n" +
    "    - [SomQR Merchant](#somqr-merchant)\n" +
    "      - [POST `/api/v1/somqr/GenerateMerchantQR`](#post-apiv1somqrgeneratemerchantqr)\n" +
    "      - [GET `/api/v1/somqr/ParseMerchantQR`](#get-apiv1somqrparsemerchantqr)\n" +
    "    - [SomQR Person](#somqr-person)\n" +
    "      - [POST `/api/v1/somqr/GeneratePersonQR`](#post-apiv1somqrgeneratepersonqr)\n" +
    "      - [GET `/api/v1/somqr/ParsePersonQR`](#get-apiv1somqrparsepersonqr)\n" +
    "  - [Authentication \\& Authorization](#authentication--authorization)\n" +
    "    - [Bearer Token Authentication](#bearer-token-authentication)\n" +
    "  - [Error Handling](#error-handling)\n" +
    "  - [Security](#security)\n" +
    "  - [Database Management](#database-management)\n" +
    "  - [Integration with SPS Public Key Repository](#integration-with-sps-public-key-repository)\n" +
    "  - [Contact \\& Support](#contact--support)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "## Introduction\n" +
    "\n" +
    "The **SIPS Connect Platform** is a robust solution designed to facilitate the seamless sending and receiving of money between the SIPS SVIP system and local banking systems (Core Banking System). It achieves this by translating ISO 20022 messages to and from Local Bank JSON APIs, ensuring secure and efficient financial transactions.\n" +
    "\n" +
    "## Features\n" +
    "\n" +
    "- **Message Translation:** Converts ISO 20022 messages from SIPS to Local Bank JSON API and vice versa.\n" +
    "- **Transaction Signing:** Secures transactions using private key encryption.\n" +
    "- **Transaction Verification:** Validates transactions using public keys integrated with the SPS Public Key Repository.\n" +
    "- **Data Persistence:** Stores all verifications and transactions in a secure database for audit and reference purposes.\n" +
    "\n" +
    "## Installation\n" +
    "\n" +
    "Docker is required to run the SIPS Connect Platform. To install Docker, follow the instructions provided in the official Docker documentation: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)\n" +
    "\n" +
    "To run the SIPS Connect Platform, follow these steps:\n" +
    "\n" +
    "1. Clone the repository:\n" +
    "   ```bash\n" +
    "   git clone https://github.com/SPS-SIPS/SIPS.Connect.git\n" +
    "   ```\n" +
    "2. Navigate to the project directory:\n" +
    "   ```bash\n" +
    "   cd SIPS.Connect\n" +
    "   ```\n" +
    "3. Fill in the required environment variables in the `.env` file:\n" +
    "4. Create Docker Network:\n" +
    "   ```bash\n" +
    "   docker network create --driver bridge sips-network\n" +
    "   ```\n" +
    "5. Run the Docker container:\n" +
    "   ```bash\n" +
    "    docker-compose up -d\n" +
    "   ```\n" +
    "6. Access the SIPS Connect Platform at `http://localhost:8080`\n" +
    "7. To stop the Docker container, run:\n" +
    "   ```bash\n" +
    "   docker-compose down\n" +
    "   ```\n" +
    "8. To view the logs, run:\n" +
    "   ```bash\n" +
    "    docker-compose logs -f\n" +
    "   ```\n" +
    "\n" +
    "## Sample `.env` File\n" +
    "\n" +
    "```env\n" +
    "Serilog__WriteTo__File__Args__path=/logs/log.log\n" +
    "Serilog__MinimumLevel__Override__Microsoft=Information\n" +
    "Serilog__MinimumLevel__Override__System=Information\n" +
    "Serilog__MinimumLevel__Default=Information\n" +
    "\n" +
    "PGUSER=postgres\n" +
    "POSTGRES_PASSWORD=<DB_PASSWORD>\n" +
    "POSTGRES_DB=postgres\n" +
    "\n" +
    "ASPNETCORE_ENVIRONMENT=Development\n" +
    "\n" +
    "ConnectionStrings__db=\"Host=sips-connect-db;Database=SIPS.Connect.DB;Include Error Detail=True;Username=postgres;Password=<DB_PASSWORD>;\"\n" +
    "KC_DB=postgres\n" +
    "KC_DB_USERNAME=postgres\n" +
    "KC_DB_PASSWORD=<DB_PASSWORD>\n" +
    "KC_DB_URL=\"jdbc:postgresql://sips-connect-db:5432/postgres\"\n" +
    "\n" +
    "Keycloak__Realm__Host=\"idp:8080\"\n" +
    "Keycloak__Realm__Protocol=\"http\"\n" +
    "Keycloak__Realm__ValidateIssuer=false\n" +
    "Keycloak__Realm__Name=\"mgt\"\n" +
    "Keycloak__Realm__Audience=\"sc-api\"\n" +
    "Keycloak__Realm__ValidIssuers__0=\"http://idp:8080\"\n" +
    "\n" +
    "# all other environment variables can be set using the SIPS Connect Platform UI http://sips-connect-ui:port/config/endpoint\n" +
    "\n" +
    "# Certificate and Private Key locations Must be mounted in the container this has to be done in the docker-compose file \n" +
    "# Currently the docker-compose file mounts the certificates and private key from the host machine to the container\n" +
    "# Review the docker-compose file for the correct path\n" +
    "\n" +
    "```\n" +
    "\n" +
    "## Architecture Overview\n" +
    "\n" +
    "The SIPS Connect Platform acts as an intermediary gateway, handling both outbound and inbound financial transactions. It ensures data integrity and security through cryptographic signing and verification mechanisms while maintaining comprehensive records in its database.\n" +
    "\n" +
    "## API Reference\n" +
    "\n" +
    "### Transaction Gateway\n" +
    "\n" +
    "The Transaction Gateway facilitates the verification and payment processes between the SIPS SVIP and local banking systems.\n" +
    "\n" +
    "#### POST `/api/v1/gateway/Verify`\n" +
    "\n" +
    "**Description:**  \n" +
    "Verifies transaction requests by processing `VerificationRequest` JSON objects from the provided adapter.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "      /*jsonAdapter.VerificationRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.VerificationResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "#### POST `/api/v1/gateway/Payment`\n" +
    "\n" +
    "**Description:**  \n" +
    "Processes payment requests by handling `PaymentRequest` JSON objects from the provided adapter.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.PaymentRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.PaymentResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "#### POST `/api/v1/gateway/status`\n" +
    "\n" +
    "**Description:**  \n" +
    "Processes payment status requests by handling `StatusRequest` JSON objects from the provided adapter.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.StatusRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_PaymentStatusResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "#### POST `/api/v1/gateway/return`\n" +
    "\n" +
    "**Description:**  \n" +
    "Processes payment return requests by handling `ReturnRequest` JSON objects from the provided adapter.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.ReturnRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_ReturnResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "### Incoming Messages\n" +
    "\n" +
    "Processes incoming verification and payment messages from the SIPS SVIP system and triggers your callback URLs using the designated JSON adapter properties.\n" +
    "\n" +
    "#### POST `/api/v1/incoming`\n" +
    "\n" +
    "**Description:**  \n" +
    "processes Received ISO 20022 (acmt.023) and parses them into `CB_VerificationRequest` JSON objects and forwards them to your API via the designated callback links.\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Url: {verification_callback_url}` from the Configuration\n" +
    "  - `ApiKey: {api_key}`\n" +
    "  - `ApiSecret: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_VerificationRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_VerificationResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "#### POST `/api/v1/incoming`\n" +
    "\n" +
    "**Description:**  \n" +
    "Processes received ISO 20022 (pacs.008) and parses them into `CB_PaymentRequest` JSON objects and forwards them to your API via the designated callback links.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Url: {transfer_callback_url}` from the Configuration\n" +
    "  - `ApiKey: {api_key}`\n" +
    "  - `ApiSecret: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_PaymentRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_PaymentResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "#### POST `/api/v1/incoming`\n" +
    "\n" +
    "**Description:**  \n" +
    "Processes received ISO 20022 (pacs.028) and parses them into `CB_StatusRequest` JSON objects and forwards them to your API via the designated callback links.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Url: {status_callback_url}` from the Configuration\n" +
    "  - `ApiKey: {api_key}`\n" +
    "  - `ApiSecret: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_StatusRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_PaymentStatusResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "#### POST `/api/v1/incoming`\n" +
    "\n" +
    "**Description:**  \n" +
    "Processes received ISO 20022 (pacs.004) and parses them into `CB_ReturnRequest` JSON objects and forwards them to your API via the designated callback links.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Url: {return_callback_url}` from the Configuration\n" +
    "  - `ApiKey: {api_key}`\n" +
    "  - `ApiSecret: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_ReturnRequest*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_ReturnResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "\n" +
    "#### POST `/api/v1/incoming`\n" +
    "\n" +
    "**Description:**\n" +
    "Processes received ISO 20022 (pacs.002) and parses them into `CB_CompletionNotification` JSON objects and forwards them to your API via the designated callback links.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "- `Url: {completion_notification_callback_url}` from the Configuration\n" +
    "- `ApiKey: {api_key}`\n" +
    "- `ApiSecret: {api_secret}`\n" +
    "- `Content-Type: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "```json\n" +
    "{\n" +
    "  /*jsonAdapter.CB_CompletionNotification*/\n" +
    "}\n" +
    "```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    /*jsonAdapter.CB_CompletionNotificationResponse*/\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "  - `400 Bad Request` – Invalid request format or parameters.\n" +
    "  - `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "  - `404 Not Found` – Endpoint or resource not found.\n" +
    "  - `500 Internal Server Error` – Server encountered an unexpected condition.\n" +
    "\n" +
    "### SomQR Merchant\n" +
    "\n" +
    "The SomQR Merchant API provides endpoints for generating and parsing merchant QR codes.\n" +
    "\n" +
    "#### POST `/api/v1/somqr/GenerateMerchantQR`\n" +
    "\n" +
    "**Description:**\n" +
    "Generates a merchant QR code based on the provided `SomQRMerchantRequest` JSON object.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "  - `Accept: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    \"type\": 1,\n" +
    "    \"method\": 1,\n" +
    "    \"merchantId\": \"12345678\",\n" +
    "    \"merchantCategoryCode\": 5814,\n" +
    "    \"currencyCode\": 706,\n" +
    "    \"merchantName\": \"HAYATRESTAURANTS\",\n" +
    "    \"merchantCity\": \"MOGADISHU\",\n" +
    "    \"postalCode\": \"00000\",\n" +
    "    \"storeLabel\": \"00116789\",\n" +
    "    \"terminalLabel\": \"11002\"\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    \"data\": \"00020101021126400014so.somqr.sSIPS01060100064408123456785204581453037065802SO5916HAYATRESTAURANTS6009MOGADISHU610500000622103080011678907051100263049CAE\"\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "- `400 Bad Request` – Invalid request format or parameters.\n" +
    "- `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "- `404 Not Found` – Endpoint or resource not found.\n" +
    "\n" +
    "#### GET `/api/v1/somqr/ParseMerchantQR`\n" +
    "\n" +
    "**Description:**\n" +
    "Parses a merchant QR code and returns the corresponding `MerchantPayload` JSON object.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "-- **query:**\n" +
    "\n" +
    "- `?code: 00020101021126400014so.somqr.sSIPS01060100064408123456785204581453037065802SO5916HAYATRESTAURANTS6009MOGADISHU610500000622103080011678907051100263049CAE`\n" +
    "\n" +
    "- **Headers:**\n" +
    "- `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    \"data\": {\n" +
    "      \"payloadFormatIndicator\": \"01\",\n" +
    "      \"pointOfInitializationMethod\": \"11\",\n" +
    "      \"merchantAccount\": {\n" +
    "        \"26\": {\n" +
    "          \"globalUniqueIdentifier\": \"so.somqr.sSIPS\",\n" +
    "          \"paymentNetworkSpecific\": {\n" +
    "            \"1\": \"010006\",\n" +
    "            \"44\": \"12345678\"\n" +
    "          }\n" +
    "        }\n" +
    "      },\n" +
    "      \"merchantCategoryCode\": 5814,\n" +
    "      \"transactionCurrency\": 706,\n" +
    "      \"transactionAmount\": null,\n" +
    "      \"tipOrConvenienceIndicator\": null,\n" +
    "      \"valueOfConvenienceFeeFixed\": null,\n" +
    "      \"valueOfConvenienceFeePercentage\": null,\n" +
    "      \"countyCode\": \"SO\",\n" +
    "      \"merchantName\": \"HAYATRESTAURANTS\",\n" +
    "      \"merchantCity\": \"MOGADISHU\",\n" +
    "      \"postalCode\": \"00000\",\n" +
    "      \"additionalData\": {\n" +
    "        \"billNumber\": null,\n" +
    "        \"mobileNumber\": null,\n" +
    "        \"storeLabel\": \"00116789\",\n" +
    "        \"loyaltyNumber\": null,\n" +
    "        \"referenceLabel\": null,\n" +
    "        \"customerLabel\": null,\n" +
    "        \"terminalLabel\": \"11002\",\n" +
    "        \"purposeOfTransaction\": null,\n" +
    "        \"additionalConsumerDataRequest\": null\n" +
    "      },\n" +
    "      \"merchantInformation\": null,\n" +
    "      \"unreservedTemplate\": null,\n" +
    "      \"crc\": \"9CAE\"\n" +
    "    }\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "- `400 Bad Request` – Invalid request format or parameters.\n" +
    "- `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "\n" +
    "### SomQR Person\n" +
    "\n" +
    "The SomQR Person API provides endpoints for generating and parsing person QR codes.\n" +
    "\n" +
    "#### POST `/api/v1/somqr/GeneratePersonQR`\n" +
    "\n" +
    "**Description:**\n" +
    "Generates a person QR code based on the provided `SomQRPersonRequest` JSON object.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "- **Headers:**\n" +
    "\n" +
    "  - `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "  - `Content-Type: application/json`\n" +
    "  - `Accept: application/json`\n" +
    "\n" +
    "- **Body:**\n" +
    "  ```json\n" +
    "  {\n" +
    "    \"amount\": 0,\n" +
    "    \"accountName\": \"Abdulshakur Ahmed Aided\",\n" +
    "    \"iban\": \"SO980000220120129383744\",\n" +
    "    \"currencyCode\": \"\",\n" +
    "    \"particulars\": \"Payment for Test\"\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "**Response:**\n" +
    "\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    \"data\": \"000202010211022702010308SIT BANK0423SO9800002201201293837440523Abdulshakur Ahmed Aided0716Payment for Test10041234\"\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "- `400 Bad Request` – Invalid request format or parameters.\n" +
    "- `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "\n" +
    "#### GET `/api/v1/somqr/ParsePersonQR`\n" +
    "\n" +
    "**Description:**\n" +
    "Parses a person QR code and returns the corresponding `P2PPayload` JSON object.\n" +
    "\n" +
    "**Request:**\n" +
    "\n" +
    "-- **query:**\n" +
    "\n" +
    "- `?code: 000202010211022702010308SIT BANK0423SO9800002201201293837440523Abdulshakur Ahmed Aided0716Payment for Test10041234`\n" +
    "\n" +
    "- **Headers:**\n" +
    "- `Authorization: Bearer JWT_TOKEN` or `X-API-KEY: {api_key} X-API-SECRET: {api_secret}`\n" +
    "- **Response:**\n" +
    "- **200 OK:**\n" +
    "\n" +
    "  ```json\n" +
    "  {\n" +
    "    \"data\": {\n" +
    "      \"payloadFormatIndicator\": \"02\",\n" +
    "      \"pointOfInitializationMethod\": \"11\",\n" +
    "      \"schemeIdentifier\": \"01\",\n" +
    "      \"fiName\": \"SIT BANK\",\n" +
    "      \"accountNumber\": \"SO980000220120129383744\",\n" +
    "      \"accountName\": \"Abdulshakur Ahmed Aided\",\n" +
    "      \"amount\": 0,\n" +
    "      \"particulars\": \"Payment for Test\",\n" +
    "      \"crc\": \"1234\"\n" +
    "    }\n" +
    "  }\n" +
    "  ```\n" +
    "\n" +
    "- **Error Responses:**\n" +
    "- `400 Bad Request` – Invalid request format or parameters.\n" +
    "- `401 Unauthorized` – Missing or invalid authentication credentials.\n" +
    "\n" +
    "## Authentication & Authorization\n" +
    "\n" +
    "### Client authentication (Gateway and SomQR)\n" +
    "\n" +
    "Public API endpoints (e.g., `/api/v1/Gateway/*`, `/api/v1/SomQR/*`) accept either of the following:\n" +
    "\n" +
    "- Authorization header (JWT):\n" +
    "  - `Authorization: Bearer <JWT_TOKEN>`\n" +
    "\n" +
    "- API key headers:\n" +
    "  - `X-API-KEY: <api_key>`\n" +
    "  - `X-API-SECRET: <api_secret>`\n" +
    "\n" +
    "Use one method consistently per request.\n" +
    "\n" +
    "### Callback authentication (Orchestrated callbacks)\n" +
    "\n" +
    "When SIPS Connect calls your callback URLs (see Incoming behavior), it authenticates using these headers:\n" +
    "\n" +
    "- `ApiKey: <api_key>`\n" +
    "- `ApiSecret: <api_secret>`\n" +
    "\n" +
    "Note the different casing compared to client requests (`ApiKey/ApiSecret` vs `X-API-KEY/X-API-SECRET`).\n" +
    "\n" +
    "### Token provisioning\n" +
    "\n" +
    "- JWTs or API credentials are sourced from secure configuration (e.g., environment variables, appsettings).\n" +
    "\n" +
    "## Error Handling\n" +
    "\n" +
    "The platform uses standard HTTP status codes to indicate the success or failure of API requests:\n" +
    "\n" +
    "- **400 Bad Request:** The request was invalid or cannot be served. This could be due to malformed request syntax or invalid request parameters.\n" +
    "- **401 Unauthorized:** Authentication credentials were missing or invalid.\n" +
    "- **404 Not Found:** The requested resource could not be found.\n" +
    "- **500 Internal Server Error:** An unexpected error occurred on the server side.\n" +
    "\n" +
    "Each error response includes a relevant message detailing the nature of the error to aid in troubleshooting.\n" +
    "\n" +
    "## Security\n" +
    "\n" +
    "- **Transaction Signing:** All transactions are signed using a private key to ensure authenticity and integrity.\n" +
    "- **Transaction Verification:** Signed transactions are verified using a public key retrieved from the SPS Public Key Repository.\n" +
    "- **Data Encryption:** Sensitive data is encrypted both in transit and at rest to protect against unauthorized access.\n" +
    "- **Secure Storage:** Verification records and transaction details are securely stored in the database with appropriate access controls.\n" +
    "\n" +
    "## Database Management\n" +
    "\n" +
    "All verifications and transactions processed by the SIPS Connect Platform are securely stored in a PostgreSQL database, ensuring a reliable record for auditing, reconciliation, and historical reference. The database schema is designed for high-performance handling of large transactional volumes while maintaining data integrity and security. It also features automatic schema and database generation capabilities for seamless scalability.\n" +
    "\n" +
    "## Integration with SPS Public Key Repository\n" +
    "\n" +
    "The platform seamlessly integrates with the SPS Public Key Repository to retrieve public keys required for verifying signed transactions. This ensures that only authenticated and authorized transactions are processed, upholding the highest standards of security and trust. Configuration for this module can be managed through system configuration files or environment variables.\n" +
    "\n" +
    "## Contact & Support\n" +
    "\n" +
    "For further assistance, support, or inquiries related to the SIPS Connect Platform, please contact our support team:\n" +
    "\n" +
    "- **Support Portal:** [www.support.sps.so](https://support.sps.so)\n" +
    "\n" +
    "---\n" +
    "\n" +
    "_This documentation is continuously updated and revised. For the latest information, please refer to the official SIPS Connect Platform documentation portal. Upcoming upgrades, along with a changelog and feature adaptability details, will be shared in this repository soon._"

export default function GettingStarted() {
    return <MarkdownRenderer markdown={markdown} />;
}
