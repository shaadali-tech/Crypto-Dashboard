let coinButton = document.getElementById("Search-button");

let favourites = [];
displayFavourites();

async function loadTopCoins() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const coins = await response.json();

    const topCoinsList = document.getElementById("top-coins-list");

    topCoinsList.innerHTML = "";

    coins.forEach((coin) => {
      let li = document.createElement("li");

      li.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;

      li.style.cursor = "pointer";

      li.addEventListener("click", function () {
        document.getElementById("coin-search").value = coin.id;

        coinButton.click();
      });

      topCoinsList.appendChild(li);
    });
  } catch (error) {
    console.error("Top coins failed:", error);
  }
}

window.addEventListener("DOMContentLoaded", loadTopCoins);

coinButton.addEventListener("click", async function () {
  document.getElementById("coin-name").textContent = "Loading...";

  let coinName = document
    .getElementById("coin-search")
    .value.trim()
    .toLowerCase();

  if (!coinName) {
    alert("Please enter a cryptocurrency name.");
    return;
  }

  if (coinName.includes(" ")) {
    alert("Please enter a valid cryptocurrency name without spaces.");
    return;
  }

  try {
    let response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinName)}`,
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    let data = await response.json();

    if (!data.market_data) {
      alert("Coin not found.");
      return;
    }

    coinButton.dataset.currentCoinId = coinName;

    await loadChart(coinName);

    let price = data.market_data.current_price.usd;
    let change = data.market_data.price_change_percentage_24h;
    let image = data.image.small;
    let name = data.name;
    let marketcap = data.market_data.market_cap.usd;

    document.getElementById("coin-name").textContent =
      `${name} (${data.symbol.toUpperCase()})`;

    document.getElementById("coin-logo").src = image;

    document.getElementById("coin-price").textContent =
      `Current Price: $${price}`;

    document.getElementById("coin-change").textContent =
      `24h Change: ${change.toFixed(2)}%`;

    document.getElementById("coin-marketcap").textContent =
      `Market Cap: $${marketcap.toLocaleString()}`;

    let changeElement = document.getElementById("coin-change");

    if (change > 0) changeElement.style.color = "green";
    else changeElement.style.color = "red";
  } catch (error) {
    console.error("Search failed:", error);

    alert("Failed to fetch coin data.");
  }
});

async function loadChart(coinName) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinName)}/market_chart?vs_currency=usd&days=7`,
    );

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    const prices = data.prices.filter((_, i) => i % 6 === 0);

    const priceValues = prices.map((p) => p[1]);

    const labels = prices.map((p) =>
      new Date(p[0]).toLocaleDateString("en-US", {
        weekday: "short",
      }),
    );

    const ctx = document.getElementById("chart-canvas");

    if (window.cryptoChart) window.cryptoChart.destroy();

    window.cryptoChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Price (USD)",
            data: priceValues,
            borderColor: "#818cf8",
            backgroundColor: "rgba(99,102,241,0.15)",
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: "#a5b4fc",
            pointBorderColor: "#6366f1",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#94a3b8", font: { family: "Inter" } },
          },
        },
        scales: {
          x: {
            ticks: { color: "#64748b", font: { family: "Inter", size: 11 } },
            grid: { color: "rgba(148,163,184,0.08)" },
          },
          y: {
            ticks: { color: "#64748b", font: { family: "Inter", size: 11 } },
            grid: { color: "rgba(148,163,184,0.08)" },
          },
        },
      },
    });
  } catch (error) {
    console.error("Chart load failed:", error);
    const ctx = document.getElementById("chart-canvas");
    if (window.cryptoChart) window.cryptoChart.destroy();
    ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
  }
}

document
  .getElementById("favourites-button")
  .addEventListener("click", function () {
    let coinId = coinButton.dataset.currentCoinId;
    let coinDisplayName = document.getElementById("coin-name").textContent;

    if (!coinId) {
      alert("Please search for a coin first.");
      return;
    }

    const alreadyAdded = favourites.some((f) => f.id === coinId);

    if (!alreadyAdded) {
      favourites.push({ id: coinId, display: coinDisplayName });
      displayFavourites();
      alert(`${coinDisplayName} added to favourites!`);
    } else {
      alert(`${coinDisplayName} already in favourites.`);
    }
  });

function displayFavourites() {
  let favSection = document.getElementById("Favourites");

  favSection.innerHTML = "";

  let list = document.createElement("ul");

  favourites.forEach((coin) => {
    let li = document.createElement("li");

    li.textContent = coin.display;

    li.style.cursor = "pointer";

    li.addEventListener("click", function () {
      document.getElementById("coin-search").value = coin.id;

      coinButton.click();
    });

    let removeBtn = document.createElement("button");

    removeBtn.textContent = "X";

    removeBtn.style.color = "red";

    removeBtn.style.marginLeft = "10px";

    removeBtn.onclick = function () {
      favourites = favourites.filter((c) => c.id !== coin.id);

      displayFavourites();
    };

    li.appendChild(removeBtn);

    list.appendChild(li);
  });

  favSection.appendChild(list);
}
