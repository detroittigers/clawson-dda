(function () {
  const modal = document.querySelector("[data-gallery-modal]");
  if (!modal) return;

  const galleries = Array.isArray(window.EVENT_GALLERIES) ? window.EVENT_GALLERIES : [];
  if (!galleries.length) return;

  const galleryMap = new Map();
  galleries.forEach(function (gallery) {
    if (gallery && gallery.id) galleryMap.set(gallery.id, gallery);
  });

  const featuredContainer = document.querySelector("[data-gallery-featured]");
  const dialog = modal.querySelector(".gallery-dialog");
  const titleNode = modal.querySelector("#gallery-title");
  const metaNode = modal.querySelector("[data-gallery-meta]");
  const imageNode = modal.querySelector("[data-gallery-image]");
  const captionNode = modal.querySelector("[data-gallery-caption]");
  const countNode = modal.querySelector("[data-gallery-count]");
  const thumbsNode = modal.querySelector("[data-gallery-thumbs]");
  const prevBtn = modal.querySelector("[data-gallery-prev]");
  const nextBtn = modal.querySelector("[data-gallery-next]");

  let activeGallery = null;
  let activeIndex = 0;
  let lastFocused = null;

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function featuredIds() {
    return ["cinema-street", "car-show", "clawson-fest", "clawson-market"];
  }

  function renderFeaturedCards() {
    if (!featuredContainer) return;

    const cards = featuredIds()
      .map(function (id) {
        return galleryMap.get(id);
      })
      .filter(Boolean)
      .map(function (gallery) {
        return `
          <article class="gallery-card reveal">
            <button
              class="gallery-cover"
              type="button"
              data-gallery-open="${escapeHtml(gallery.id)}"
              data-gallery-index="0"
              aria-label="Open ${escapeHtml(gallery.title)} photo gallery"
            >
              <img src="${escapeHtml(gallery.cover)}" alt="${escapeHtml(gallery.title)} highlight" loading="lazy" />
            </button>
            <div class="gallery-card-content">
              <h3>${escapeHtml(gallery.title)}</h3>
              <p>${escapeHtml(gallery.description || "")}</p>
              <button class="btn btn-outline" type="button" data-gallery-open="${escapeHtml(gallery.id)}" data-gallery-index="0">View Photos</button>
            </div>
          </article>
        `;
      });

    featuredContainer.innerHTML = cards.join("");
  }

  function lockBody(locked) {
    if (locked) {
      document.body.classList.add("gallery-open");
      return;
    }
    document.body.classList.remove("gallery-open");
  }

  function getPhotos(gallery) {
    return Array.isArray(gallery && gallery.photos) ? gallery.photos : [];
  }

  function setMeta() {
    if (!activeGallery) return;
    titleNode.textContent = activeGallery.title || "Event Photos";
    metaNode.textContent = "";
    metaNode.hidden = true;
  }

  function setActiveThumb() {
    const buttons = thumbsNode.querySelectorAll("button");
    buttons.forEach(function (btn, index) {
      btn.classList.toggle("is-active", index === activeIndex);
      if (index === activeIndex) {
        btn.setAttribute("aria-current", "true");
        btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      } else {
        btn.removeAttribute("aria-current");
      }
    });
  }

  function prefetchAround(index, photos) {
    if (!photos.length) return;
    [index + 1, index - 1].forEach(function (i) {
      const safe = (i + photos.length) % photos.length;
      const img = new Image();
      img.src = photos[safe].src;
    });
  }

  function renderMainImage() {
    if (!activeGallery) return;
    const photos = getPhotos(activeGallery);
    if (!photos.length) return;

    const photo = photos[activeIndex];
    imageNode.src = photo.src;
    imageNode.alt = photo.alt || activeGallery.title + " photo";
    captionNode.textContent = photo.alt || activeGallery.title;
    countNode.textContent = activeIndex + 1 + " of " + photos.length;

    prevBtn.disabled = photos.length <= 1;
    nextBtn.disabled = photos.length <= 1;

    setActiveThumb();
    prefetchAround(activeIndex, photos);
  }

  function renderThumbs() {
    if (!activeGallery) return;
    const photos = getPhotos(activeGallery);
    thumbsNode.innerHTML = photos
      .map(function (photo, index) {
        return `
          <button class="gallery-thumb" type="button" data-gallery-thumb="${index}" aria-label="View photo ${index + 1}">
            <img src="${escapeHtml(photo.src)}" alt="" loading="lazy" />
          </button>
        `;
      })
      .join("");

    setActiveThumb();
  }

  function setIndex(index) {
    const photos = getPhotos(activeGallery);
    if (!photos.length) return;
    const len = photos.length;
    activeIndex = ((index % len) + len) % len;
    renderMainImage();
  }

  function nextImage() {
    setIndex(activeIndex + 1);
  }

  function prevImage() {
    setIndex(activeIndex - 1);
  }

  function getFocusableElements() {
    if (!dialog) return [];
    const selectors = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ];

    return Array.from(dialog.querySelectorAll(selectors.join(","))).filter(function (node) {
      return node.offsetParent !== null;
    });
  }

  function trapFocus(event) {
    if (event.key !== "Tab") return;

    const focusable = getFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function onKeyDown(event) {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeGallery();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextImage();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevImage();
      return;
    }

    trapFocus(event);
  }

  function openGallery(id, startIndex) {
    const gallery = galleryMap.get(id);
    if (!gallery) return;

    lastFocused = document.activeElement;
    activeGallery = gallery;
    activeIndex = Number.isFinite(startIndex) ? startIndex : 0;

    modal.hidden = false;
    lockBody(true);
    setMeta();
    renderThumbs();
    setIndex(activeIndex);

    const closeBtn = modal.querySelector(".gallery-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeGallery() {
    modal.hidden = true;
    lockBody(false);
    activeGallery = null;
    activeIndex = 0;
    imageNode.src = "";
    imageNode.alt = "";
    thumbsNode.innerHTML = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  renderFeaturedCards();

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-gallery-open]");
    if (trigger) {
      event.preventDefault();
      const id = trigger.getAttribute("data-gallery-open");
      const index = Number(trigger.getAttribute("data-gallery-index") || 0);
      openGallery(id, index);
      return;
    }

    if (event.target.closest("[data-gallery-close]")) {
      event.preventDefault();
      closeGallery();
      return;
    }

    const thumb = event.target.closest("[data-gallery-thumb]");
    if (thumb && !modal.hidden) {
      const index = Number(thumb.getAttribute("data-gallery-thumb") || 0);
      setIndex(index);
    }
  });

  prevBtn.addEventListener("click", prevImage);
  nextBtn.addEventListener("click", nextImage);
  document.addEventListener("keydown", onKeyDown);
})();
