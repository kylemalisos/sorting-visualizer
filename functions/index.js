const functions = require("firebase-functions");
const { google } = require("googleapis");

const PROJECT_ID = "minecraft-server-454402";
const ZONE = "us-central1-f";
const INSTANCE = "minecraft-server";

async function getComputeClient() {
    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/compute"],
    });
    const authClient = await auth.getClient();
    return google.compute({ version: "v1", auth: authClient });
}

exports.getServerStatus = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
        const compute = await getComputeClient();
        const response = await compute.instances.get({
            project: PROJECT_ID,
            zone: ZONE,
            instance: INSTANCE,
        });
        const status = response.data.status; // RUNNING, TERMINATED, STAGING, etc.
        const ip = response.data.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP || null;
        res.json({ status, ip });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to get server status" });
    }
});

exports.startServer = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    try {
        const compute = await getComputeClient();
        await compute.instances.start({
            project: PROJECT_ID,
            zone: ZONE,
            instance: INSTANCE,
        });
        res.json({ success: true, message: "Server is starting..." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to start server" });
    }
});

exports.stopServer = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
    
    try {
        const compute = await getComputeClient();
        await compute.instances.stop({
            project: PROJECT_ID,
            zone: ZONE,
            instance: INSTANCE,
        });
        res.json({ success: true, message: "Server is stopping..." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to stop server" });
    }
});
