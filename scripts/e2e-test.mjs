import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/aliffaddly/.gemini/antigravity/brain/78d00908-bce9-4fff-aeea-01132c01de76';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runTests() {
  console.log('🚀 Starting Jastipyudin Revised End-to-End Automated Browser Testing...');
  const browser = await chromium.launch({ headless: true });

  // 1. DESKTOP VIEWPORT TESTING (1280 x 850)
  console.log('\n--- 1. DESKTOP TESTING: CUSTOMER SESSION & TOTAL CART CHECKOUT ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 2,
  });
  const page = await desktopContext.newPage();

  // Load Homepage
  console.log('Visiting http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_desktop_home_revised.png'), fullPage: false });
  console.log('✓ Captured 01_desktop_home_revised.png');

  // Test Auth Modal (Login/Register)
  console.log('Testing User Session Auth Modal...');
  const profileBtn = await page.locator('header button:has-text("Alya")').first();
  await profileBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_desktop_user_menu.png') });
  console.log('✓ Captured 02_desktop_user_menu.png');

  // Click outside to close dropdown
  await page.locator('h1').first().click();
  await page.waitForTimeout(300);

  // Add items to personal cart
  console.log('Adding multiple items to Customer Personal Cart...');
  const firstAddBtn = await page.locator('button:has-text("Titip Ini")').first();
  await firstAddBtn.click();
  await page.waitForTimeout(600);

  // Close cart drawer & add second item
  const closeCartBtn = await page.locator('button[aria-label="Tutup Keranjang"]').first();
  await closeCartBtn.click();
  await page.waitForTimeout(400);

  const secondAddBtn = await page.locator('button:has-text("Titip Ini")').nth(1);
  await secondAddBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_desktop_cart_multi_items.png') });
  console.log('✓ Captured 03_desktop_cart_multi_items.png');

  // Test Checkout Modal (Revised: No Domestic Courier, Total Cart Billing, Grand Total Payment)
  console.log('Opening Revised Checkout Modal...');
  const checkoutBtn = await page.locator('button:has-text("Lanjut ke Pembayaran")').first();
  await checkoutBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_desktop_checkout_total_cart.png') });
  console.log('✓ Captured 04_desktop_checkout_total_cart.png');

  // Confirm Payment
  console.log('Confirming Full Cart Payment (Grand Total)...');
  const payBtn = await page.locator('button:has-text("Bayar Total Tagihan")').first();
  await payBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_desktop_order_success.png') });
  console.log('✓ Captured 05_desktop_order_success.png');

  // View Order Tracking
  console.log('Viewing Live Bangkok Order Tracking...');
  const trackingBtn = await page.locator('button:has-text("Buka Live Tracking Pesanan")').first();
  await trackingBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_desktop_order_tracking.png') });
  console.log('✓ Captured 06_desktop_order_tracking.png');

  // Switch to Shopper Admin Dashboard
  console.log('Testing Admin Switch & Ground Control Dashboard...');
  const adminSwitchBtn = await page.locator('button:has-text("Shopper Admin")').first();
  await adminSwitchBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_desktop_admin_dashboard_revised.png') });
  console.log('✓ Captured 07_desktop_admin_dashboard_revised.png');

  await desktopContext.close();

  // 2. MOBILE PWA TESTING (iPhone 14)
  console.log('\n--- 2. MOBILE PWA VIEWPORT TESTING (iPhone 14) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  console.log('Visiting http://localhost:3000 on Mobile...');
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_mobile_home_revised.png') });
  console.log('✓ Captured 08_mobile_home_revised.png');

  // Mobile Bangkok Stores Tab via Bottom Nav
  console.log('Testing Mobile Mall & Pasar Tab...');
  const mobileStoreBtn = await mobilePage.locator('div.fixed.bottom-0 button:has-text("Mall & Pasar")');
  await mobileStoreBtn.click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_mobile_stores_tab.png') });
  console.log('✓ Captured 09_mobile_stores_tab.png');

  // Mobile Order Tracking Tab via Bottom Nav
  console.log('Testing Mobile Order Tracking...');
  const mobileTrackingBtn = await mobilePage.locator('div.fixed.bottom-0 button:has-text("Lacak")');
  await mobileTrackingBtn.click();
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_mobile_tracking_tab.png') });
  console.log('✓ Captured 10_mobile_tracking_tab.png');

  await mobileContext.close();
  await browser.close();

  console.log('\n🎉 ALL REVISED BROWSER TESTS PASSED! Screenshots saved.');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
