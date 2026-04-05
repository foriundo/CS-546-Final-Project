const form = document.getElementById("search-form");
const resultsDiv = document.getElementById("results");

if (form && resultsDiv) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const params = new URLSearchParams(new FormData(form));
    // drop empty fields so the URL stays clean
    for (const [key, val] of [...params]) {
      if (!val.trim()) params.delete(key);
    }

    try {
      const res = await fetch(`/centers/search?${params}`, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Something went wrong. Try again.");

      const centers = await res.json();
      history.pushState(null, "", `/centers/search?${params}`);
      renderResults(centers);
    } catch (err) {
      resultsDiv.innerHTML = `<p class="error-message">${err.message}</p>`;
    }
  });
}

function renderResults(centers) {
  const today = ["sun_open", "mon_open", "tue_open", "wed_open", "thu_open", "fri_open", "sat_open"][new Date().getDay()];

  if (!centers.length) {
    resultsDiv.innerHTML = "<p>No centers found.</p>";
    return;
  }

  const cards = centers.map((c) => {
    const isOpen = c[today] !== "Closed";
    const badge = isOpen
      ? `<span class="badge badge-open">Open Today</span>`
      : `<span class="badge badge-closed">Closed Today</span>`;
    return `
      <div class="card">
        <div class="card-title"><a href="/centers/${c._id}">${c.location_name}</a></div>
        <p>${c.borough_name} — ${c.address_street}</p>
        ${badge}
      </div>`;
  });

  resultsDiv.innerHTML = `<p id="result-count">${centers.length} center(s) found</p>` + cards.join("");
}
