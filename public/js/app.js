// =========================================================
//  BAGRU VASTRAKALA — Frontend v2.0 (Production Ready)
//  Cart · Wishlist · Search · WhatsApp Checkout · Contact
// =========================================================

const WHATSAPP_NUMBER = "919376542891";

// ─── REAL PRODUCT DATA WITH ACTUAL IMAGES ─────────────────

const categoryLabels = {
  dupatta:   "Cotton Dupatta Set",
  mulmul:    "Mulmul Saree",
  saree:     "Kota Doriya Saree",
  indigo:    "Indigo Print Fabric",
  sanganeri: "Sanganeri Fabric",
};

// ─── STATE ───────────────────────────────────────────────
let cart     = JSON.parse(localStorage.getItem("bv_cart")     || "[]");
let wishlist = JSON.parse(localStorage.getItem("bv_wishlist") || "[]");
let products = []; // loaded from server API

// ─── INIT ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  // Load products from server (reads products.json — update there!)
  try {
    const res = await fetch("/api/products");
    products  = await res.json();
  } catch (e) {
    console.error("Could not load products:", e);
  }

  renderProducts("all");
  updateCartUI();
  updateWishlistUI();
  setupHeader();

  // Header toggles
  document.getElementById("cartToggle").addEventListener("click",     toggleCart);
  document.getElementById("wishlistToggle").addEventListener("click", toggleWishlist);
  document.getElementById("searchToggle").addEventListener("click",   openSearch);
  document.getElementById("hamburger").addEventListener("click",      openMobileNav);
  document.getElementById("mobileNavClose").addEventListener("click", closeMobileNav);

  // Search input
  document.getElementById("searchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") performSearch();
    if (e.key === "Escape") closeSearch();
  });
});

// =========================================================
// PRODUCTS
// =========================================================
function renderProducts(filter) {
  const grid     = document.getElementById("productsGrid");
  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--warm-gray);font-size:16px">
      No products found in this category.
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const inWish = wishlist.some(w => w.id === p.id);
    return `
      <div class="product-card" onclick="openModal(${p.id})">
        <div class="product-img-wrap">
          <img src="${p.img}" alt="${p.name}" loading="lazy"
               onerror="this.style.objectFit='contain';this.style.padding='20px';this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23F0EAE0\\'></rect><text x=\\'50\\' y=\\'55\\' font-size=\\'30\\' text-anchor=\\'middle\\'>🧵</text></svg>'" />
          <div class="product-badge">${p.badge}</div>
          <button class="product-wish-btn ${inWish ? 'active' : ''}" id="wb-${p.id}"
            onclick="event.stopPropagation(); toggleWishlistItem(${p.id})"
            title="${inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <svg viewBox="0 0 24 24" fill="${inWish ? '#e74c3c' : 'none'}" stroke="${inWish ? '#e74c3c' : '#aaa'}" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="product-body">
          <p class="product-category">${categoryLabels[p.category]}</p>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-price-row">
            <span class="price-current">₹${p.price.toLocaleString("en-IN")}</span>
            <span class="price-original">₹${p.original.toLocaleString("en-IN")}</span>
            <span class="price-off">${p.badge}</span>
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
            Add to Cart
          </button>
        </div>
      </div>`;
  }).join("");
}

function filterProducts(filter, btn) {
  renderProducts(filter);
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  else {
    const tabs = document.querySelectorAll(".tab");
    const map  = { all: 0, dupatta: 1, mulmul: 2, saree: 3, indigo: 4, sanganeri: 5 };
    if (map[filter] !== undefined) tabs[map[filter]]?.classList.add("active");
  }
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// =========================================================
// PRODUCT MODAL
// =========================================================
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const inWish = wishlist.some(w => w.id === p.id);

  document.getElementById("modalContent").innerHTML = `
    <div class="modal-body">
      <div class="modal-img-wrap">
        <img class="modal-img" src="${p.img}" alt="${p.name}"
             onerror="this.style.display='none'" />
      </div>
      <div class="modal-info" style="margin-top:24px">
        <p class="product-category" style="margin-bottom:8px">${categoryLabels[p.category]}</p>
        <h2 style="font-family:var(--font-display);font-size:28px;color:var(--indigo);margin-bottom:20px;line-height:1.2">${p.name}</h2>
        <div class="product-price-row">
          <span class="price-current" style="font-size:32px">₹${p.price.toLocaleString("en-IN")}</span>
          <span class="price-original">₹${p.original.toLocaleString("en-IN")}</span>
          <span class="price-off">${p.badge}</span>
        </div>
        <p style="color:var(--text-light);font-size:15px;line-height:1.7;margin:20px 0">${p.desc}</p>
        <div class="modal-meta">
          <div class="modal-meta-item">🧵 <strong>Fabric:</strong> Pure Cotton</div>
          <div class="modal-meta-item">🎨 <strong>Dyes:</strong> Natural</div>
          <div class="modal-meta-item">✋ <strong>Made:</strong> Handcrafted</div>
          <div class="modal-meta-item">🚚 <strong>COD:</strong> Available</div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary full-width" onclick="addToCart(${p.id}); closeModal()">
            🛍️ Add to Cart — ₹${p.price.toLocaleString("en-IN")}
          </button>
          <button class="modal-wish-btn" onclick="toggleWishlistItem(${p.id}); this.textContent='${inWish ? '🤍' : '❤️'}';"
            title="Wishlist" id="modal-wb-${p.id}">
            ${inWish ? '❤️' : '🤍'}
          </button>
        </div>
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in: ${p.name} (₹${p.price}). Can you tell me more?`)}"
           target="_blank"
           style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;
                  padding:12px;background:#E8F5E9;border-radius:var(--radius);
                  color:#1B5E20;font-size:14px;font-weight:600">
          💬 Ask via WhatsApp
        </a>
      </div>
    </div>`;

  document.getElementById("productModal").classList.add("active");
  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("productModal").classList.remove("active");
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

// =========================================================
// CART
// =========================================================
function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, original: p.original, img: p.img, category: p.category, qty: 1 });
  saveCart();
  updateCartUI();
  showToast(`✅ Added to cart: "${p.name.slice(0, 30)}…"`);
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() { localStorage.setItem("bv_cart", JSON.stringify(cart)); }

function updateCartUI() {
  const total  = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count  = cart.reduce((s, i) => s + i.qty, 0);

  const countEl = document.getElementById("cartCount");
  countEl.textContent   = count;
  countEl.style.display = count > 0 ? "flex" : "none";

  const itemsEl  = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");

  if (cart.length === 0) {
    itemsEl.innerHTML      = `<div class="sidebar-empty">🛍️ Your cart is empty<br><small style="color:#bbb">Browse our collections above</small></div>`;
    footerEl.style.display = "none";
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="sidebar-item">
        <div class="sidebar-item-img">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="sidebar-item-info">
          <h4>${item.name.length > 45 ? item.name.slice(0, 45) + "…" : item.name}</h4>
          <p class="price">₹${item.price.toLocaleString("en-IN")}</p>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="sidebar-item-remove" onclick="removeFromCart(${item.id})" title="Remove">🗑</button>
      </div>`).join("");
    document.getElementById("cartTotal").textContent = `₹${total.toLocaleString("en-IN")}`;
    footerEl.style.display = "block";
  }
}

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const isOpen  = sidebar.classList.contains("open");
  document.getElementById("wishlistSidebar").classList.remove("open");
  sidebar.classList.toggle("open", !isOpen);
  overlay.classList.toggle("active", !isOpen);
  document.body.style.overflow = isOpen ? "" : "hidden";
}

function checkout() {
  if (cart.length === 0) { showToast("Your cart is empty!"); return; }
  const total   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const lines   = cart.map(i => `• ${i.name} ×${i.qty} = ₹${(i.price * i.qty).toLocaleString("en-IN")}`).join("\n");
  const message = `Hello Bagru Vastrakala! 🙏\n\nI'd like to place an order:\n\n${lines}\n\n*Total: ₹${total.toLocaleString("en-IN")}*\n\nPlease confirm availability and share payment/delivery details. Thank you!`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
}

// =========================================================
// WISHLIST
// =========================================================
function toggleWishlistItem(id) {
  const p     = products.find(x => x.id === id);
  if (!p) return;
  const inWish = wishlist.some(w => w.id === id);
  if (inWish) {
    wishlist = wishlist.filter(w => w.id !== id);
    showToast(`💔 Removed from wishlist`);
  } else {
    wishlist.push({ id: p.id, name: p.name, price: p.price, original: p.original, img: p.img, category: p.category });
    showToast(`❤️ Added to wishlist: "${p.name.slice(0, 28)}…"`);
  }
  saveWishlist();
  updateWishlistUI();
  refreshWishlistButtons();
}

function saveWishlist() { localStorage.setItem("bv_wishlist", JSON.stringify(wishlist)); }

function refreshWishlistButtons() {
  products.forEach(p => {
    const btn = document.getElementById(`wb-${p.id}`);
    if (!btn) return;
    const inWish = wishlist.some(w => w.id === p.id);
    btn.classList.toggle("active", inWish);
    const svg = btn.querySelector("svg");
    if (svg) {
      svg.setAttribute("fill",   inWish ? "#e74c3c" : "none");
      svg.setAttribute("stroke", inWish ? "#e74c3c" : "#aaa");
    }
  });
}

function moveToCart(id) {
  addToCart(id);
  wishlist = wishlist.filter(w => w.id !== id);
  saveWishlist();
  updateWishlistUI();
  refreshWishlistButtons();
}

function moveAllToCart() {
  if (wishlist.length === 0) return;
  wishlist.forEach(item => addToCart(item.id));
  wishlist = [];
  saveWishlist();
  updateWishlistUI();
  refreshWishlistButtons();
  showToast("🛍️ All wishlist items moved to cart!");
}

function clearWishlist() {
  wishlist = [];
  saveWishlist();
  updateWishlistUI();
  refreshWishlistButtons();
  showToast("Wishlist cleared");
}

function updateWishlistUI() {
  const countEl = document.getElementById("wishlistCount");
  countEl.textContent   = wishlist.length;
  countEl.style.display = wishlist.length > 0 ? "flex" : "none";

  const itemsEl  = document.getElementById("wishlistItems");
  const footerEl = document.getElementById("wishlistFooter");

  if (wishlist.length === 0) {
    itemsEl.innerHTML      = `<div class="sidebar-empty">🤍 Your wishlist is empty<br><small style="color:#bbb">Click the ♡ on any product to save it</small></div>`;
    footerEl.style.display = "none";
  } else {
    itemsEl.innerHTML = wishlist.map(item => `
      <div class="sidebar-item">
        <div class="sidebar-item-img">
          <img src="${item.img}" alt="${item.name}" loading="lazy" />
        </div>
        <div class="sidebar-item-info">
          <h4>${item.name.length > 45 ? item.name.slice(0, 45) + "…" : item.name}</h4>
          <p class="price">₹${item.price.toLocaleString("en-IN")}
            <span style="text-decoration:line-through;color:#bbb;font-size:12px;font-weight:400;margin-left:6px">
              ₹${item.original.toLocaleString("en-IN")}
            </span>
          </p>
          <button class="wish-move-btn" onclick="moveToCart(${item.id})">Move to Cart</button>
        </div>
        <button class="sidebar-item-remove" onclick="toggleWishlistItem(${item.id})" title="Remove">🗑</button>
      </div>`).join("");
    footerEl.style.display = "block";
  }
}

function toggleWishlist() {
  const sidebar = document.getElementById("wishlistSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const isOpen  = sidebar.classList.contains("open");
  document.getElementById("cartSidebar").classList.remove("open");
  sidebar.classList.toggle("open", !isOpen);
  overlay.classList.toggle("active", !isOpen);
  document.body.style.overflow = isOpen ? "" : "hidden";
}

function closeSidebars() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("wishlistSidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

// =========================================================
// SEARCH
// =========================================================
function openSearch() {
  document.getElementById("searchBar").classList.add("open");
  setTimeout(() => document.getElementById("searchInput").focus(), 100);
}

function closeSearch() {
  document.getElementById("searchBar").classList.remove("open");
  document.getElementById("searchInput").value = "";
}

function performSearch() {
  const q       = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) return;
  const results = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.includes(q) ||
    (categoryLabels[p.category] || "").toLowerCase().includes(q)
  );
  closeSearch();

  const grid = document.getElementById("productsGrid");
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

  if (results.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--warm-gray);font-size:16px">
      No results found for "<strong>${q}</strong>". <a href="#" onclick="filterProducts('all');" style="color:var(--indigo);font-weight:600">View all products</a>
    </div>`;
  } else {
    grid.innerHTML = results.map(p => {
      const inWish = wishlist.some(w => w.id === p.id);
      return `
        <div class="product-card" onclick="openModal(${p.id})">
          <div class="product-img-wrap">
            <img src="${p.img}" alt="${p.name}" loading="lazy" />
            <div class="product-badge">${p.badge}</div>
            <button class="product-wish-btn ${inWish ? 'active' : ''}" id="wb-${p.id}"
              onclick="event.stopPropagation(); toggleWishlistItem(${p.id})"
              title="Wishlist">
              <svg viewBox="0 0 24 24" fill="${inWish ? '#e74c3c' : 'none'}" stroke="${inWish ? '#e74c3c' : '#aaa'}" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <div class="product-body">
            <p class="product-category">${categoryLabels[p.category]}</p>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price-row">
              <span class="price-current">₹${p.price.toLocaleString("en-IN")}</span>
              <span class="price-original">₹${p.original.toLocaleString("en-IN")}</span>
              <span class="price-off">${p.badge}</span>
            </div>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Add to Cart</button>
          </div>
        </div>`;
    }).join("");
  }
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// =========================================================
// MOBILE NAV
// =========================================================
function openMobileNav() {
  document.getElementById("mobileNav").classList.add("open");
  document.getElementById("overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMobileNav() {
  document.getElementById("mobileNav").classList.remove("open");
  document.getElementById("overlay").classList.remove("active");
  document.body.style.overflow = "";
}

// =========================================================
// CONTACT FORM → Real email via server
// =========================================================
function submitForm(e) {
  e.preventDefault();
  const btn  = e.target.querySelector("button[type=submit]");
  const form = e.target;

  const data = {
    name:    form.querySelector('input[type="text"]').value.trim(),
    email:   form.querySelector('input[type="email"]').value.trim(),
    phone:   form.querySelector('input[type="tel"]').value.trim(),
    message: form.querySelector("textarea").value.trim(),
  };

  if (!data.name || !data.email || !data.message) {
    showToast("⚠️ Please fill all required fields.");
    return;
  }

  btn.textContent = "Sending…";
  btn.disabled    = true;

  fetch("/api/contact", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      document.getElementById("formSuccess").classList.add("show");
      form.reset();
      setTimeout(() => document.getElementById("formSuccess").classList.remove("show"), 5000);
    } else {
      showToast("❌ Failed to send. Please try WhatsApp instead.");
    }
  })
  .catch(() => showToast("❌ Network error. Please try WhatsApp instead."))
  .finally(() => { btn.textContent = "Send Message"; btn.disabled = false; });
}

// =========================================================
// HEADER SCROLL
// =========================================================
function setupHeader() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

// =========================================================
// TOAST
// =========================================================
function showToast(msg) {
  const toast     = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove("show"), 3000);
}
