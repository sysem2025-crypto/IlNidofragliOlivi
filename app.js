const STORAGE_KEYS = {
  guests: "bnbDemoGuests",
  pin: "bnbAdminPin",
  loggedIn: "bnbAdminLoggedIn"
};

const DEFAULT_PIN = "1234";

const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const guestForm = document.getElementById("guestForm");
const pinForm = document.getElementById("pinForm");
const logoutButton = document.getElementById("logoutButton");
const practiceList = document.getElementById("practiceList");
const guestList = document.getElementById("guestList");

const loginFeedback = document.getElementById("loginFeedback");
const guestFeedback = document.getElementById("guestFeedback");
const pinFeedback = document.getElementById("pinFeedback");

const counters = {
  guestCount: document.getElementById("guestCount"),
  practiceCount: document.getElementById("practiceCount"),
  taxTotal: document.getElementById("taxTotal"),
  activeStaysCount: document.getElementById("activeStaysCount"),
  heroGuestCount: document.getElementById("heroGuestCount"),
  heroPracticeCount: document.getElementById("heroPracticeCount"),
  heroTaxTotal: document.getElementById("heroTaxTotal")
};

function readGuests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.guests) || "[]");
  } catch {
    return [];
  }
}

function saveGuests(guests) {
  localStorage.setItem(STORAGE_KEYS.guests, JSON.stringify(guests));
}

function readPin() {
  return localStorage.getItem(STORAGE_KEYS.pin) || DEFAULT_PIN;
}

function setLoggedIn(isLoggedIn) {
  localStorage.setItem(STORAGE_KEYS.loggedIn, String(isLoggedIn));
  loginPanel.classList.toggle("hidden", isLoggedIn);
  adminPanel.classList.toggle("hidden", !isLoggedIn);
}

function isLoggedIn() {
  return localStorage.getItem(STORAGE_KEYS.loggedIn) === "true";
}

function euro(amount) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}

function nightsBetween(checkin, checkout) {
  const from = new Date(checkin);
  const to = new Date(checkout);
  const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

function practiceStatus(guest) {
  if (guest.practiceCompleted) {
    return {
      label: "Completata",
      className: "tag-complete",
      description: "Pratica pronta e archiviata."
    };
  }

  if (guest.document && guest.nationality) {
    return {
      label: "In verifica",
      className: "tag-review",
      description: "Dati completi, controllare invio e quadrature."
    };
  }

  return {
    label: "Da registrare",
    className: "tag-pending",
    description: "Mancano dati essenziali per completare la pratica."
  };
}

function computeTax(guest) {
  if (guest.exemption) {
    return 0;
  }

  return nightsBetween(guest.checkin, guest.checkout) * guest.people * guest.taxRate;
}

function countActiveStays(guests) {
  const now = new Date();
  return guests.filter((guest) => new Date(guest.checkout) >= now).length;
}

function renderEmptyState(container, text) {
  container.innerHTML = `<div class="list-item"><p>${text}</p></div>`;
}

function renderGuests(guests) {
  if (!guests.length) {
    renderEmptyState(guestList, "Nessun soggiorno registrato ancora.");
    renderEmptyState(practiceList, "Nessuna pratica da mostrare.");
    return;
  }

  guestList.innerHTML = guests
    .slice()
    .reverse()
    .map((guest) => {
      const tax = computeTax(guest);
      const nights = nightsBetween(guest.checkin, guest.checkout);
      return `
        <article class="list-item">
          <h5>${guest.name}</h5>
          <p>${guest.nationality} • ${guest.document}</p>
          <div class="list-item-meta">
            <span>${guest.checkin} → ${guest.checkout}</span>
            <span>${guest.people} ospiti • ${nights} notti</span>
            <span>Tassa: ${tax === 0 ? "Esente" : euro(tax)}</span>
            <span>Tariffa: ${euro(guest.taxRate)}/notte</span>
          </div>
        </article>
      `;
    })
    .join("");

  practiceList.innerHTML = guests
    .slice()
    .reverse()
    .map((guest) => {
      const status = practiceStatus(guest);
      return `
        <article class="list-item">
          <div class="tag ${status.className}">${status.label}</div>
          <h5>${guest.name}</h5>
          <p>${status.description}</p>
          <p>Arrivo ${guest.checkin} • Partenza ${guest.checkout}</p>
        </article>
      `;
    })
    .join("");
}

function updateMetrics() {
  const guests = readGuests();
  const totalTax = guests.reduce((sum, guest) => sum + computeTax(guest), 0);
  const openPractices = guests.filter((guest) => !guest.practiceCompleted).length;

  counters.guestCount.textContent = guests.length;
  counters.practiceCount.textContent = openPractices;
  counters.taxTotal.textContent = euro(totalTax);
  counters.activeStaysCount.textContent = countActiveStays(guests);

  counters.heroGuestCount.textContent = guests.length;
  counters.heroPracticeCount.textContent = openPractices;
  counters.heroTaxTotal.textContent = euro(totalTax);

  renderGuests(guests);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const pin = document.getElementById("adminPinInput").value.trim();
  if (pin !== readPin()) {
    loginFeedback.textContent = "PIN non corretto. Riprova.";
    return;
  }

  loginFeedback.textContent = "";
  setLoggedIn(true);
  updateMetrics();
  loginForm.reset();
});

guestForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const guest = {
    id: crypto.randomUUID(),
    name: document.getElementById("guestName").value.trim(),
    nationality: document.getElementById("guestNationality").value.trim(),
    document: document.getElementById("guestDocument").value.trim(),
    checkin: document.getElementById("guestCheckin").value,
    checkout: document.getElementById("guestCheckout").value,
    people: Number(document.getElementById("guestPeople").value),
    taxRate: Number(document.getElementById("guestTaxRate").value),
    exemption: document.getElementById("guestExemption").checked,
    practiceCompleted: false
  };

  if (!guest.name || !guest.checkin || !guest.checkout) {
    guestFeedback.textContent = "Compila i campi obbligatori prima di salvare.";
    return;
  }

  if (new Date(guest.checkout) < new Date(guest.checkin)) {
    guestFeedback.textContent = "La data di check-out deve essere successiva al check-in.";
    return;
  }

  const guests = readGuests();
  guests.push(guest);
  saveGuests(guests);

  guestFeedback.textContent = "Ospite registrato correttamente.";
  guestForm.reset();
  document.getElementById("guestPeople").value = 2;
  document.getElementById("guestTaxRate").value = "1.50";
  updateMetrics();
});

pinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newPin = document.getElementById("newPin").value.trim();
  if (!/^\d{4,8}$/.test(newPin)) {
    pinFeedback.textContent = "Il PIN deve contenere da 4 a 8 cifre.";
    return;
  }

  localStorage.setItem(STORAGE_KEYS.pin, newPin);
  pinFeedback.textContent = "PIN aggiornato con successo.";
  pinForm.reset();
});

logoutButton.addEventListener("click", () => {
  setLoggedIn(false);
});

setLoggedIn(isLoggedIn());
updateMetrics();
