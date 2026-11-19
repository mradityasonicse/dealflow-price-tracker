/**
 * DealFlow - Options & Monetization Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const amazonTagInput = document.getElementById("amazonTagInput");
  const flipkartAffidInput = document.getElementById("flipkartAffidInput");
  const affiliateForm = document.getElementById("affiliateForm");
  const saveSuccessText = document.getElementById("saveSuccessText");
  const alertsUl = document.getElementById("alertsUl");
  const alertCountBadge = document.getElementById("alertCountBadge");

  async function loadData() {
    const data = await chrome.storage.local.get(null);
    amazonTagInput.value = data.amazonTag || "dealflow0a-21";
    flipkartAffidInput.value = data.flipkartAffid || "dealflowaff";

    // Load Price Alerts
    const alerts = [];
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith("alert_") && v && v.productId) {
        alerts.push(v);
      }
    }

    alertCountBadge.textContent = `${alerts.length} Monitored`;
    alertsUl.innerHTML = "";

    if (alerts.length === 0) {
      alertsUl.innerHTML = '<li class="empty-state">No price drop alerts set yet. Click "Set Price Drop Alert" on any Amazon or Flipkart product page!</li>';
      return;
    }

    alerts.forEach((alert) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.innerHTML = `<strong>${alert.title || alert.productId}</strong> — Alert at: <span style="color:#10b981;">₹${alert.targetPrice}</span>`;
      li.appendChild(span);

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", async () => {
        await chrome.storage.local.remove(`alert_${alert.productId}`);
        loadData();
      });
      li.appendChild(delBtn);

      alertsUl.appendChild(li);
    });
  }

  affiliateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const amazonTag = amazonTagInput.value.trim();
    const flipkartAffid = flipkartAffidInput.value.trim();

    await chrome.storage.local.set({ amazonTag, flipkartAffid });

    saveSuccessText.style.display = "inline";
    setTimeout(() => {
      saveSuccessText.style.display = "none";
    }, 2500);
  });

  loadData();
});
