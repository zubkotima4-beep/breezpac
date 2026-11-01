(() => {
  "use strict";

  const body = document.body;

  /* ---------- Год в подвале ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Шапка ---------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------- Мобильное меню ---------- */
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById("site-nav");
  const menuText = menuToggle ? menuToggle.querySelector(".menu-toggle__text") : null;

  if (menuToggle && nav) {
    const navLinks = Array.from(nav.querySelectorAll("a"));
    const firstLink = navLinks[0];
    const lastLink = navLinks[navLinks.length - 1];

    const setMenu = (open, restoreFocus = true) => {
      const isOpen = Boolean(open);
      body.classList.toggle("nav-open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
      if (menuText) {
        menuText.textContent = isOpen ? "закрыть" : "меню";
      }

      if (isOpen && firstLink) {
        firstLink.focus({ preventScroll: true });
      } else if (restoreFocus && nav.contains(document.activeElement)) {
        menuToggle.focus({ preventScroll: true });
      }
    };

    menuToggle.addEventListener("click", () => {
      setMenu(!body.classList.contains("nav-open"));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenu(false, false));
    });

    document.addEventListener("keydown", (event) => {
      if (!body.classList.contains("nav-open")) return;

      if (event.key === "Escape") {
        setMenu(false);
        return;
      }

      if (event.key !== "Tab" || !firstLink || !lastLink) return;

      if (event.shiftKey) {
        if (document.activeElement === firstLink) {
          event.preventDefault();
          menuToggle.focus({ preventScroll: true });
        } else if (document.activeElement === menuToggle) {
          event.preventDefault();
          lastLink.focus({ preventScroll: true });
        }
      } else if (document.activeElement === lastLink) {
        event.preventDefault();
        menuToggle.focus({ preventScroll: true });
      } else if (document.activeElement === menuToggle) {
        event.preventDefault();
        firstLink.focus({ preventScroll: true });
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 981px)");
    const handleDesktop = (event) => {
      if (event.matches && body.classList.contains("nav-open")) {
        setMenu(false, false);
      }
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleDesktop);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleDesktop);
    }
  }

  /* ---------- Появление блоков ---------- */
  const revealElements = Array.from(document.querySelectorAll("[data-reveal]"));
  if (revealElements.length) {
    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -7% 0px", threshold: 0.04 }
      );

      revealElements.forEach((el) => {
        el.classList.add("reveal-ready");
        observer.observe(el);
      });
    }
  }

  /* ---------- Фильтры работ ---------- */
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const workCards = Array.from(document.querySelectorAll("[data-category]"));
  const workCount = document.querySelector("[data-work-count]");

  if (filterButtons.length && workCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter || "all";
        let visible = 0;

        filterButtons.forEach((other) => {
          const isActive = other === button;
          other.classList.toggle("is-active", isActive);
          other.setAttribute("aria-pressed", String(isActive));
        });

        workCards.forEach((card) => {
          const show = filter === "all" || card.dataset.category === filter;
          card.hidden = !show;
          if (show) visible += 1;
        });

        if (workCount) {
          workCount.textContent = String(visible).padStart(2, "0");
        }
      });
    });
  }

  /* ---------- Лайтбокс галереи ---------- */
  const lightbox = document.querySelector("[data-lightbox]");
  const galleryButtons = Array.from(document.querySelectorAll("[data-gallery-open]"));

  if (lightbox && galleryButtons.length) {
    if (typeof lightbox.showModal !== "function") {
      galleryButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const full = button.dataset.full;
          if (full) window.open(full, "_blank", "noopener");
        });
      });
    } else {
      const lightboxImage = lightbox.querySelector("[data-lightbox-image]");
      const lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
      const lightboxCredit = lightbox.querySelector("[data-lightbox-credit]");
      const lightboxCount = lightbox.querySelector("[data-lightbox-count]");
      const closeButton = lightbox.querySelector("[data-lightbox-close]");
      const prevButton = lightbox.querySelector("[data-lightbox-prev]");
      const nextButton = lightbox.querySelector("[data-lightbox-next]");
      let currentIndex = 0;
      let lastTrigger = null;

      const renderSlide = (index) => {
        currentIndex = (index + galleryButtons.length) % galleryButtons.length;
        const trigger = galleryButtons[currentIndex];
        const preview = trigger.querySelector("img");
        const full = trigger.dataset.full || (preview ? preview.getAttribute("src") : "");

        if (lightboxImage) {
          lightboxImage.src = full;
          lightboxImage.alt = preview ? preview.alt : "";
        }
        if (lightboxCaption) {
          lightboxCaption.textContent = trigger.dataset.caption || "";
        }
        if (lightboxCredit) {
          lightboxCredit.textContent = trigger.dataset.credit || "";
        }
        if (lightboxCount) {
          const current = String(currentIndex + 1).padStart(2, "0");
          const total = String(galleryButtons.length).padStart(2, "0");
          lightboxCount.textContent = `${current} / ${total}`;
        }
      };

      const openLightbox = (index) => {
        lastTrigger = galleryButtons[index];
        renderSlide(index);
        body.classList.add("lightbox-open");
        lightbox.showModal();
      };

      const closeLightbox = () => {
        body.classList.remove("lightbox-open");
        if (lightbox.open) lightbox.close();
        if (lastTrigger) lastTrigger.focus({ preventScroll: true });
      };

      galleryButtons.forEach((button, index) => {
        button.addEventListener("click", () => openLightbox(index));
      });

      if (closeButton) closeButton.addEventListener("click", closeLightbox);
      if (prevButton) prevButton.addEventListener("click", () => renderSlide(currentIndex - 1));
      if (nextButton) nextButton.addEventListener("click", () => renderSlide(currentIndex + 1));

      lightbox.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeLightbox();
          return;
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          renderSlide(currentIndex - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          renderSlide(currentIndex + 1);
        }
      });

      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
      });

      lightbox.addEventListener("cancel", () => {
        body.classList.remove("lightbox-open");
      });

      lightbox.addEventListener("close", () => {
        body.classList.remove("lightbox-open");
      });
    }
  }

  /* ---------- Сборка заявки для WhatsApp ---------- */
  const briefForm = document.querySelector("[data-brief-form]");

  if (briefForm) {
    const result = briefForm.querySelector("[data-brief-result]");
    const resultText = briefForm.querySelector("[data-brief-text]");
    const resultLink = briefForm.querySelector("[data-brief-wa]");
    const copyButton = briefForm.querySelector("[data-brief-copy]");
    const whatsappNumber = "79255006727";

    const buildBrief = () => {
      if (!briefForm.checkValidity()) {
        briefForm.reportValidity();
        return;
      }

      const data = new FormData(briefForm);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const service = String(data.get("service") || "").trim();
      const details = String(data.get("details") || "").trim();

      const lines = [
        "Здравствуйте! Хочу обсудить печать.",
        name ? `Имя: ${name}` : "",
        phone ? `Телефон: ${phone}` : "",
        service ? `Услуга: ${service}` : "",
        details ? `Детали: ${details}` : "",
      ].filter(Boolean);

      const message = lines.join("\n");
      const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      if (resultText) resultText.value = message;
      if (resultLink) resultLink.href = link;

      if (result) {
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        window.setTimeout(() => {
          if (resultText) resultText.focus({ preventScroll: true });
        }, 250);
      }
    };

    briefForm.addEventListener("submit", (event) => {
      event.preventDefault();
      buildBrief();
    });

    if (copyButton && resultText) {
      copyButton.addEventListener("click", async () => {
        const original = copyButton.dataset.label || copyButton.textContent.trim();
        copyButton.dataset.label = original;
        let copied = false;

        try {
          await navigator.clipboard.writeText(resultText.value);
          copied = true;
        } catch (error) {
          resultText.select();
          try {
            copied = document.execCommand("copy");
          } catch (fallbackError) {
            copied = false;
          }
        }

        copyButton.textContent = copied ? "Скопировано" : "Не удалось";
        window.setTimeout(() => {
          copyButton.textContent = original;
        }, 2200);
      });
    }
  }
})();
