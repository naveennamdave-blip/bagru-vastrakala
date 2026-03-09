// =========================================================
//  BAGRU VASTRAKALA — Production Server v2.1
// =========================================================
require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const path       = require("path");
const fs         = require("fs");

const app  = express();
const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = path.join(__dirname, "products.json");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: 0, etag: true }));

// ─── PRODUCTS HELPERS ─────────────────────────────────────
function loadProducts() {
  try { return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8")); }
  catch { return []; }
}
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
}

// ─── EMAIL via Resend HTTPS API ───────────────────────────
const EMAIL_USER = process.env.EMAIL_USER || "naveennamdave@gmail.com";
const RESEND_KEY = process.env.RESEND_KEY || "";
const ADMIN_PASS = process.env.ADMIN_PASS || "bagru2025";

if (RESEND_KEY) console.log("✅ Email ready via Resend →", EMAIL_USER);
else            console.warn("⚠️  RESEND_KEY not set — contact emails disabled.");

async function sendEmail({ to, subject, html }) {
  if (!RESEND_KEY) return;
  const https = require("https");
  const body  = JSON.stringify({
    from: "BagruParampara <onboarding@resend.dev>",
    to:   [to],
    subject,
    html,
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.resend.com",
      path:     "/emails",
      method:   "POST",
      headers:  {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type":  "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        const parsed = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log("📧 Email sent! ID:", parsed.id);
          resolve(parsed);
        } else {
          console.error("❌ Email error:", parsed.message || data);
          reject(new Error(parsed.message));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const orders = [], messages = [];
function generateId() { return "BV" + Date.now().toString(36).toUpperCase(); }

// ─── ADMIN AUTH ───────────────────────────────────────────
function adminAuth(req, res, next) {
  if (req.headers["x-admin-pass"] !== ADMIN_PASS)
    return res.status(401).json({ success: false, error: "Unauthorized" });
  next();
}

// =========================================================
// PUBLIC ROUTES
// =========================================================
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/products", (_req, res) => res.json(loadProducts()));

app.get("/api/products/:id", (req, res) => {
  const p = loadProducts().find(p => p.id === parseInt(req.params.id));
  p ? res.json(p) : res.status(404).json({ error: "Not found" });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ success: false, error: "Name, email and message required." });

  const entry = { id: generateId(), name, email, phone, message, receivedAt: new Date() };
  messages.push(entry);
  console.log("📩 Message from:", name);

  try {
    await sendEmail({
      to:      EMAIL_USER,
      subject: `New Message from ${name} – BagruParampara`,
      html: `<div style="font-family:sans-serif;max-width:600px;padding:24px;border:1px solid #eee;border-radius:8px">
        <h2 style="color:#1E2A6B;margin-bottom:20px">📩 New Customer Message</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;color:#555;width:100px">Name</td><td style="padding:8px">${name}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#555">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#555">Phone</td><td style="padding:8px">${phone || "Not given"}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold;color:#555;vertical-align:top">Message</td><td style="padding:8px">${message.replace(/
/g,"<br>")}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:20px">Received: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST</p>
      </div>`,
    });
  } catch (e) { console.error("❌ Email send error:", e.message); }
  res.json({ success: true, id: entry.id });
});

app.post("/api/orders", (req, res) => {
  const { items, total } = req.body || {};
  if (!items || !items.length) return res.status(400).json({ success: false });
  const order = { id: generateId(), items, total, status: "pending", placedAt: new Date() };
  orders.push(order);
  res.json({ success: true, orderId: order.id });
});

// =========================================================
// ADMIN API
// =========================================================
app.post("/api/admin/products", adminAuth, (req, res) => {
  const products = loadProducts();
  const { name, category, price, original, badge, img, desc, inStock } = req.body;
  if (!name || !category || !price || !img)
    return res.status(400).json({ success: false, error: "name, category, price, img required" });

  const maxId = products.reduce((m, p) => Math.max(m, p.id), 0);
  const p = {
    id: maxId + 1, name: name.trim(), category: category.trim(),
    price: parseFloat(price), original: parseFloat(original) || parseFloat(price),
    badge: badge || `${Math.round(((original-price)/original)*100)}% OFF`,
    img: img.trim(), desc: desc || "", inStock: inStock !== false && inStock !== "false",
  };
  products.push(p);
  saveProducts(products);
  console.log("➕ Product added:", p.name);
  res.json({ success: true, product: p });
});

app.put("/api/admin/products/:id", adminAuth, (req, res) => {
  const products = loadProducts();
  const id  = parseInt(req.params.id);
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Not found" });

  const { name, category, price, original, badge, img, desc, inStock } = req.body;
  products[idx] = {
    ...products[idx],
    ...(name     && { name: name.trim() }),
    ...(category && { category }),
    ...(price    && { price: parseFloat(price) }),
    ...(original && { original: parseFloat(original) }),
    ...(badge    && { badge }),
    ...(img      && { img: img.trim() }),
    ...(desc !== undefined && { desc }),
    ...(inStock !== undefined && { inStock: inStock !== false && inStock !== "false" }),
  };
  saveProducts(products);
  console.log("✏️  Updated:", products[idx].name);
  res.json({ success: true, product: products[idx] });
});

app.delete("/api/admin/products/:id", adminAuth, (req, res) => {
  let products = loadProducts();
  const id = parseInt(req.params.id);
  products  = products.filter(p => p.id !== id);
  saveProducts(products);
  console.log("🗑️  Deleted product:", id);
  res.json({ success: true });
});

app.get("/api/admin/orders",   adminAuth, (_req, res) => res.json({ count: orders.length, orders }));
app.get("/api/admin/messages", adminAuth, (_req, res) => res.json({ count: messages.length, messages }));

// ─── SPA FALLBACK ─────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Website   → http://localhost:${PORT}`);
  console.log(`🔐 Admin     → http://localhost:${PORT}/admin.html`);
  console.log(`📦 Products  → products.json\n`);
});