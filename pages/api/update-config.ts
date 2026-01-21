import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

function getTime() {
    return new Date().toISOString();
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function sendResponse(res: NextApiResponse, code: number, status: string, message = "") {
    return res.status(code).json({
        time: getTime(),
        code,
        status,
        message,
    });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return sendResponse(res, 405, "MethodNotAllowed", "Method not allowed");
    }

    const body = req.body;

    if (!["dev", "test", "prod"].includes(body.profile)) {
        return sendResponse(res, 400, "BadRequest", "Invalid profile");
    }

    if (!isValidUrl(body.baseUrl)) {
        return sendResponse(res, 400, "BadRequest", "Invalid API baseUrl");
    }

    if (!isValidUrl(body.keycloakUrl)) {
        return sendResponse(res, 400, "BadRequest", "Invalid Keycloak URL");
    }

    try {
        const filePath = path.join(process.cwd(), "db.json");

        const rawData = fs.readFileSync(filePath, "utf-8");
        const currentData = JSON.parse(rawData);

        currentData.config.api.baseUrl = body.baseUrl;
        currentData.config.keycloak.url = body.keycloakUrl;
        currentData.config.keycloak.realm = body.keycloakRealm || "";
        currentData.config.keycloak.clientId = body.keycloakClientId || "";
        currentData.config.profile = body.profile as "dev" | "test" | "prod";
        currentData.config.uiGuards.forceFormCompletion = false;

        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), "utf-8");

        return sendResponse(res, 200, "OK", "Config updated successfully");
    } catch (err: any) {
        return sendResponse(res, 500, "InternalServerError", err.message || "Unknown error");
    }
}
