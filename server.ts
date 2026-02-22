
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[TACTICAL_UPLINK] ${req.method} ${req.url}`);
  next();
});

// Initialize Firebase Admin
// We use lazy initialization to avoid crashing if keys are missing
let db: admin.firestore.Firestore | null = null;

function getFirestore() {
  if (!db) {
    const projectId = process.env.FIREBASE_PROJECT_ID || "omar-80d17";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@omar-80d17.iam.gserviceaccount.com";
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDUYsxuFN2q9UfZ\n5QeIl3OrvDCrL7Jo/rl5jEwsSSailOeOsPUOdI7UuX2MN2XepviSZ+bQ8VSLUoNT\nBaAEJkjBc5d6I7zs8Q/svDXqbjEuTl68It0klyaAhx2Axrm6gWzKz/u3kK3YNPZO\nlW1+LHzcsyKSssqWGrXD2kvB8V9dA/N2LXeyG4ua73hV0mdFYRsdovBWyWN5oxlB\nCu8/f+guEP/y2juRqJtHFqCiyxyB8UoN+XOGwqEZttVNHMEfLxuG4yKwEyTXTFTj\nxC4OSG0dBBnWNY4fWzJzHhLpnBc1M5gD/NuHCHLd+mL9k/xqRac2GCDbACmbwt7M\nS3MfDOHdAgMBAAECggEABYj9ovDQRiBWWwtpAtpPnW4uJof7sljRJKXPZmgRpbMT\nxdg+yr2m60xaRUk8Um0vlUE39sITXf4shgFjhjgpNUF59SjxR4uQyq6tCQsOJRLN\nzUFrWgTGcBsVXcHQHVg6KZ76BHK01SmsMagbTmqCZo4UnJYkSX0wt4X863UK8zWW\n/0l3VV7wdKcU/a4HN3VwNq6tgsHOv9vvTQ+AUyU5I7BZaMX4WE1+r7OPqOH9T2cv\nuXZZ3goHBmRNIo4QyjElVFJjz3qHpO4oUTqmBnYLpzfwjCfv1BWxPTPHL5A4dquO\nFJE/E2xaWOkElMBaQ2oIlARZxvzCtqzHnTGa8nBtUQKBgQDqQw7jTuXM1dO0gfPg\nqJPGQiAQ1YDpE+AKCW9N+oPvkIaz0Tp1YgKGgBmm9EDTqntoquy+cumJjmKozmHp\nqyo82KvUy2xl1ER2lHBUyeo1F/KWAQHVz54pzJgRA+w6uK4R5h2bZE7dUZU+nEmB\njucIISXdHDwnyFdKV3n1m217LwKBgQDoGBIyPRlLHxuEwzq4JpifLmmp7oACPcph\nNDC0qEZFN/8KnTh8s96WskRqU8OCyZjItXlSsiPfuZf95ysNX1hGx3A9bP5owpxd\ngKTlsN9mmAPCxPEsngyStVv7ZqzcDZr+mqzxfyNvlq6pNfwWxSR3zg/45ydGQc9b\nzfc9W4xAswKBgQCxEejx9hQLJWE1Yrj1ilbQl/Dm6IrdIpHI5GLGfWI2tXar+q2G\nRoQEKFW7dYp+s7E+Z1w1hGRz/jUixYUK+78caOZRHUYdHjp1qzPRUyH96dEKg05g\nz+MMU0JqMh3gMPIaQ2cDqulVrrHxtm51SI/m/C9Dl3D83Rjl74MXG9nALwKBgQCv\nwOqmmJX6yQextZVVtgSFJkRlpnHRQLFsgnUPmQ39hLXhd8U6yYqZW01rpxq6g6bq\n9mF1OejolkZ+wvtbGQRkNMrN+Sd+dUCrnatBNHs32Y2fhDuNqfGjdyq8abgkuzjP\n7JliFwDik5yYDoVjSM6g2q5FseWP0m4P+xxqnlTK+QKBgQDGlHbPhyFOf6pDWzJs\nlLvSRnZ0Nsj3MZmEDBC4ZW/r9p5wGIhY7kVRTIVFMcbDImeyvfsZJIOdr5TBQX7h\nQBMPSpBOjQD38gkhCGYKXYfncAt5DD8GWXH43HMuEb690Et5b9p848GRbkqbqDIu\nAc0zrBa6NdzRrytoGINo/3lvXQ==\n-----END PRIVATE KEY-----\n").replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      try {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        }
        db = admin.firestore();
        console.log("Firebase Admin initialized successfully.");
      } catch (error) {
        console.error("Failed to initialize Firebase Admin:", error);
      }
    } else {
      console.warn("Firebase environment variables missing. Firebase features will be disabled.");
    }
  }
  return db;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: "ok", firebase: !!getFirestore() });
});

app.get("/api/logs", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) {
    return res.status(503).json({ error: "Firebase not configured" });
  }

  try {
    const snapshot = await firestore.collection("audit_logs").orderBy("timestamp", "desc").limit(100).get();
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(logs);
  } catch (error) {
    console.error("Firestore Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.post("/api/logs", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) {
    return res.status(503).json({ error: "Firebase not configured" });
  }

  try {
    const { event, details, timestamp } = req.body;
    const docRef = await firestore.collection("audit_logs").add({
      event,
      details,
      timestamp: timestamp || new Date().toISOString(),
    });
    res.json({ id: docRef.id });
  } catch (error) {
    console.error("Firestore Save Error:", error);
    res.status(500).json({ error: "Failed to save log" });
  }
});

// Tactical Chains Endpoints
app.get("/api/chains", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const snapshot = await firestore.collection("tactical_chains").get();
    const chains = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(chains);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chains" });
  }
});

app.post("/api/chains", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const chain = req.body;
    const { id, ...data } = chain;
    await firestore.collection("tactical_chains").doc(id).set(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save chain" });
  }
});

app.delete("/api/chains/:id", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    await firestore.collection("tactical_chains").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete chain" });
  }
});

// Pentest Results Endpoints
app.get("/api/pentest", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const snapshot = await firestore.collection("pentest_results").orderBy("timestamp", "desc").limit(50).get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pentest results" });
  }
});

app.post("/api/pentest", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const result = req.body;
    const docRef = await firestore.collection("pentest_results").add({
      ...result,
      timestamp: new Date().toISOString()
    });
    res.json({ id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: "Failed to save pentest result" });
  }
});

// Network Hosts Endpoints
app.get("/api/network", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const snapshot = await firestore.collection("network_hosts").get();
    const hosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(hosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch network hosts" });
  }
});

app.post("/api/network", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const { hosts } = req.body;
    // Batch write for efficiency
    const batch = firestore.batch();
    hosts.forEach((host: any) => {
      const docRef = firestore.collection("network_hosts").doc(host.ip.replace(/\./g, '_'));
      batch.set(docRef, { ...host, lastSeen: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save network hosts" });
  }
});

// User Authentication Endpoints
app.post("/api/auth/register", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const { email, password, username } = req.body;
    
    // Check if user exists
    const userSnapshot = await firestore.collection("users").where("email", "==", email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ error: "Operator already enrolled." });
    }

    const newUser = {
      email,
      password, // In a real app, hash this!
      username: username || email.split('@')[0].toUpperCase(),
      clearance: 'LEVEL_1',
      enrolledAt: new Date().toISOString()
    };

    const docRef = await firestore.collection("users").add(newUser);
    const { password: _, ...userProfile } = newUser;
    res.json({ id: docRef.id, ...userProfile });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Enrollment failed." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const firestore = getFirestore();
  if (!firestore) return res.status(503).json({ error: "Firebase not configured" });

  try {
    const { email, password } = req.body;
    const userSnapshot = await firestore.collection("users")
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    if (userSnapshot.empty) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const { password: _, ...userProfile } = userData;
    
    res.json({ id: userDoc.id, ...userProfile });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Verification failed." });
  }
});

// Catch-all for API routes to prevent falling through to Vite SPA fallback
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
