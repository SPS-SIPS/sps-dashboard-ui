import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {sendResponse} from "./update-config";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return sendResponse(res, 405, "MethodNotAllowed", "Method not allowed");
    }

    try {
        const filePath = path.join(process.cwd(), "db.json");

        const rawData = fs.readFileSync(filePath, "utf-8");
        const currentData = JSON.parse(rawData);

        return sendResponse(res, 200, "OK", "Config fetched successfully", currentData.config);
    } catch (err: any) {
        return sendResponse(res, 500, "InternalServerError", err.message || "Unknown error");
    }
}
