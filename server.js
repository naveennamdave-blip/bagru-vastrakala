// =========================================================
//  BAGRU VASTRAKALA — Production Server v2.1
// =========================================================
require("dotenv").config();

const express    = require("express");
const nodemailer = require("nodemailer");
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

// ─── EMAIL ────────────────────────────────────────────────
const EMAIL_USER = process.env.EMAIL_USER || "naveennamdave@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const ADMIN_PASS = process.env.ADMIN_PASS || "bagru2025";

let transporter = null;
if (EMAIL_PASS) {
  transporter = nodemailer.createTransport({ service: "gmail", auth: { user: EMAIL_USER, pass: EMAIL_PASS } });
  transporter.verify((err) => {
    if (err) console.error("❌ Email error:", err.message);
    else     console.log("✅ Email ready →", EMAIL_USER);
  });
} else {
  console.warn("⚠️  EMAIL_PASS not set — contact emails disabled.");
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

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"BagruParampara" <${EMAIL_USER}>`,
        to:   EMAIL_USER,
        subject: `New Message from ${name}`,
        html: `<div style="font-family:sans-serif;max-width:600px">
          <h2 style="color:#2C3A7A">New Customer Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "Not given"}</p>
          <p><b>Message:</b> ${message.replace(/\n/g,"<br>")}</p>
          <p style="color:#999;font-size:12px">Received: ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})} IST</p>
        </div>`,
      });
      console.log("📧 Email sent to", EMAIL_USER);
    } catch (e) { console.error("❌ Email send error:", e.message); }
  }
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