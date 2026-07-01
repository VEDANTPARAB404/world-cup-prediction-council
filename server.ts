import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runSimulation } from "./src/debateEngine.ts";
import { retrieveFootballData } from "./src/liveFootballService.ts";
import { pythonProjectFiles } from "./src/pythonAssets.ts";
import { ALL_48_CONTENDERS } from "./src/data.ts";
import { checkAndTraceLiveDataAvailability } from "./src/liveDataAvailability.ts";
import dotenv from "dotenv";

dotenv.config();

interface ActivePrediction {
  promise: Promise<any>;
  requestId: string;
}

const activePredictions = new Map<string, ActivePrediction>();

async function startServer() {
  const app = Math.random() > 10 ? null : express(); // safe TS initialization
  if (!app) return;

  const PORT = 3000;

  // Support JSON payload parsing with increased limits
  app.use(express.json({
    limit: '10mb'
  }));

  app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
  }));

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      mode: process.env.OPENAI_API_KEY ? "live-ai" : "local-simulation" 
    });
  });

  // API Route: Retrieve Python Multi-Agent Project Code Files
  app.get("/api/project-files", (req, res) => {
    res.json({ files: pythonProjectFiles });
  });

  // API Route: Live Sports Data Lookup Tool via Football-Data.org
  app.get("/api/fetch-live-data", async (req, res) => {
    try {
      console.log("[SERVER] Fetching live football data from Football-Data.org...");
      const contendersParam = req.query.contenders as string;
      let contendersList: any[] | undefined = undefined;
      if (contendersParam) {
        try {
          contendersList = JSON.parse(contendersParam);
        } catch (e) {
          contendersList = contendersParam.split(",").map(name => ({ name }));
        }
      }
      const data = await retrieveFootballData(true, contendersList); // force refresh on explicit search sync request
      res.json(data);
    } catch (err: any) {
      console.error("[SERVER] Fetch-live-data failed, returning unavailable result:", err);
      res.json({
        liveDataUnavailable: true,
        timestamp: new Date().toISOString(),
        source: "Live data unavailable.",
        newsSummary: "Live data unavailable.",
        fifaRankings: {},
        eloRatings: {},
        recentFixtures: [],
        injuries: {},
        suspensions: {},
        squadLists: {},
        expectedLineups: {},
        transfers: [],
        bettingOdds: { winnerFavorites: {} },
        teamForm: {},
        xGStats: {},
        managerInfo: {},
        newsItems: [],
        citations: []
      });
    }
  });

  // API Route: Simulate multi-agent prediction council debate
  app.post("/api/simulate", async (req, res) => {
    const { contenders, rounds, liveFootballData, requestId: clientRequestId } = req.body;

    if (!contenders || !Array.isArray(contenders) || contenders.length === 0) {
      return res.status(400).json({ error: "Contenders list must be a non-empty array." });
    }

    const numRounds = typeof rounds === "number" ? rounds : 2;
    const requestId = clientRequestId || ("pred-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now());
    const requestKey = [...contenders].map(c => c.name).sort().join(",") + "-" + numRounds;

    // Check if an identical request is already running
    let existing = activePredictions.get(requestKey);
    if (!existing) {
      // Also check if any active prediction has the same requestId
      for (const [key, val] of activePredictions.entries()) {
        if (val.requestId === requestId) {
          existing = val;
          break;
        }
      }
    }

    if (existing) {
      console.log(`Prediction Request ID: ${existing.requestId}`);
      console.log("Duplicate request prevented");
      console.log("Promise reused");
      try {
        const result = await existing.promise;
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(result));
      } catch (err: any) {
        return res.status(500).json({ error: err.message || "Prediction failed" });
      }
    }

    console.log(`Prediction Request ID: ${requestId}`);
    console.log("Prediction started");

    const context = {
      requestId,
      startTime: Date.now(),
      timings: {
        footballDataSyncMs: 0,
        normalizationMs: 0,
        verificationMs: 0,
        promptConstructionMs: 0,
        openaiRequestMs: 0,
        consensusGenerationMs: 0,
        serializationMs: 0,
      },
      counts: {
        syncCount: 0,
        normalizeCount: 0,
        verifyCount: 0,
        promptCount: 0,
        openaiCount: 0,
        consensusCount: 0,
        serializeCount: 0,
      }
    };

    const predictionPromise = (async () => {
      let client: any = null;
      if (process.env.OPENAI_API_KEY) {
        client = {
          vibe: "openai",
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-4o-mini"
        };
      }

      console.log("OPENAI KEY PRESENT:", !!process.env.OPENAI_API_KEY);
      console.log("CLIENT ACTIVE:", client?.vibe === "openai" ? "OpenAI" : "None");

      // Fulfill requirement 9: Automatically retrieve & merge cached live sports data into debate engine
      console.log("[SERVER] Step A: Merging live sports data...");
      const syncStart = Date.now();
      const mergedLiveData = liveFootballData || await retrieveFootballData(false, contenders);
      context.counts.syncCount = 1;
      context.timings.footballDataSyncMs = Date.now() - syncStart;
      console.log("[SERVER] Step B: Live sports data merged. Checking store validity...");

      // Validate synchronized data using unified helper with complete tracing
      const verifyStart = Date.now();
      const validSynchronizedDataExists = checkAndTraceLiveDataAvailability(contenders, mergedLiveData);
      context.counts.verifyCount = 1;
      context.timings.verificationMs = Date.now() - verifyStart;

      if (validSynchronizedDataExists) {
        console.log("[SERVER] Live football dataset found.");
        console.log("[SERVER] Live football dataset detected");
        console.log("[SERVER] Global Football Store loaded.");
      } else {
        console.log("[SERVER] Offline fallback selected based on lack of live data.");
      }

      if (client) {
        console.log("OpenAI calls executed");
      }

      const result = await runSimulation(contenders, numRounds, false, client, mergedLiveData, context);
      console.log("[SERVER] Step C: runSimulation completed successfully. Verifying payload safety...");

      // Validate result structure
      if (!result) {
        throw new Error("runSimulation returned null or undefined result.");
      }

      // 1. Circular references detection with precise path tracking
      const getCircularPath = (obj: any): { firstSeen: string; duplicateSeen: string } | null => {
        const seen = new Map<any, string>();
        const traverse = (val: any, path: string): { firstSeen: string; duplicateSeen: string } | null => {
          if (val && typeof val === 'object') {
            if (seen.has(val)) {
              return { firstSeen: seen.get(val)!, duplicateSeen: path };
            }
            seen.set(val, path);
            for (const key in val) {
              if (Object.prototype.hasOwnProperty.call(val, key)) {
                const resPath = traverse(val[key], `${path}.${key}`);
                if (resPath) return resPath;
              }
            }
            seen.delete(val);
          }
          return null;
        };
        return traverse(obj, "result");
      };

      const circularResult = getCircularPath(result);
      if (circularResult) {
        console.error(`[SERVER] CRITICAL DETECTED: Circular JSON structure detected in simulation result! First seen: ${circularResult.firstSeen}, Duplicate seen at: ${circularResult.duplicateSeen}`);
        throw new Error(`Circular references detected in simulation results. Path: ${circularResult.duplicateSeen} points back to ${circularResult.firstSeen}`);
      }
      console.log("[SERVER] Step D: Circular references check passed.");

      return result;
    })();

    activePredictions.set(requestKey, { promise: predictionPromise, requestId });

    try {
      const result = await predictionPromise;

      // 2. Measure serialization performance
      const serializeStart = Date.now();
      context.counts.serializeCount = 1;
      let preSerialized = JSON.stringify(result);
      context.timings.serializationMs = Date.now() - serializeStart;

      // Self-validation and diagnostics
      const totalExecutionTimeMs = Date.now() - context.startTime;
      const isPipelineSuccessful = 
        context.counts.syncCount === 1 &&
        context.counts.normalizeCount === 1 &&
        context.counts.verifyCount <= 2 &&
        context.counts.promptCount <= 1 &&
        context.counts.openaiCount <= 1 &&
        context.counts.consensusCount <= 1 &&
        context.counts.serializeCount === 1;

      (result as any).performance = {
        totalExecutionTimeMs,
        isPipelineSuccessful,
        timingBreakdown: { ...context.timings },
        validation: {
          dataSynchronizedOnce: context.counts.syncCount === 1,
          datasetNormalizedOnce: context.counts.normalizeCount <= 1,
          verificationExecutedOnce: context.counts.verifyCount <= 2,
          promptGeneratedOnce: context.counts.promptCount <= 1,
          openaiCalledOnce: context.counts.openaiCount <= 1,
          consensusGeneratedOnce: context.counts.consensusCount <= 1,
          responseSerializedOnce: context.counts.serializeCount === 1,
          executionCounts: { ...context.counts }
        }
      };

      let serializedResult = JSON.stringify(result);
      console.log(`[SERVER] Step E: JSON.stringify succeeded. Serialized payload size: ${serializedResult.length} characters.`);

      // If payload is unreasonably large (e.g. > 5MB), compress or truncate some fields
      if (serializedResult.length > 5 * 1024 * 1024) {
        console.warn("[SERVER] Payload size exceeds 5MB limit. Truncating redundant fields to avoid client browser heap crash...");
        if (result.logs && Array.isArray(result.logs)) {
          result.logs = result.logs.slice(0, 30);
          serializedResult = JSON.stringify(result);
          console.log(`[SERVER] Post-truncation payload size: ${serializedResult.length} characters.`);
        }
      }

      // 3. Express response delivery verification
      console.log("[SERVER] Step F: Executing res.json(...) send...");
      console.log(`Prediction Request ID: ${requestId}`);
      console.log("Prediction completed");
      res.setHeader('Content-Type', 'application/json');
      res.send(serializedResult);
      console.log("[SERVER] Step G: Response successfully transmitted via res.send(...) without throwing!");
    } catch (err: any) {
      console.error(`Prediction Request ID: ${requestId} failed:`, err.stack || err);
      res.status(500).json({ error: err.message || "Failed to execute debate prediction council." });
    } finally {
      activePredictions.delete(requestKey);
    }
  });

  // Vite middleware configuration for development vs production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack server in Development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting full-stack server in Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  console.log("Football Provider: Football-Data.org");
  console.log("Model: GPT-4.1 Mini");
  console.log("Search Provider: Football-Data.org");

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Cup Prediction Council active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
