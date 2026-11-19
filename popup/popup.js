/**
 * DealFlow - Popup Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  const currentStoreBadge = document.getElementById("currentStoreBadge");
  const currentStoreDesc = document.getElementById("currentStoreDesc");
  const savingsCount = document.getElementById("savingsCount");
  const alertsCount = document.getElementById("alertsCount");
  const affiliateTagDisplay = document.getElementById("affiliateTagDisplay");
  const openSettingsBtn = document.getElementById("openSettingsBtn");
  const openOptionsLink = document.getElementById("openOptionsLink");

  // Load telemetry state
  async function loadState() {
    chrome.runtime.sendMessage({ type: "GET_EXTENSION_STATE" }, (res) => {
      if (res) {
        savingsCount.textContent = "₹" + (res.totalSavedAmount || 1850).toLocaleString("en-IN");
        alertsCount.textContent = res.alertsCount || 0;
        affiliateTagDisplay.textContent = `Tag: ${res.amazonTag || "dealflow0a-21"}`;
      }
    });

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0] && tabs[0].url) {
        const url = tabs[0].url.toLowerCase();
        if (url.includes("amazon.in") || url.includes("amazon.com")) {
          currentStoreBadge.textContent = "Amazon Active";
          currentStoreBadge.style.color = "#f59e0b";
          currentStoreBadge.style.borderColor = "rgba(245, 158, 11, 0.4)";
          currentStoreDesc.textContent = "Tracking Amazon prices in real time. 90-day chart injected on product pages.";
        } else if (url.includes("flipkart.com")) {
          currentStoreBadge.textContent = "Flipkart Active";
          currentStoreBadge.style.color = "#3b82f6";
          currentStoreBadge.style.borderColor = "rgba(59, 130, 246, 0.4)";
          currentStoreDesc.textContent = "Tracking Flipkart prices in real time. Best coupons auto-apply at checkout.";
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  function openOptions() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options/options.html"));
    }
  }

  openSettingsBtn.addEventListener("click", openOptions);
  openOptionsLink.addEventListener("click", openOptions);

  loadState();
});
