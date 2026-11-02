import { expect, test } from '@playwright/test';
import { openHomepage } from './helpers/homepage';

test('homepage setup blocks app, contact, analytics and new-tab requests before they reach the network', async ({ page, context, baseURL }) => {
  const escaped: string[] = [];
  // A last-resort sink makes even a broken isolation policy safe to test.
  // Later-registered homepage routes run first; nothing here contacts these hosts.
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === new URL(baseURL!).origin) return route.continue();
    escaped.push(route.request().url());
    return route.abort();
  });
  await openHomepage({ page, context, baseURL });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  const destinations = [
    'https://app.nembadminton.dk/app/sign-up',
    'https://app.loops.so/api/newsletter-form/cm95o85lr5f9t6go34sgcbb1f',
    'https://www.googletagmanager.com/gtag/js?id=isolation-test',
  ];
  const results = await page.evaluate(async urls => Promise.all(urls.map(async url => {
    try {
      await fetch(url, { method: 'POST', mode: 'no-cors', body: 'isolation-test' });
      return 'allowed';
    } catch {
      return 'blocked';
    }
  })), destinations);
  expect(results).toEqual(['blocked', 'blocked', 'blocked']);

  const privacyURL = 'https://app.nembadminton.dk/privatlivspolitik';
  const [popup, failedRequest] = await Promise.all([
    page.waitForEvent('popup'),
    context.waitForEvent('requestfailed', { predicate: request => request.url() === privacyURL }),
    page.getByRole('contentinfo').getByRole('link', { name: 'Privatlivspolitik', exact: true }).click(),
  ]);
  expect(failedRequest.failure()).toBeTruthy();
  await popup.close();
  expect(escaped).toEqual([]);
});
