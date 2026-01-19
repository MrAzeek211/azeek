let pasalData = [];
let filteredData = [];
let historyData = [];

// Load CSV
fetch("UU_nasional.CSV")
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length < 4) continue;

      pasalData.push({
        pasal: cols[0].trim(),
        deskripsi: cols[1].trim(),
        denda: parseInt(cols[2].replace(/[^0-9]/g, "")) || 0,
        hukuman: parseInt(cols[3].replace(/[^0-9]/g, "")) || 0
      });
    }
    filteredData = pasalData.slice();
    renderTable(filteredData);
  })
  .catch(err => {
    console.error("CSV load error:", err);
  });

// RENDER TABLE
function renderTable(data) {
  const tbody = document.querySelector("#pasalTable tbody");
  tbody.innerHTML = "";
  data.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="checkbox" data-index="${i}" onchange="updateSummary()"></td>
      <td>${item.pasal}</td>
      <td>${item.deskripsi}</td>
      <td>${item.denda}</td>
      <td>${item.hukuman}</td>
    `;
    tbody.appendChild(row);
  });
}

// FILTER
function applyFilters() {
  const maxDenda = parseInt(document.getElementById("filterDenda").value) || Infinity;
  const maxHukuman = parseInt(document.getElementById("filterHukuman").value) || Infinity;
  filteredData = pasalData.filter(p => p.denda <= maxDenda && p.hukuman <= maxHukuman);
  renderTable(filteredData);
}

function resetFilters() {
  document.getElementById("filterDenda").value = "";
  document.getElementById("filterHukuman").value = "";
  filteredData = pasalData.slice();
  renderTable(filteredData);
  updateSummary();
}

// SUMMARY
function updateSummary() {
  const selectedRows = document.querySelectorAll("input[type=checkbox]:checked");
  let totalD = 0, totalH = 0, pasals = [];
  selectedRows.forEach(cb => {
    const idx = parseInt(cb.dataset.index);
    const p = filteredData[idx];
    totalD += p.denda;
    totalH += p.hukuman;
    pasals.push(p.pasal);
  });
  document.getElementById("totalDenda").textContent = totalD;
  document.getElementById("totalHukuman").textContent = totalH;
  document.getElementById("pasalDipilih").textContent = pasals.join(", ") || "-";
}

// CONFIRM + HISTORY
function confirmSelection() {
  const selectedRows = document.querySelectorAll("input[type=checkbox]:checked");
  if (selectedRows.length === 0) return alert("Belum ada pasal terpilih.");

  const summary = {
    waktu: new Date().toLocaleString(),
    pasal: document.getElementById("pasalDipilih").textContent,
    denda: document.getElementById("totalDenda").textContent,
    hukuman: document.getElementById("totalHukuman").textContent
  };
  historyData.push(summary);
  renderHistory();
}

function renderHistory() {
  const ul = document.getElementById("historyList");
  ul.innerHTML = "";
  historyData.forEach((h, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. [${h.waktu}] Pasal: ${h.pasal} | Denda: ${h.denda} | Hukuman: ${h.hukuman}`;
    ul.appendChild(li);
  });
}

function resetHistory() {
  historyData = [];
  renderHistory();
}
