let coin = document.getElementById("Search-button");

let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

coin.addEventListener("click", async function () {
  document.getElementById("coin-name").textContent = "Loading...";
  let coinName = document
    .getElementById("coin-search")
    .value.trim()
    .toLowerCase();
  if (!coinName) {
    alert("Please enter a cryptocurrency name.");
    return;
  } else if (coinName.includes(" ")) {
    alert("Please enter a valid cryptocurrency name without spaces.");
    return;
  }
  let response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinName}`,
  );
  if (!response.ok) {
    alert("Cryptocurrency not found. Please check the name and try again.");
    return;
  }

  loadChart(coinName);

  let data = await response.json();
  let price = data.market_data.current_price.usd;
  let change = data.market_data.price_change_percentage_24h;
  let image = data.image.small;
  let name = data.name;
  let coinmarketcap = data.market_data.market_cap.usd;

  document.getElementById("coin-name").textContent =
    `${name} (${data.symbol.toUpperCase()})`;
  document.getElementById("coin-logo").src = image;
  document.getElementById("coin-price").textContent =
    `Current Price: $${price}`;
  document.getElementById("coin-change").textContent = `24h Change: ${change}%`;

  document.getElementById("coin-marketcap").textContent =
    `Market Cap: $${coinmarketcap.toLocaleString()}`;

  let changeElement = document.getElementById("coin-change");
  if (change > 0) {
    changeElement.style.color = "green";
  } else if (change < 0) {
    changeElement.style.color = "red";
  }
});

async function loadChart(coinName) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinName}/market_chart?vs_currency=usd&days=7`,
  );

  const data = await response.json();

  // Take one data point per day
  const prices = data.prices.filter((_, index) => index % 24 === 0);

  const priceValues = prices.map((p) => p[1]);

  const labels = prices.map((p) =>
    new Date(p[0]).toLocaleDateString("en-US", {
      weekday: "short",
    }),
  );

  const ctx = document.getElementById("chart-canvas");

  if (window.cryptoChart) {
    window.cryptoChart.destroy();
  }

  window.cryptoChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Price (USD)",
          data: priceValues,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.2)",
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        },
      ],
    },
  });
}

document
  .getElementById("favourites-button")
  .addEventListener("click", function () {
    let coinName = document.getElementById("coin-name").textContent;
    if (!favourites.includes(coinName)) {
      favourites.push(coinName);
      alert(`${coinName} added to favourites!`);
    } else {
      alert(`${coinName} is already in favourites.`);
    }
    localStorage.setItem("favourites", JSON.stringify(favourites));
    displayFavourites();
  });

function displayFavourites() {
  let favSection = document.getElementById("Favourites");

  favSection.innerHTML = "";

  let list = document.createElement("ul");

  favourites.forEach(function (coin) {
    let li = document.createElement("li");

    li.textContent = coin;

    list.appendChild(li);
    li.style.cursor = "pointer";
  });

  favSection.appendChild(list);
}
