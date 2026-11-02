import { expect, test } from '@playwright/test';
import { openHomepage } from './helpers/homepage';

test.beforeEach(openHomepage);

test('final signup follows the story and opens in the current tab', async ({ page, context }) => {
  const action = page.getByRole('region', { name: 'Klar til at sætte klubbens hold?' });
  await expect(action).toBeVisible();
  const order = (await page.locator('main h2').allTextContents()).map(text => text.trim());
  const faqHeading = (await page.locator('#faq').getByRole('heading', { level: 2 }).innerText()).trim();
  expect(order.indexOf(faqHeading)).toBeGreaterThanOrEqual(0);
  expect(order.indexOf('Lavet til badmintonens frivillige')).toBeGreaterThan(order.indexOf(faqHeading));
  expect(order.indexOf('Klar til at sætte klubbens hold?')).toBeGreaterThan(order.indexOf('Lavet til badmintonens frivillige'));
  expect(order.indexOf('Kontakt mig')).toBeGreaterThan(order.indexOf('Klar til at sætte klubbens hold?'));
  const signup = action.getByRole('link', { name: 'Opret gratis bruger', exact: true });
  await expect(signup).toHaveAttribute('href', 'https://app.nembadminton.dk/app/sign-up');
  expect([null, '', '_self']).toContain(await signup.getAttribute('target'));
  await page.route('https://app.nembadminton.dk/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Local signup stub</title>' }));
  await signup.click();
  await expect(page).toHaveURL('https://app.nembadminton.dk/app/sign-up');
  expect(context.pages()).toHaveLength(1);
});

test('project story names the founder and contributor without imported adoption proof', async ({ page }) => {
  const story = page.getByRole('region', { name: 'Lavet til badmintonens frivillige' });
  await expect(story).toBeVisible();
  await expect(story.getByText(/Daniel Fly Nygaard/)).toContainText(/grundlægger og udvikler/);
  await expect(story.getByText(/Jesper Kamp/)).toContainText(/har hjulpet.*DH-reglementet/);
  await expect(story.getByText(/Badminton Danmark har gjort data/)).toContainText(/ikke.*valideret.*beregninger/);
  await expect(page.getByRole('main')).not.toContainText(/1249|3137|118|Importeret|klubber, der stoler/);
  await expect(story.getByRole('link', { name: 'Læs om projektet' })).toHaveAttribute('href', 'https://app.nembadminton.dk/app/help/about');
});

test('contact has a labelled keyboard control and preserves contact and privacy access without submitting', async ({ page }) => {
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Kontakt', exact: true })).toHaveAttribute('href', '#contact');
  await expect(footer.getByRole('link', { name: 'Privatlivspolitik', exact: true })).toHaveAttribute('href', 'https://app.nembadminton.dk/privatlivspolitik');
  const email = page.getByRole('textbox', { name: 'Din e-mailadresse', exact: true });
  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveAttribute('autocomplete', 'email');
  await expect(page.locator('#contact form')).toHaveAttribute('action', 'https://app.loops.so/api/newsletter-form/cm95o85lr5f9t6go34sgcbb1f');
  await expect(page.getByRole('status', { includeHidden: true })).toContainText('Tak! Jeg kontakter dig hurtigst muligt.');
  await expect(page.getByRole('alert', { includeHidden: true })).toContainText('Der skete en fejl. Prøv igen om lidt.');
  await email.focus();
  expect(await email.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(page.locator('#contact').getByRole('button', { name: 'Kontakt mig', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});
