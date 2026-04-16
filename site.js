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
const whatsappStatusNodes = Array.from(document.querySelectorAll(".whatsapp-status-text"));
const whatsappActionLinks = Array.from(
  document.querySelectorAll('a.whatsapp-float, a.button-whatsapp')
);

const ISTANBUL_UTC_OFFSET_MINUTES = 180; // TRT (UTC+3)

const getIstanbulClock = () => {
  // Date.now() is already UTC-based epoch time. We only need +03:00 shift.
  const istanbulShifted = new Date(Date.now() + ISTANBUL_UTC_OFFSET_MINUTES * 60000);

  return {
    weekday: istanbulShifted.getUTCDay(), // 0: Pazar
    minutesOfDay: istanbulShifted.getUTCHours() * 60 + istanbulShifted.getUTCMinutes(),
  };
};

const isBusinessHours = () => {
  try {
    const clock = getIstanbulClock();
    const isOpenDay = clock.weekday >= 1 && clock.weekday <= 6; // Pzt-Cmt
    const isOpenTime = clock.minutesOfDay >= 540 && clock.minutesOfDay <= 1200; // 09:00-20:00
    return isOpenDay && isOpenTime;
  } catch (error) {
    return false;
  }
};

const setWhatsappLinksInteractive = (online) => {
  whatsappActionLinks.forEach((link) => {
    if (!link.dataset.hrefOriginal) {
      link.dataset.hrefOriginal = link.getAttribute("href") || "";
    }

    link.classList.toggle("is-disabled", !online);
    link.setAttribute("aria-disabled", String(!online));

    if (online) {
      link.setAttribute("href", link.dataset.hrefOriginal);
      link.removeAttribute("tabindex");
      return;
    }

    link.setAttribute("href", "#");
    link.setAttribute("tabindex", "-1");
  });
};

whatsappActionLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.classList.contains("is-disabled")) {
      event.preventDefault();
    }
  });
});

const updateWhatsappStatus = () => {
  if (!whatsappFloat && !whatsappStatusNodes.length) {
    return;
  }

  const online = isBusinessHours();
  const isEnglish = (document.documentElement.lang || "").toLowerCase().startsWith("en");
  const labelOnline = isEnglish ? "Online" : "Çevrimiçi";
  const labelOffline = isEnglish ? "Offline" : "Çevrimdışı";

  if (whatsappFloat) {
    whatsappFloat.classList.toggle("is-online", online);
    whatsappFloat.classList.toggle("is-offline", !online);
  }

  whatsappStatusNodes.forEach((node) => {
    node.textContent = online ? labelOnline : labelOffline;
  });

  setWhatsappLinksInteractive(online);
};

updateWhatsappStatus();
window.setInterval(updateWhatsappStatus, 30000);

// Keep status accurate when tab regains focus.
window.addEventListener("focus", updateWhatsappStatus);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    updateWhatsappStatus();
  }
});
