// ===== CONSTANTS =====
const WA_NUMBER = '6281221522609';

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('sixtnine_cart') || '[]');
let currentModal = { name: '', price: 0, img: '' };

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// Close on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== ACTIVE NAV ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allNavLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(sec => observer.observe(sec));

// ===== CARD ANIMATION ON SCROLL =====
// FIX: Langsung tampilkan kartu yang sudah visible saat halaman dibuka
function animateCards() {
  const cards = document.querySelectorAll('.product-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px 50px 0px' });

  cards.forEach((card, i) => {
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.dataset.delay = String(i * 100); // stagger berdasarkan index

    const rect = card.getBoundingClientRect();
    // Jika kartu sudah terlihat saat load, biarkan tampil langsung
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    } else {
      // Jika belum terlihat, sembunyikan dan amati untuk animasi saat muncul
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      cardObserver.observe(card);
    }
  });
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ===== CART FUNCTIONS =====
function updateCartUI() {
  const items = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  const countEl = document.querySelector('.cart-count');

  countEl.textContent = cart.length;

  if (cart.length === 0) {
    items.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    footer.style.display = 'none';
    return;
  }

  let total = 0;
  items.innerHTML = cart.map((item, i) => {
    total += item.price;
    return `
      <div class="cart-item">
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}" onerror="this.src='img/placeholder.svg'"/>
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>Rp ${item.price.toLocaleString('id-ID')}</span>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${i})" aria-label="Remove">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');

  document.getElementById('cartTotal').textContent = `Rp ${total.toLocaleString('id-ID')}`;
  footer.style.display = 'block';

  // Build WhatsApp checkout message
  const orderText = cart.map(item => `- ${item.name} (Rp ${item.price.toLocaleString('id-ID')})`).join('%0A');
  const waMsg = `Halo SixtNine! Saya ingin memesan:%0A%0A${orderText}%0A%0ATotal: Rp ${total.toLocaleString('id-ID')}%0A%0AMohon konfirmasinya, terima kasih!`;
  document.getElementById('checkoutWa').href = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;
}

function addToCart(name, price, img = 'img/placeholder.svg') {
  cart.push({ name, price, img });
  localStorage.setItem('sixtnine_cart', JSON.stringify(cart));
  updateCartUI();
  openCart();
  showToast(`${name} ditambahkan ke keranjang!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('sixtnine_cart', JSON.stringify(cart));
  updateCartUI();
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.querySelector('.cart-btn').addEventListener('click', openCart);

// ===== MODAL FUNCTIONS =====
function openDetail(name, price, imgSrc) {
  currentModal = { name, price, img: imgSrc };
  document.getElementById('modalName').textContent = name;
  document.getElementById('modalPrice').textContent = `Rp ${price.toLocaleString('id-ID')}`;
  document.getElementById('modalImg').src = imgSrc;

  const waMsg = `Halo SixtNine! Saya tertarik dengan produk *${name}* seharga *Rp ${price.toLocaleString('id-ID')}*. Apakah masih tersedia? Terima kasih!`;
  document.getElementById('modalWaBtn').href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addFromModal() {
  addToCart(currentModal.name, currentModal.price, currentModal.img);
  closeModal();
}

// Close modal on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeCart(); }
});

// ===== INIT =====
updateCartUI();
animateCards();

// Pastikan tampilan awal langsung ke bagian hero agar tidak terlihat kosong
function ensureInitialView() {
  const hero = document.getElementById('home');
  const nav = document.getElementById('navbar');
  if (!hero) return;
  const offset = (nav ? nav.offsetHeight : 0) + 8; // beri sedikit jarak

  function attemptScroll() {
    // pastikan tidak ada overlay aktif yang menutupi tampilan
    document.querySelectorAll('.modal-overlay.active, .cart-overlay.active').forEach(el => el.classList.remove('active'));
    document.body.style.overflow = '';

    const rect = hero.getBoundingClientRect();
    // jika sudah terlihat, tidak perlu scroll
    if (rect.top < window.innerHeight && rect.bottom > 0) return true;

    const top = rect.top + window.pageYOffset - offset;
    window.scrollTo({ top, left: 0, behavior: 'auto' });
    return false;
  }

  let attempts = 0;
  const maxAttempts = 12;
  // Coba segera, lalu ulang beberapa kali untuk mengatasi timing layout
  if (attemptScroll()) return;
  const id = setInterval(() => {
    attempts++;
    const done = attemptScroll();
    if (done || attempts >= maxAttempts) clearInterval(id);
  }, 100);
}

// Jalankan saat DOM siap dan saat semua resource (gambar) telah dimuat.
document.addEventListener('DOMContentLoaded', ensureInitialView);
window.addEventListener('load', ensureInitialView);

// ===== HERO SHOE PARALLAX (subtle) =====
document.addEventListener('mousemove', (e) => {
  const shoe = document.querySelector('.hero-shoe');
  if (!shoe || window.innerWidth < 768) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 6;
  shoe.style.transform = `translate(${x}px, ${y}px)`;
});
