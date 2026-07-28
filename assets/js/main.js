// Geridovich Advokat — shared site behavior (nav, lightbox, reveal, contact form)
(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // Scroll-reveal
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Lightbox for credential thumbnails
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCaption = lightbox.querySelector(".lightbox-caption span");
    var closeBtn = lightbox.querySelector(".lightbox-close");

    document.querySelectorAll(".timeline-item .thumb").forEach(function (thumb) {
      thumb.addEventListener("click", function (e) {
        e.preventDefault();
        var img = thumb.querySelector("img");
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = img.alt;
        lightbox.classList.add("is-open");
        closeBtn.focus();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lbImg.src = "";
    }
    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  // Contact form: client-side validation + Web3Forms submission
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");

    function setFieldError(field, message) {
      var wrap = field.closest(".field");
      wrap.classList.add("has-error");
      wrap.querySelector(".error").textContent = message;
    }
    function clearFieldError(field) {
      var wrap = field.closest(".field");
      wrap.classList.remove("has-error");
    }

    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.hasAttribute("required") && !field.value.trim()) {
          setFieldError(field, "Заполните это поле.");
        } else if (field.type === "tel" && field.value.trim() && field.value.replace(/\D/g, "").length < 10) {
          setFieldError(field, "Проверьте номер телефона.");
        } else {
          clearFieldError(field);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var firstInvalid = null;
      form.querySelectorAll("input[required], textarea[required]").forEach(function (field) {
        if (!field.value.trim()) {
          setFieldError(field, "Заполните это поле.");
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        } else {
          clearFieldError(field);
        }
      });
      if (!valid) {
        firstInvalid.focus();
        return;
      }

      status.className = "form-status";
      status.setAttribute("aria-busy", "true");
      status.textContent = "Отправляем заявку...";

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      var data = new FormData(form);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (result) {
          submitBtn.disabled = false;
          status.removeAttribute("aria-busy");
          if (result.success) {
            status.className = "form-status is-success";
            status.textContent = "Спасибо! Заявка отправлена — я свяжусь с вами в ближайшее время.";
            form.reset();
          } else {
            status.className = "form-status is-error";
            status.textContent = "Не получилось отправить форму. Позвоните, пожалуйста: +7 960-264-25-97.";
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          status.removeAttribute("aria-busy");
          status.className = "form-status is-error";
          status.textContent = "Не получилось отправить форму. Позвоните, пожалуйста: +7 960-264-25-97.";
        });
    });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
