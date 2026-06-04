import { test, expect } from '@playwright/test';

// Test basic functionality in all browsers
test('should render home page correctly', async ({ page, browserName }) => {
  console.log(`Testing in ${browserName}`);
  
  // Navigate to the app
  await page.goto('http://localhost:5174');
  
  // Check if the page loads
  await expect(page).toHaveTitle('Finanalyzer');
  
  // Check if the main components are present
  await expect(page.locator('h1')).toContainText('Finanalyzer');
  await expect(page.locator('h2')).toContainText('Welcome');
  
  // Check if buttons are present
  await expect(page.locator('button')).toHaveCount(10);
  
  // Check if language selector works
  await expect(page.locator('button').filter({ hasText: 'English' })).toBeVisible();
  await expect(page.locator('button').filter({ hasText: '中文' })).toBeVisible();
});

// Test language switching functionality
test('should switch languages correctly', async ({ page, browserName }) => {
  console.log(`Testing language switching in ${browserName}`);
  
  // Navigate to the app
  await page.goto('http://localhost:5174');
  
  // Switch to Chinese
  await page.locator('button').filter({ hasText: '中文' }).click();
  
  // Check if language switched
  await expect(page.locator('h2')).toContainText('欢迎');
  
  // Switch back to English
  await page.locator('button').filter({ hasText: 'English' }).click();
  
  // Check if language switched back
  await expect(page.locator('h2')).toContainText('Welcome');
});

// Test form functionality
test('should handle form input correctly', async ({ page, browserName }) => {
  console.log(`Testing form input in ${browserName}`);
  
  // Navigate to the app
  await page.goto('http://localhost:5174');
  
  // Find the email input
  const emailInput = page.locator('input[type="email"]');
  
  // Enter email
  await emailInput.fill('test@example.com');
  
  // Check if value is entered
  await expect(emailInput).toHaveValue('test@example.com');
});

// Test button functionality
test('should handle button clicks correctly', async ({ page, browserName }) => {
  console.log(`Testing button clicks in ${browserName}`);
  
  // Navigate to the app
  await page.goto('http://localhost:5174');
  
  // Find the count button
  const countButton = page.locator('button').filter({ hasText: '增加计数' });
  
  // Click the button
  await countButton.click();
  
  // Check if count increased
  await expect(countButton).toContainText('增加计数: 1');
});
