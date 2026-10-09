// =================================01. ELEMENTOS GLOBAIS =================================
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const searchButton = document.getElementById("searchButton");

const categories = document.querySelectorAll(".category");
const eventCards = document.querySelectorAll(".event-card");

const eventCount = document.getElementById("eventCount");
const emptyMessage = document.getElementById("emptyMessage");

// Modais
const modal = document.getElementById("ticketModal");
const closeModalButton = document.getElementById("closeModal");

const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalSymbol = document.getElementById("modalSymbol");
const modalCity = document.getElementById("modalCity");
const modalDate = document.getElementById("modalDate");
const modalDescription = document.getElementById("modalDescription");

const ticketOptions = document.getElementById("ticketOptions");
const decreaseQty = document.getElementById("decreaseQty");
const increaseQty = document.getElementById("increaseQty");
const quantityValue = document.getElementById("quantityValue");

const summaryTicket = document.getElementById("summaryTicket");
const summaryQuantity = document.getElementById("summaryQuantity");
const summaryTotal = document.getElementById("summaryTotal");
const checkoutButton = document.getElementById("checkoutButton");

// Checkout Modal
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSummaryTitle = document.getElementById("checkoutSummaryTitle");
const checkoutSummaryDetails = document.getElementById("checkoutSummaryDetails");
const checkoutSummaryTotal = document.getElementById("checkoutSummaryTotal");

// Auth Modal & Utilizador
const authModal = document.getElementById("authModal");
const openAuthModalBtn = document.getElementById("openAuthModalBtn");
const closeAuthModal = document.getElementById("closeAuthModal");
const tabLoginBtn = document.getElementById("tabLoginBtn");
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const userAccountInfo = document.getElementById("userAccountInfo");
const accName = document.getElementById("accName");
const accEmail = document.getElementById("accEmail");
const logoutBtn = document.getElementById("logoutBtn");
const authTabsHeader = document.getElementById("authTabsHeader");
const mobileAccountLink = document.getElementById("mobileAccountLink");

const toast = document.getElementById("toast");

let selectedCategory = "Todos";
let currentEvent = null;
let selectedTicketIndex = 0;
let quantity = 1;
let toastTimeout;

// Estado do utilizador (Meupass.ao)
let currentUser = JSON.parse(localStorage.getItem("meupass_user")) || null;

const eventsData = {
  musica: {
    date: "Data a confirmar",
    description: "Uma experiência musical para desfrutar de boa música, conhecer pessoas e viver uma noite especial.",
    symbol: "♫",
    tickets: [
      { name: "Normal", description: "Acesso geral ao evento", price: 5000 },
      { name: "VIP", description: "Acesso à zona VIP", price: 15000 },
      { name: "Backstage", description: "Acesso especial e exclusivo", price: 25000 }
    ]
  },
  sunset: {
    date: "Data a confirmar",
    description: "Uma experiência ao pôr do sol, ideal para aproveitar música, convívio e momentos inesquecíveis.",
    symbol: "◉",
    tickets: [
      { name: "Normal", description: "Entrada geral", price: 7500 },
      { name: "VIP", description: "Acesso à zona VIP", price: 20000 }
    ]
  },
  forum: {
    date: "Data a confirmar",
    description: "Um encontro dedicado à inovação, tecnologia, empreendedorismo e novas oportunidades de negócio.",
    symbol: "⌘",
    tickets: [
      { name: "Normal", description: "Participação geral", price: 10000 },
      { name: "VIP", description: "Experiência VIP", price: 25000 },
      { name: "Premium", description: "Acesso premium executivo", price: 40000 }
    ]
  }
};

// =================================02. MENU MOBILE =================================
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.textContent = isOpen ? "×" : "☰";
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mainNav.querySelectorAll("a:not(#mobileAccountLink)").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.textContent = "☰";
  });
});

if (mobileAccountLink) {
  mobileAccountLink.addEventListener("click", (e) => {
    e.preventDefault();
    mainNav.classList.remove("open");
    menuToggle.textContent = "☰";
    updateAuthUI();
    authModal.hidden = false;
    document.body.classList.add("modal-open");
  });
}

// =================================03. PESQUISA E FILTROS =================================
function filterEvents() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("pt");
  const selectedCity = cityFilter.value;
  let visibleCount = 0;

  eventCards.forEach((card) => {
    const name = card.dataset.name.toLocaleLowerCase("pt");
    const category = card.dataset.category;
    const city = card.dataset.city;

    const matchesSearch = name.includes(searchTerm);
    const matchesCategory = selectedCategory === "Todos" || category === selectedCategory;
    const matchesCity = selectedCity === "" || city === selectedCity;

    const shouldShow = matchesSearch && matchesCategory && matchesCity;
    card.hidden = !shouldShow;
    if (shouldShow) visibleCount++;
  });

  eventCount.textContent = `${visibleCount} ${visibleCount === 1 ? "evento" : "eventos"}`;
  emptyMessage.hidden = visibleCount !== 0;
}

categories.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    categories.forEach((b) => b.classList.toggle("active", b === button));
    filterEvents();
  });
});

searchInput.addEventListener("input", filterEvents);
cityFilter.addEventListener("change", filterEvents);
searchButton.addEventListener("click", filterEvents);

function formatPrice(price) {
  return `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(price)} Kz`;
}

// =================================04. MODAL DE COMPRA / INGRESSOS =================================
function openEventModal(card) {
  const eventId = card.dataset.eventId;
  const eventDetails = eventsData[eventId];

  if (!eventDetails) return;

  currentEvent = {
    id: eventId,
    name: card.dataset.name,
    category: card.dataset.category,
    city: card.dataset.city,
    date: eventDetails.date,
    description: eventDetails.description,
    symbol: eventDetails.symbol,
    tickets: eventDetails.tickets
  };

  selectedTicketIndex = 0;
  quantity = 1;

  modalTitle.textContent = currentEvent.name;
  modalCategory.textContent = currentEvent.category.toUpperCase();
  modalSymbol.textContent = currentEvent.symbol;
  modalCity.textContent = `${currentEvent.city}, Angola`;
  modalDate.textContent = currentEvent.date;
  modalDescription.textContent = currentEvent.description;

  renderTicketOptions();
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function renderTicketOptions() {
  ticketOptions.replaceChildren();

  currentEvent.tickets.forEach((ticket, index) => {
    const label = document.createElement("label");
    label.className = "ticket-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "ticketType";
    input.value = String(index);
    input.checked = index === selectedTicketIndex;

    input.addEventListener("change", () => {
      selectedTicketIndex = index;
      updateOrderSummary();
    });

    const content = document.createElement("span");
    content.className = "ticket-option-content";
    content.innerHTML = `
      <span class="ticket-option-name">${ticket.name}</span>
      <span class="ticket-option-description">${ticket.description}</span>
      <span class="ticket-option-price">${formatPrice(ticket.price)}</span>
    `;

    label.append(input, content);
    ticketOptions.append(label);
  });

  updateOrderSummary();
}

function updateOrderSummary() {
  if (!currentEvent) return;
  const ticket = currentEvent.tickets[selectedTicketIndex];
  const total = ticket.price * quantity;

  quantityValue.textContent = String(quantity);
  decreaseQty.disabled = quantity <= 1;
  increaseQty.disabled = quantity >= 10;

  summaryTicket.textContent = `Ingresso ${ticket.name}`;
  summaryQuantity.textContent = `${quantity} ${quantity === 1 ? "ingresso" : "ingressos"}`;
  summaryTotal.textContent = formatPrice(total);
}

decreaseQty.addEventListener("click", () => {
  if (quantity > 1) { quantity--; updateOrderSummary(); }
});

increaseQty.addEventListener("click", () => {
  if (quantity < 10) { quantity++; updateOrderSummary(); }
});

closeModalButton.addEventListener("click", () => {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
});

document.querySelectorAll("[data-buy]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".event-card");
    openEventModal(card);
  });
});

// =================================05. CHECKOUT E BILHETES =================================
checkoutButton.addEventListener("click", () => {
  if (!currentEvent) return;

  if (!currentUser) {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    showToast("Por favor, entra na tua conta ou cria uma para concluir a compra.");
    updateAuthUI();
    authModal.hidden = false;
    document.body.classList.add("modal-open");
    return;
  }

  modal.hidden = true;

  const ticket = currentEvent.tickets[selectedTicketIndex];
  const total = ticket.price * quantity;

  checkoutSummaryTitle.textContent = `${currentEvent.name} (${ticket.name})`;
  checkoutSummaryDetails.textContent = `${quantity}x Ingressos`;
  checkoutSummaryTotal.textContent = formatPrice(total);

  document.getElementById("buyerName").value = currentUser.name || "";
  checkoutModal.hidden = false;
});

closeCheckoutModal.addEventListener("click", () => {
  checkoutModal.hidden = true;
  document.body.classList.remove("modal-open");
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  checkoutModal.hidden = true;
  document.body.classList.remove("modal-open");

  const ticket = currentEvent.tickets[selectedTicketIndex];
  const newTicket = {
    id: "PASS-" + Math.floor(100000 + Math.random() * 900000),
    eventName: currentEvent.name,
    ticketName: ticket.name,
    quantity: quantity,
    city: currentEvent.city,
    date: currentEvent.date,
    totalPaid: formatPrice(ticket.price * quantity),
    purchaseDate: new Date().toLocaleDateString("pt-PT")
  };

  if (!currentUser.tickets) {
    currentUser.tickets = [];
  }
  currentUser.tickets.push(newTicket);
  localStorage.setItem("meupass_user", JSON.stringify(currentUser));

  showToast("Pagamento bem-sucedido! O teu bilhete já está disponível na tua conta.");
});

// =================================06. AUTENTICAÇÃO =================================
function updateAuthUI() {
  if (currentUser) {
    if (authTabsHeader) authTabsHeader.style.display = "none";
    loginForm.hidden = true;
    registerForm.hidden = true;
    userAccountInfo.hidden = false;
    
    accName.textContent = currentUser.name;
    accEmail.textContent = currentUser.email;
    openAuthModalBtn.textContent = "A minha conta";
    if (mobileAccountLink) {
      mobileAccountLink.style.display = "block";
      mobileAccountLink.textContent = "A minha conta (" + currentUser.name + ")";
    }

    renderUserTickets();
  } else {
    if (authTabsHeader) authTabsHeader.style.display = "flex";
    userAccountInfo.hidden = true;
    loginForm.hidden = false;
    registerForm.hidden = true;
    openAuthModalBtn.textContent = "Entrar / Registar";
    if (mobileAccountLink) {
      mobileAccountLink.style.display = "block";
      mobileAccountLink.textContent = "Entrar / Registar";
    }
  }
}

function renderUserTickets() {
  const container = document.getElementById("myTicketsContainer");
  if (!container) return;
  container.replaceChildren();

  if (!currentUser.tickets || currentUser.tickets.length === 0) {
    const msg = document.createElement("div");
    msg.className = "no-tickets-msg";
    msg.textContent = "Ainda não tens nenhum bilhete comprado.";
    container.append(msg);
    return;
  }

  currentUser.tickets.forEach((t) => {
    const card = document.createElement("div");
    card.className = "digital-ticket-card";

    card.innerHTML = `
      <div class="digital-ticket-top">
        <span class="digital-ticket-event">${t.eventName}</span>
        <span class="digital-ticket-type">${t.ticketName.toUpperCase()} (${t.quantity}x)</span>
      </div>
      <div class="digital-ticket-details">
        <span>⌖ ${t.city}, Angola | ◷ ${t.date}</span>
        <span>Total pago: <strong>${t.totalPaid}</strong> (Adquirido a ${t.purchaseDate})</span>
      </div>
      <div class="digital-ticket-footer">
        <span class="digital-ticket-code">CÓD: ${t.id}</span>
        <span class="digital-ticket-qr-sim">[ QR CODE VÁLIDO ]</span>
      </div>
    `;
    container.append(card);
  });
}

openAuthModalBtn.addEventListener("click", () => {
  updateAuthUI();
  authModal.hidden = false;
  document.body.classList.add("modal-open");
});

closeAuthModal.addEventListener("click", () => {
  authModal.hidden = true;
  document.body.classList.remove("modal-open");
});

if (tabLoginBtn && tabRegisterBtn) {
  tabLoginBtn.addEventListener("click", () => {
    tabLoginBtn.classList.add("active");
    tabRegisterBtn.classList.remove("active");
    loginForm.hidden = false;
    registerForm.hidden = true;
  });

  tabRegisterBtn.addEventListener("click", () => {
    tabRegisterBtn.classList.add("active");
    tabLoginBtn.classList.remove("active");
    loginForm.hidden = true;
    registerForm.hidden = false;
  });
}

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  
  currentUser = { name, email, tickets: [] };
  localStorage.setItem("meupass_user", JSON.stringify(currentUser));
  
  authModal.hidden = true;
  document.body.classList.remove("modal-open");
  showToast(`Conta criada com sucesso! Bem-vindo ao MEUPASS, ${name}.`);
  updateAuthUI();
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  
  const savedUser = JSON.parse(localStorage.getItem("meupass_user"));
  if (savedUser && savedUser.email === email) {
    currentUser = savedUser;
  } else {
    currentUser = { name: email.split("@")[0], email, tickets: [] };
  }
  localStorage.setItem("meupass_user", JSON.stringify(currentUser));

  authModal.hidden = true;
  document.body.classList.remove("modal-open");
  showToast("Sessão iniciada com sucesso!");
  updateAuthUI();
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("meupass_user");
  authModal.hidden = true;
  document.body.classList.remove("modal-open");
  showToast("Sessão terminada.");
  updateAuthUI();
});

// =================================07. NOTIFICAÇÕES TOAST =================================
function showToast(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 4500);
}

filterEvents();
updateAuthUI();