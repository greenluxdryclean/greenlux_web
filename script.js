document.documentElement.classList.add("js");

const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const revealItems = document.querySelectorAll(".reveal");
const menuToggleText = menuToggle?.querySelector(".menu-toggle-text")?.textContent?.trim();

const syncMenuToggleLabel = (isOpen) => {
  if (!menuToggle) return;
  const isTurkishMenu = menuToggleText === "Menü";
  const nextLabel = isTurkishMenu
    ? isOpen
      ? "Ana menüyü kapat"
      : "Ana menüyü aç"
    : isOpen
      ? "Close main menu"
      : "Open main menu";

  menuToggle.setAttribute("aria-label", nextLabel);
};

const closeMenu = () => {
  siteHeader?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  syncMenuToggleLabel(false);
};

if (menuToggle && siteHeader) {
  syncMenuToggleLabel(false);

  menuToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    syncMenuToggleLabel(isOpen);
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 860) return;
    if (!siteHeader.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const currentId = entry.target.getAttribute("id");

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("is-active", isActive);
      });
    });
  },
  {
    rootMargin: "-30% 0px -50% 0px",
    threshold: 0.05
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const yearNode = document.querySelector("#current-year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const contactForm = document.querySelector("#contact-form");
const contactRecipient = document.body.dataset.contactEmail?.trim() ?? "";
const whatsappRecipient = (document.body.dataset.whatsappNumber || "").replace(/\D/g, "");
const whatsappFloat = document.querySelector(".whatsapp-float");
const currentLang = document.documentElement.lang || "tr";

const formMessages = currentLang.startsWith("en")
  ? {
      successMail: "Your request draft has been prepared. Your email application is opening.",
      successWhatsapp: "Your request draft has been prepared. WhatsApp is opening.",
      warning:
        "Your form has been prepared, but no direct contact channel is defined yet. The message text has been copied so it can be shared manually.",
      warningNoClipboard:
        "Your form is ready, but no direct contact channel is defined yet. Add a business email or WhatsApp number to activate direct sending.",
      error: "Please complete all required fields before submitting the form."
    }
  : {
      successMail: "Talep taslağınız hazırlandı. E-posta uygulamanız açılıyor.",
      successWhatsapp: "Talep taslağınız hazırlandı. WhatsApp görüşmesi açılıyor.",
      warning:
        "Formunuz hazırlandı; ancak doğrudan iletişim kanalı henüz tanımlı değil. Hazırlanan mesaj metni manuel iletim için panoya kopyalandı.",
      warningNoClipboard:
        "Form hazır; ancak doğrudan iletişim kanalı henüz tanımlı değil. Doğrudan gönderim için işletme e-posta adresi veya WhatsApp hattı eklenmelidir.",
      error: "Lütfen formu göndermeden önce zorunlu alanları eksiksiz doldurun."
    };

const setFormStatus = (node, tone, message) => {
  node.classList.remove("is-success", "is-warning", "is-error");
  node.classList.add(tone);
  node.textContent = message;
};

const getIstanbulBusinessStatus = () => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const minutesSinceMidnight = hour * 60 + minute;
  const workingDays = new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  const isWorkingDay = workingDays.has(weekday);

  return isWorkingDay && minutesSinceMidnight >= 9 * 60 && minutesSinceMidnight < 20 * 60;
};

const syncWhatsappAvailability = () => {
  if (!whatsappFloat) return;

  const isOnline = getIstanbulBusinessStatus();
  const statusText = whatsappFloat.querySelector(".whatsapp-status-text");
  const buttonTitle = currentLang.startsWith("en")
    ? isOnline
      ? "Greenlux is currently online on WhatsApp"
      : "Greenlux is currently offline on WhatsApp"
    : isOnline
      ? "Greenlux şu anda WhatsApp'ta çevrimiçi"
      : "Greenlux şu anda WhatsApp'ta çevrimdışı";

  whatsappFloat.classList.toggle("is-online", isOnline);
  whatsappFloat.classList.toggle("is-offline", !isOnline);
  whatsappFloat.setAttribute("data-availability", isOnline ? "online" : "offline");
  whatsappFloat.setAttribute("title", buttonTitle);

  if (statusText) {
    statusText.textContent = currentLang.startsWith("en")
      ? isOnline
        ? "Online"
        : "Offline"
      : isOnline
        ? "Çevrimiçi"
        : "Çevrimdışı";
  }
};

syncWhatsappAvailability();
window.setInterval(syncWhatsappAvailability, 60000);

if (contactForm) {
  const statusNode = contactForm.querySelector(".form-status");

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      if (statusNode) {
        setFormStatus(statusNode, "is-error", formMessages.error);
      }
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const topic = String(formData.get("topic") || "").trim();
    const message = String(formData.get("message") || "").trim();

    const subject = `${topic} - ${name}`;
    const body = [
      currentLang.startsWith("en") ? `Full Name: ${name}` : `Ad Soyad: ${name}`,
      currentLang.startsWith("en")
        ? `Phone / Email: ${contact}`
        : `Telefon / E-posta: ${contact}`,
      currentLang.startsWith("en") ? `Request Type: ${topic}` : `Konu Türü: ${topic}`,
      "",
      currentLang.startsWith("en") ? "Message:" : "Mesaj:",
      message
    ].join("\n");

    if (contactRecipient) {
      const mailtoUrl = `mailto:${encodeURIComponent(contactRecipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      if (statusNode) {
        setFormStatus(statusNode, "is-success", formMessages.successMail);
      }

      window.location.href = mailtoUrl;
      return;
    }

    if (whatsappRecipient) {
      const whatsappText = `${subject}\n\n${body}`;
      const whatsappUrl = `https://wa.me/${encodeURIComponent(whatsappRecipient)}?text=${encodeURIComponent(whatsappText)}`;

      if (statusNode) {
        setFormStatus(statusNode, "is-success", formMessages.successWhatsapp);
      }

      window.location.href = whatsappUrl;
      return;
    }

    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${subject}\n\n${body}`);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (statusNode) {
      setFormStatus(
        statusNode,
        "is-warning",
        copied ? formMessages.warning : formMessages.warningNoClipboard
      );
    }
  });
}
