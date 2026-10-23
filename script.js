// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
// Nomor WhatsApp Perusahaan Solvèra
const COMPANY_WHATSAPP = "6281234567890"; 

// Opsi Pilihan Tipe / Varian Produk
const DEFAULT_VARIANTS = ["Biru", "Abu-abu", "Merah", "Kuning", "Hitam"];

// Load Keranjang dari LocalStorage jika ada
let cart = JSON.parse(localStorage.getItem("solveraCart")) || [];

// ==========================================
// DOM ELEMENTS SELECTION & LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. NAVBAR, HAMBURGER & DYNAMIC SMART HEADER SCROLL (TIDAK DIUBAH) ---
    const navbar = document.getElementById("navbar");
    const hambarBtn = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const grafikSection = document.getElementById("grafik-penjualan");
    const logoImg = document.getElementById("logoImg"); // Elemen Logo Header

    // Toggle Menu Hamburger
    if (hambarBtn && navMenu) {
        hambarBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            hambarBtn.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Tutup menu saat link diklik (mobile)
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", () => {
            if (hambarBtn && navMenu) {
                hambarBtn.classList.remove("active");
                navMenu.classList.remove("active");
            }
        });
    });

    // Tutup menu hamburger jika pengguna mengklik di luar area menu/tombol
    window.addEventListener("click", (e) => {
        if (navMenu && navMenu.classList.contains("active")) {
            // Cek apakah yang diklik BUKAN bagian dari navMenu dan BUKAN tombol hamburger
            if (!navMenu.contains(e.target) && !hambarBtn.contains(e.target)) {
                hambarBtn.classList.remove("active");
                navMenu.classList.remove("active");
            }
        }
    });
    
    // Smart Header Scroll (Efek Glassmorphism, Penyesuaian Warna Gelap/Terang, & Pergantian Logo)
    window.addEventListener("scroll", () => {
        
        const scrollPos = window.scrollY;

        if (scrollPos <= 50) {
            navbar.classList.remove("scrolled", "dark-section");
            if (logoImg) logoImg.src = "image/solvera.png"; // Kembalikan ke logo putih awal
            return;
        }

        let isInsideGrafik = false;
        if (grafikSection) {
            const grafikTop = grafikSection.offsetTop - 70;
            const grafikBottom = grafikTop + grafikSection.offsetHeight;
            
            if (scrollPos >= grafikTop && scrollPos <= grafikBottom) {
                isInsideGrafik = true;
            }
        }

        navbar.classList.add("scrolled");

        if (isInsideGrafik) {
            navbar.classList.add("dark-section");
            if (logoImg) logoImg.src = "image/solvera.png"; // Logo putih untuk section gelap
        } else {
            navbar.classList.remove("dark-section");
            if (logoImg) logoImg.src = "image/solvera-dark.png"; // Logo hijau tua untuk section terang
        }
    });

    // --- 2. INTERAKSI GRAFIK PENJUALAN HOLOGRAM ---
    const chartBarsHolo = document.querySelectorAll(".chart-bars-container-holo .bar-holo");
    const chartSection = document.getElementById("grafik-penjualan");

    chartBarsHolo.forEach(bar => {
        bar.addEventListener("click", function (e) {
            e.stopPropagation();
            chartBarsHolo.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
        });
    });

    if (chartSection) {
        chartSection.addEventListener("click", () => {
            chartBarsHolo.forEach(b => b.classList.remove("active"));
        });
    }

    // --- 3. SISTEM PRODUK & KERANJANG BELANJA (CART) ---
    const cartIcon = document.getElementById("cartBtn");
    const cartModal = document.getElementById("cartModal");
    const closeCartBtn = document.getElementById("closeCart");
    const checkoutBtn = document.getElementById("checkoutBtn");

    // Inisialisasi Tampilan Keranjang Awal
    updateCartUI();

    // Buka Modal Keranjang via Ikon Header
    if (cartIcon && cartModal) {
        cartIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            cartModal.classList.add("active");
        });
    }

    // Tutup Modal Keranjang via Tombol [X]
    if (closeCartBtn && cartModal) {
        closeCartBtn.addEventListener("click", () => {
            cartModal.classList.remove("active");
        });
    }

    // Tutup Modal saat klik di luar kotak modal
    window.addEventListener("click", (e) => {
        if (cartModal && e.target === cartModal) {
            cartModal.classList.remove("active");
        }
    });

    // A. Tombol "+ Keranjang" (Hanya Tambah Item, Tidak Buka Modal)
    document.querySelectorAll(".btn-add-only").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            // DISESUAIKAN: Mengambil dari card horizontal yang baru
            const card = e.target.closest(".product-card-horizontal");
            addToCartFromCard(card);

            // Feedback visual kecil pada tombol
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-check"></i> Masuk!`;
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 1200);
        });
    });

    // B. Tombol "Beli" (Tambah Item + LANGSUNG BUKA Pop-up Keranjang)
    document.querySelectorAll(".btn-buy-now").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            // DISESUAIKAN: Mengambil dari card horizontal yang baru
            const card = e.target.closest(".product-card-horizontal");
            addToCartFromCard(card);

            if (cartModal) {
                cartModal.classList.add("active");
            }
        });
    });

    // Helper: Tambah Produk dari Kartu ke Array Cart
    function addToCartFromCard(card) {
        if (!card) return;

        const id = card.dataset.id;
        const name = card.dataset.name;
        const price = parseInt(card.dataset.price);
        const img = card.dataset.img;

        // Cek apakah produk sudah ada di keranjang
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                image: img,
                type: DEFAULT_VARIANTS[0], // Default tipe awal: "Biru"
                quantity: 1
            });
        }

        saveAndUpdateCart();
    }

    // Render Ulang UI Keranjang (Termasuk Dropdown Tipe di antara Qty & Harga)
    function updateCartUI() {
        const cartItemsContainer = document.getElementById("cartItems");
        const cartCountBadge = document.getElementById("cartCount");
        const cartTotalPriceEl = document.getElementById("cartTotalPrice");

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = "";
        let total = 0;
        let totalCount = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="cart-empty-text">Keranjang masih kosong.</p>`;
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                totalCount += item.quantity;

                // Buat list opsi dropdown tipe
                const variantOptions = DEFAULT_VARIANTS.map(v => 
                    `<option value="${v}" ${item.type === v ? 'selected' : ''}>${v}</option>`
                ).join("");

                const itemRow = document.createElement("div");
                itemRow.classList.add("cart-item-row");
                itemRow.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.name}</h4>
                        
                        <!-- Posisi Tipe berada di antara Kuantitas dan Harga -->
                        <div class="cart-item-meta">
                            <div class="cart-qty-control">
                                <button class="btn-qty btn-minus" data-index="${index}">-</button>
                                <span>${item.quantity}</span>
                                <button class="btn-qty btn-plus" data-index="${index}">+</button>
                            </div>

                            <select class="cart-variant-select" data-index="${index}">
                                ${variantOptions}
                            </select>
                        </div>

                        <span class="cart-item-price">Rp ${itemTotal.toLocaleString("id-ID")}</span>
                    </div>
                    <button class="btn-remove-item" data-index="${index}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemRow);
            });
        }

        // Update Badge & Total Harga
        if (cartCountBadge) {
            cartCountBadge.textContent = totalCount;
            cartCountBadge.style.display = totalCount > 0 ? "flex" : "none";
        }
        if (cartTotalPriceEl) {
            cartTotalPriceEl.textContent = `Rp ${total.toLocaleString("id-ID")}`;
        }

        attachCartEvents();
    }

    // Pasang Event Listener untuk Kontrol di Dalam Pop-up Keranjang
    function attachCartEvents() {
        // Ganti Tipe / Varian
        document.querySelectorAll(".cart-variant-select").forEach(select => {
            select.addEventListener("change", (e) => {
                const idx = e.target.dataset.index;
                cart[idx].type = e.target.value;
                saveAndUpdateCart();
            });
        });

        // Tambah Kuantitas
        document.querySelectorAll(".btn-plus").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                cart[idx].quantity += 1;
                saveAndUpdateCart();
            });
        });

        // Kurang Kuantitas
        document.querySelectorAll(".btn-minus").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                cart[idx].quantity -= 1;
                if (cart[idx].quantity <= 0) {
                    cart.splice(idx, 1);
                }
                saveAndUpdateCart();
            });
        });

        // Hapus Item
        document.querySelectorAll(".btn-remove-item").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                cart.splice(idx, 1);
                saveAndUpdateCart();
            });
        });
    }

    // Simpan ke LocalStorage & Refresh UI
    function saveAndUpdateCart() {
        localStorage.setItem("solveraCart", JSON.stringify(cart));
        updateCartUI();
    }

    // --- 4. CHECKOUT KE WHATSAPP ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Keranjang belanja kamu masih kosong!");
                return;
            }

            // Simpan data cart dan arahkan ke halaman checkout
            localStorage.setItem("solveraCart", JSON.stringify(cart));
            window.location.href = "checkout.html";
        });
    }

});