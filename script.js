document.getElementById("simForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const initial = parseFloat(document.getElementById("initial").value);
  const recurring = parseFloat(document.getElementById("recurring").value);
  const frequency = document.getElementById("frequency").value;
  const annualReturn = parseFloat(document.getElementById("annualReturn").value) / 100;
  const years = parseInt(document.getElementById("years").value);
  const target = parseFloat(document.getElementById("target").value) || null;

  let periodsPerYear;
  if (frequency === "daily") periodsPerYear = 365;
  else if (frequency === "weekly") periodsPerYear = 52;
  else if (frequency === "monthly") periodsPerYear = 12;
  else periodsPerYear = 1;

  let total = initial;
  let invested = initial;
  let yearlyBalances = [total];
  let totalInvestedList = [invested];
  let achievedTarget = false;
  let achievedYear = 0;

  for (let year = 1; year <= years; year++) {
    for (let period = 0; period < periodsPerYear; period++) {
      total += recurring;
      invested += recurring;
      total *= 1 + (annualReturn / periodsPerYear);
    }
    yearlyBalances.push(total);
    totalInvestedList.push(invested);

    if (target && !achievedTarget && total >= target) {
      achievedTarget = true;
      achievedYear = year;
    }
  }

  // Calculate stats
  const finalBalance = total;
  const totalGain = finalBalance - invested;
  const averageAnnualReturn = (Math.pow(finalBalance / invested, 1 / years) - 1) * 100;

  let summaryHTML = `
    <strong>Final Balance:</strong> $${finalBalance.toFixed(2)}<br>
    <strong>Total Invested:</strong> $${invested.toFixed(2)}<br>
    <strong>Total Gain:</strong> $${totalGain.toFixed(2)}<br>
    <strong>Average Annual Return:</strong> ${averageAnnualReturn.toFixed(2)}%<br>
  `;
  if (achievedTarget) {
    summaryHTML += `<strong>Target of $${target} reached in year ${achievedYear}!</strong>`;
  }

  document.getElementById("summary").innerHTML = summaryHTML;

  updateChart(yearlyBalances);
  updateTable(yearlyBalances, totalInvestedList);
  setupDownload(yearlyBalances, totalInvestedList);
});

let chart;

function updateChart(data) {
  const ctx = document.getElementById('growthChart').getContext('2d');
  const labels = data.map((_, index) => `Year ${index}`);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Portfolio Value ($)',
        data: data,
        borderColor: 'rgba(46, 58, 89, 1)',
        backgroundColor: 'rgba(46, 58, 89, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `$${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
}

function updateTable(balances, investedList) {
  const tbody = document.getElementById("breakdownTable").querySelector("tbody");
  tbody.innerHTML = "";

  balances.forEach((balance, index) => {
    const row = document.createElement("tr");
    const yearCell = document.createElement("td");
    const balanceCell = document.createElement("td");
    const investedCell = document.createElement("td");

    yearCell.textContent = index;
    balanceCell.textContent = `$${balance.toFixed(2)}`;
    investedCell.textContent = `$${investedList[index].toFixed(2)}`;

    row.appendChild(yearCell);
    row.appendChild(balanceCell);
    row.appendChild(investedCell);
    tbody.appendChild(row);
  });
}

function setupDownload(balances, investedList) {
  const btn = document.getElementById("downloadBtn");
  btn.onclick = function() {
    let csv = "Year,Balance ($),Invested ($)\n";
    balances.forEach((balance, index) => {
      csv += `${index},${balance.toFixed(2)},${investedList[index].toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "investment_breakdown.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
}
