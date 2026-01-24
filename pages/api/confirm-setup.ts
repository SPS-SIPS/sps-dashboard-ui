import {NextApiRequest, NextApiResponse} from "next";
import fs from "fs";
import path from "path";
import {sendResponse} from "./update-config";
import {AppConfig} from "../../utils/config";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return sendResponse(res, 405, "MethodNotAllowed", "Method not allowed");
    }

    try {
        const filePath = path.join(process.cwd(), "db.json");

        const rawData = fs.readFileSync(filePath, "utf-8");
        const currentData = JSON.parse(rawData);

        if (currentData.config.uiGuards.setupConfirmed) {
            return sendResponse(
                res,
                409,
                "Conflict",
                "Setup is already confirmed"
            );
        }

        currentData.config.uiGuards.setupConfirmed = true;

        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), "utf-8");

        return sendResponse(
            res,
            200,
            "OK",
            "Setup confirmed successfully",
            currentData.config as AppConfig
        );
    } catch (err: any) {
        return sendResponse(
            res,
            500,
            "InternalServerError",
            err.message || "Unknown error"
        );
    }
}
