import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to sign up and reach the dashboard', async ({ page }) => {
    const username = `user_${Math.random().toString(36).substring(7)}`;
    
    // Go to signup page with longer timeout
    await page.goto('/signup', { timeout: 60000 });
    
    // Fill in signup form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    
    // Should see a welcome message
    await expect(page.locator('h1')).toContainText('Hey Test!');
  });
});
