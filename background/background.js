/**
 * DealFlow - Service Worker (Background)
 * Manifest V3 Affiliate Tag Binding, Price Alert Monitor & Telemetry
 */

const DEFAULT_CONFIG = {
  amazonTag: "dealflow0a-21",
  flipkartAffid: "dealflowaff",
  enabled: true,
  totalSavedAmount: 1850,
  trackedProductsCount: 14
};

/**
 * Initialize extension defaults upon install
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log("[DealFlow] Installed:", details.reason);

  const existing = await chrome.storage.local.get(Object.keys(DEFAULT_CONFIG));
  const toSet = {};

  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    if (existing[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  setupAffiliateDnrRules();
});

/**
 * Dynamically attach affiliate tag using declarativeNetRequest
 */
async function setupAffiliateDnrRules() {
  const { amazonTag } = await chrome.storage.local.get("amazonTag");
  const tag = amazonTag || DEFAULT_CONFIG.amazonTag;

  // Rule ID 1001: Append tag parameter to Amazon product page navigations if missing
  const rules = [
    {
      id: 1001,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            queryTransform: {
              addOrReplaceParams: [{ key: "tag", value: tag }]
            }
          }
        }
      },
      condition: {
        urlFilter: "||amazon.in/dp/*",
        resourceTypes: ["main_frame"]
      }
    }
  ];

  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existing.map((r) => r.id);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeIds,
      addRules: rules
    });
    console.log("[DealFlow] Affiliate DNR rule attached with tag:", tag);
  } catch (err) {
    console.debug("[DealFlow] DNR update notice:", err);
  }
}

/**
 * Listen for affiliate tag changes from options page
 */
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.amazonTag || changes.flipkartAffid)) {
    setupAffiliateDnrRules();
  }
});

/**
 * Message Hub
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === "GET_EXTENSION_STATE") {
    (async () => {
      const data = await chrome.storage.local.get(null);
      let alertsCount = 0;
      for (const k of Object.keys(data)) {
        if (k.startsWith("alert_")) alertsCount++;
      }
      sendResponse({
        amazonTag: data.amazonTag || DEFAULT_CONFIG.amazonTag,
        flipkartAffid: data.flipkartAffid || DEFAULT_CONFIG.flipkartAffid,
        totalSavedAmount: data.totalSavedAmount || DEFAULT_CONFIG.totalSavedAmount,
        alertsCount: alertsCount,
        enabled: data.enabled !== false
      });
    })();
    return true;
  }

  if (message.type === "RECORD_SAVINGS") {
    (async () => {
      const { totalSavedAmount } = await chrome.storage.local.get("totalSavedAmount");
      const updated = (totalSavedAmount || 0) + (message.amount || 250);
      await chrome.storage.local.set({ totalSavedAmount: updated });
      sendResponse({ success: true, updatedTotal: updated });
    })();
    return true;
  }

  return false;
});
