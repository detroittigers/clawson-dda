(function () {
  const grid = document.querySelector("[data-business-grid]");
  if (!grid) return;

  const searchInput = document.querySelector("[data-business-search]");
  const categorySelect = document.querySelector("[data-business-category]");
  const sortSelect = document.querySelector("[data-business-sort]");
  const countNode = document.querySelector("[data-business-count]");

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeWebsite(url) {
    const raw = (url || "").trim().replace(/\s+/g, "");
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    return "https://" + raw;
  }

  function linkButton(href, label) {
    if (!href) return "";
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }

  function businessCard(item) {
    const tags = (item.categories || []).map(function (cat) {
      return `<span class="tag">${escapeHtml(cat)}</span>`;
    }).join("");

    const links = [
      linkButton(normalizeWebsite(item.website), "Website"),
      linkButton(item.facebook, "Facebook"),
      linkButton(item.instagram, "Instagram"),
      item.publicEmail ? `<a href="mailto:${escapeHtml(item.publicEmail)}">Email</a>` : ""
    ].filter(Boolean).join("");

    return `
      <article class="card business-card reveal">
        <h3>${escapeHtml(item.name)}</h3>
        <div class="biz-meta">${escapeHtml(item.address)}${item.cityStateZip ? `, ${escapeHtml(item.cityStateZip)}` : ""}</div>
        <div class="biz-meta">${escapeHtml(item.phone)}</div>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        <div>${tags}</div>
        ${links ? `<div class="biz-links">${links}</div>` : ""}
      </article>
    `;
  }

  function populateCategoryOptions(items) {
    const set = new Set();
    items.forEach(function (item) {
      (item.categories || []).forEach(function (c) { set.add(c); });
    });

    [...set].sort(function (a, b) { return a.localeCompare(b); }).forEach(function (category) {
      const opt = document.createElement("option");
      opt.value = category;
      opt.textContent = category;
      categorySelect.appendChild(opt);
    });
  }

  function filterSort(items) {
    const term = (searchInput.value || "").trim().toLowerCase();
    const category = categorySelect.value;
    const sort = sortSelect.value;

    let filtered = items.filter(function (item) {
      const haystack = [
        item.name,
        item.description,
        item.address,
        item.cityStateZip,
        (item.categories || []).join(" ")
      ].join(" ").toLowerCase();

      const matchesTerm = !term || haystack.includes(term);
      const matchesCategory = !category || (item.categories || []).includes(category);
      return matchesTerm && matchesCategory;
    });

    filtered = filtered.sort(function (a, b) {
      if (sort === "category") {
        const ac = (a.categories && a.categories[0]) || "";
        const bc = (b.categories && b.categories[0]) || "";
        const catCmp = ac.localeCompare(bc);
        if (catCmp !== 0) return catCmp;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }

  function render(items) {
    const selected = filterSort(items);
    grid.innerHTML = selected.map(businessCard).join("");

    if (countNode) {
      countNode.textContent = `${selected.length} business${selected.length === 1 ? "" : "es"}`;
    }

    if (!selected.length) {
      grid.innerHTML = "<p class='card'>No businesses match those filters yet. Try a broader search.</p>";
    }
  }

  function loadBusinesses() {
    if (Array.isArray(window.DOWNTOWN_BUSINESSES) && window.DOWNTOWN_BUSINESSES.length) {
      return Promise.resolve(window.DOWNTOWN_BUSINESSES);
    }

    return Promise.reject(new Error("business data not loaded"));
  }

  loadBusinesses()
    .then(function (items) {
      populateCategoryOptions(items);
      render(items);

      [searchInput, categorySelect, sortSelect].forEach(function (el) {
        el.addEventListener("input", function () { render(items); });
        el.addEventListener("change", function () { render(items); });
      });
    })
    .catch(function () {
      grid.innerHTML = "<p class='card'>Directory content could not be loaded right now.</p>";
    });
})();
