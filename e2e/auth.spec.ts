import { test, expect } from '@playwright/test';

test.describe('Authentication and Routing', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    // Attempt to access a protected route
    await page.goto('/dashboard');
    
    // Expect the middleware to redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('login page has expected form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check if the email and password inputs exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });
});
