/***********************************************
> Code by duyvinh09
> Enhanced with dynamic data generation
***********************************************/
var request = $request;

// ========= Dynamic Helper Functions ========= //
// Generate random UUID v4 format
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16).toUpperCase();
  });
}

// Generate random alphanumeric string
function generateRandomId(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate dynamic dates
function getDynamicDates() {
  const now = new Date();

  // First seen: random 30-90 days ago
  const firstSeenDaysAgo = Math.floor(Math.random() * 60) + 30;
  const firstSeen = new Date(now.getTime() - firstSeenDaysAgo * 24 * 60 * 60 * 1000);

  // Purchase date: random 1-15 days ago
  const purchaseDaysAgo = Math.floor(Math.random() * 15) + 1;
  const purchaseDate = new Date(now.getTime() - purchaseDaysAgo * 24 * 60 * 60 * 1000);

  // Original purchase date: slightly before purchase date
  const originalPurchaseDate = new Date(purchaseDate.getTime() - 1000);

  // Expiry date: 1 year from now
  const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Last seen: today or yesterday
  const lastSeenDaysAgo = Math.floor(Math.random() * 2);
  const lastSeen = new Date(now.getTime() - lastSeenDaysAgo * 24 * 60 * 60 * 1000);

  const formatDate = (date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

  return {
    first_seen: formatDate(firstSeen),
    last_seen: formatDate(lastSeen),
    purchase_date: formatDate(purchaseDate),
    original_purchase_date: formatDate(originalPurchaseDate),
    expires_date: formatDate(expiryDate),
    request_date: formatDate(now),
    request_date_ms: now.getTime()
  };
}

const options = {
  url: "https://api.revenuecat.com/v1/product_entitlement_mapping",
  headers: {
    'Authorization': request.headers["authorization"],
    'X-Platform': 'iOS',
    'User-Agent': request.headers["user-agent"]
  }
}

$httpClient.get(options, function (error, newResponse, data) {

  const ent = JSON.parse(data);
  const dates = getDynamicDates();
  const appUserId = generateUUID();

  let jsonToUpdate = {
    "request_date_ms": dates.request_date_ms,
    "request_date": dates.request_date,
    "subscriber": {
      "entitlement": {},
      "first_seen": dates.first_seen,
      "original_application_version": String(Math.floor(Math.random() * 9000) + 1000),
      "last_seen": dates.last_seen,
      "other_purchases": {},
      "management_url": null,
      "subscriptions": {},
      "entitlements": {},
      "original_purchase_date": dates.original_purchase_date,
      "original_app_user_id": appUserId,
      "non_subscriptions": {}
    }
  };

  const productEntitlementMapping = ent.product_entitlement_mapping

  for (const [entitlementId, productInfo] of Object.entries(productEntitlementMapping)) {
    const productIdentifier = productInfo.product_identifier;
    const entitlements = productInfo.entitlements;

    // Generate unique transaction IDs for each subscription
    const transactionId = generateRandomId(32);
    const originalTransactionId = generateRandomId(32);

    for (const entitlement of entitlements) {
      jsonToUpdate.subscriber.entitlements[entitlement] = {
        "purchase_date": dates.purchase_date,
        "original_purchase_date": dates.original_purchase_date,
        "expires_date": dates.expires_date,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "product_identifier": productIdentifier,
        "transaction_id": transactionId,
        "original_transaction_id": originalTransactionId
      };

      // Add product identifier to subscriptions
      jsonToUpdate.subscriber.subscriptions[productIdentifier] = {
        "expires_date": dates.expires_date,
        "original_purchase_date": dates.original_purchase_date,
        "purchase_date": dates.purchase_date,
        "is_sandbox": false,
        "ownership_type": "PURCHASED",
        "store": "app_store",
        "transaction_id": transactionId,
        "original_transaction_id": originalTransactionId
      };
    }
  }

  body = JSON.stringify(jsonToUpdate);
  $done({ body });

});