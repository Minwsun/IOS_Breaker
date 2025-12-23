// ========= Supported Apps Mapping ========= //
// Add app identifier (from User-Agent) -> [entitlement, subscription_id]
const mapping = {
  // Original apps
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
  'Locket': ['Gold'],

  // Photo/Video Editors
  'Canva': ['pro', 'canva_pro_yearly'],
  'CapCut': ['pro', 'capcut_pro'],
  'InShot': ['pro', 'inshot_pro_yearly'],
  'VN': ['pro', 'vn_pro_yearly'],
  'Mojo': ['pro', 'mojo_pro'],
  'Unfold': ['pro', 'unfold_pro'],
  'PREQUEL': ['pro', 'prequel_pro'],
  'Facetune': ['pro', 'facetune_pro'],

  // Productivity
  'Notion': ['pro', 'notion_pro'],
  'Craft': ['pro', 'craft_pro'],
  'Bear': ['pro', 'bear_pro'],
  'GoodNotes': ['pro', 'goodnotes_pro'],

  // Health & Wellness
  'Calm': ['premium', 'calm_premium'],
  'Headspace': ['plus', 'headspace_plus'],
  'Flo': ['premium', 'flo_premium'],
  'Clue': ['plus', 'clue_plus'],

  // Utilities
  'Scanner': ['pro', 'scanner_pro'],
  'PDF': ['pro', 'pdf_pro'],
  '1Password': ['premium', '1password_premium'],

  // Social
  'Splice': ['pro', 'splice_pro'],
  'VITA': ['pro', 'vita_pro']
};

// ========= Dynamic Helper Functions ========= //
// Generate random alphanumeric string for transaction IDs
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

  // Purchase date: random 1-30 days ago
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const purchaseDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  // Expiry date: 1 year from now
  const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  // Original purchase date: slightly before purchase date
  const originalPurchaseDate = new Date(purchaseDate.getTime() - 1000);

  return {
    purchase_date: purchaseDate.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    expires_date: expiryDate.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    original_purchase_date: originalPurchaseDate.toISOString().replace(/\.\d{3}Z$/, 'Z')
  };
}

// =========   Enhanced by @duyvinh09 ========= // 
var ua = $request.headers["User-Agent"] || $request.headers["user-agent"],
  obj = JSON.parse($response.body);

// Get dynamic values
const dates = getDynamicDates();
const transactionId = generateRandomId(32);
const originalTransactionId = generateRandomId(32);

obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

var duyvinh09 = {
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  period_type: "normal",
  expires_date: dates.expires_date,
  grace_period_expires_date: null,
  unsubscribe_detected_at: null,
  original_purchase_date: dates.original_purchase_date,
  purchase_date: dates.purchase_date,
  store: "app_store",
  transaction_id: transactionId,
  original_transaction_id: originalTransactionId
},
  locketGold = {
    grace_period_expires_date: null,
    purchase_date: dates.purchase_date,
    product_identifier: "com.duyvinh09.premium.yearly",
    expires_date: dates.expires_date,
    original_purchase_date: dates.original_purchase_date
  };

const match = Object.keys(mapping).find(e => ua.includes(e));
if (match) {
  let [e, s] = mapping[match];
  s ? (locketGold.product_identifier = s, obj.subscriber.subscriptions[s] = duyvinh09) : obj.subscriber.subscriptions["com.duyvinh09.premium.yearly"] = duyvinh09, obj.subscriber.entitlements[e] = locketGold
} else obj.subscriber.subscriptions["com.duyvinh09.premium.yearly"] = duyvinh09, obj.subscriber.entitlements.pro = locketGold;

$done({
  body: JSON.stringify(obj)
});
