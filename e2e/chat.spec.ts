import { test, expect } from '@playwright/test';

test('chat streaming happy path', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Chat');

  await page.fill('textarea', 'Hello');
  await page.click('button[type="submit"]');

  await page.waitForResponse('/api/chat/stream');

  const chatMessages = await page.locator('.chat-message');
  await expect(chatMessages).toHaveCount(2); // User and AI message
});
