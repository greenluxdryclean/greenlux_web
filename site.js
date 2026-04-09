const currentYear = document.getElementById("current-year");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const revealItems = Array.from(document.querySelectorAll(".reveal"));

if (revealItems.length) {
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js-ready");
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.getElementById("site-navigation");

if (header && menuToggle && siteNavigation) {
  const setMenuState = (isOpen) => {
    header.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };

  menuToggle.addEventListener("click", () => {
    setMenuState(!header.classList.contains("is-open"));
  });

  siteNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      setMenuState(false);
    }
  });
}

const contactEmail = (document.body.dataset.contactEmail || "").trim();
const whatsappNumber = (document.body.dataset.whatsappNumber || "").trim();

const setFormStatus = (node, message, tone) => {
  if (!node) {
    return;
  }

  node.textContent = message;
  node.classList.remove("is-success", "is-warning", "is-error");

  if (tone) {
    node.classList.add(tone);
  }
};

const buildPayload = (formData) => ({
  fullName: String(formData.get("name") || "").trim(),
  contact: String(formData.get("contact") || "").trim(),
  subjectType: String(formData.get("subject") || "").trim(),
  message: String(formData.get("message") || "").trim(),
});

const buildMailBody = (payload) =>
  [
    "Ad Soyad / Name: " + payload.fullName,
    "İletişim / Contact: " + payload.contact,
    "Konu / Subject: " + payload.subjectType,
    "",
    "Mesaj / Message:",
    payload.message,
  ].join("\n");

const buildWhatsappBody = (payload) =>
  [
    "Merhaba Greenlux,",
    "",
    "Ad Soyad: " + payload.fullName,
    "İletişim: " + payload.contact,
    "Konu: " + payload.subjectType,
    "",
    "Mesaj:",
    payload.message,
  ].join("\n");

document.querySelectorAll("form#contact-form").forEach((form) => {
  const statusNode = form.querySelector(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = buildPayload(new FormData(form));

    if (!payload.fullName || !payload.contact || !payload.subjectType || !payload.message) {
      setFormStatus(statusNode, "Lütfen tüm alanları eksiksiz doldurun.", "is-error");
      return;
    }

    if (contactEmail) {
      const mailtoUrl =
        "mailto:" + encodeURIComponent(contactEmail) +
        "?subject=" + encodeURIComponent("Greenlux Web Formu | " + payload.subjectType) +
        "&body=" + encodeURIComponent(buildMailBody(payload));

      setFormStatus(
        statusNode,
        "E-posta taslağınız hazırlanıyor. Mesajı göndermek için e-posta uygulamanızı onaylayın.",
        "is-success"
      );

      window.location.href = mailtoUrl;
      return;
    }

    if (whatsappNumber) {
      const whatsappUrl =
        "https://wa.me/" + encodeURIComponent(whatsappNumber) +
        "?text=" + encodeURIComponent(buildWhatsappBody(payload));

      setFormStatus(statusNode, "WhatsApp mesaj taslağınız hazırlanıyor.", "is-warning");
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setFormStatus(
      statusNode,
      "Şu anda otomatik iletişim kanalı tanımlı değil. Lütfen telefon veya WhatsApp hattımız üzerinden bize ulaşın.",
      "is-warning"
    );
  });
});

const whatsappFloat = document.querySelector(".whatsapp-float");
const whatsappStatusText = document.querySelector(".whatsapp-status-text");

const getIstanbulParts = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

const isBusinessHours = () => {
  try {
    const parts = getIstanbulParts();
    const openDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    if (!openDays.includes(parts.weekday)) {
      return false;
    }

    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    return minutes >= 540 && minutes < 1200;
  } catch (error) {
    return true;
  }
};

const updateWhatsappStatus = () => {
  if (!whatsappFloat || !whatsappStatusText) {
    return;
  }

  const online = isBusinessHours();
  whatsappFloat.classList.toggle("is-online", online);
  whatsappFloat.classList.toggle("is-offline", !online);
  whatsappStatusText.textContent = online ? "Çevrimiçi" : "Çevrimdışı";
};

updateWhatsappStatus();
window.setInterval(updateWhatsappStatus, 60000);
