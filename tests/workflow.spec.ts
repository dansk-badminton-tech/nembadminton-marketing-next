import { expect, test } from '@playwright/test';
import { openHomepage } from './helpers/homepage';

test.beforeEach(openHomepage);

test('explains the holdrunde journey and an actionable, honest demonstration', async ({ page }, testInfo) => {
  const workflow = page.getByRole('region', { name: 'Fra afbud til officiel opstilling' });
  await expect(workflow).toBeVisible();
  for (const name of ['Få overblik over afbud', 'Sæt og kontrollér holdene', 'Del den officielle opstilling']) {
    await expect(workflow.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await expect(workflow).toContainText(/spillere.*afbud.*klubbens link/i);
  await expect(workflow).toContainText('ranglistedata fra badmintonplayer.dk');
  await expect(workflow).toContainText(/flyt.*mellem holdene/i);
  await expect(workflow).toContainText(/officielle opstilling.*link/i);
  await expect(workflow).toContainText(/send.*besked/i);
  await expect(workflow).toContainText(/understøttede regler i DH-turneringen/);
  await expect(workflow).toContainText(/dækker ikke alle regler/);
  await expect(workflow).toContainText(/klubbens og trænerens ansvar/);
  const example = workflow.getByRole('figure', { name: 'Eksempler på Kategori og Niveau' });
  await expect(example).toContainText('Statisk eksempel med demonstrationsdata');
  const category = example.getByRole('article', { name: 'Kategori', exact: true });
  await expect(category).toContainText(/rækkefølgen.*samme hold/i);
  await expect(category).toContainText('800 HS-point');
  await expect(category).toContainText('1.200 HS-point');
  await expect(category).toContainText(/Demospiller A står for højt i HS i forhold til Demospiller B/);
  await expect(category).toContainText(/byt.*pladser.*Hold 1/i);
  const level = example.getByRole('article', { name: 'Niveau', exact: true });
  await expect(level).toContainText(/rækkefølgen mellem.*hold/i);
  await expect(level).toContainText('Hold 1');
  await expect(level).toContainText('Hold 2');
  await expect(level).toContainText(/højere på niveauranglisten/i);
  await expect(level).toContainText(/Demospiller D står på et for lavt rangeret hold i forhold til Demospiller C/);
  await expect(level).toContainText(/byt.*mellem Hold 1 og Hold 2/i);
  await expect(example).toContainText(/ud over den tilladte buffer/);
  await expect(example).not.toContainText('Hold 2 mangler spillere.');
  await expect(example).toContainText(/ikke en godkendelse/);
  await expect(example.getByRole('button')).toHaveCount(0);
  await expect(example.getByRole('textbox')).toHaveCount(0);
  await workflow.scrollIntoViewIfNeeded();
  await workflow.screenshot({ path: testInfo.outputPath('workflow.png') });
  await page.screenshot({ path: testInfo.outputPath('workflow-viewport.png') });
  await example.screenshot({ path: testInfo.outputPath('workflow-example.png') });
});

test('hero and navigation lead to the walkthrough below the fixed header', async ({ page }, testInfo) => {
  const action = page.getByRole('main').getByRole('link', { name: 'Se, hvordan det virker', exact: true });
  await expect(action).toHaveAttribute('href', '#workflow');
  await action.click();
  await expect(page).toHaveURL(/#workflow$/);
  const workflow = page.getByRole('region', { name: 'Fra afbud til officiel opstilling' });
  const headerBottom = await page.getByRole('banner').evaluate(element => element.getBoundingClientRect().bottom);
  await expect.poll(() => workflow.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);
  const mobile = testInfo.project.name === 'mobile';
  if (mobile) await page.getByRole('button', { name: 'Åbn menu', exact: true }).click();
  const navigation = page.getByRole('navigation', { name: mobile ? 'Mobilnavigation' : 'Hovednavigation', exact: true });
  await navigation.getByRole('link', { name: 'Sådan virker det', exact: true }).press('Enter');
  await expect(page).toHaveURL(/#workflow$/);
  if (mobile) {
    await expect(navigation).toBeHidden();
    await expect(workflow).toBeFocused();
  }
  await expect.poll(() => workflow.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);
  // The walkthrough must be the first section after the hero, not a buried FAQ link.
  const heroBottom = await page.locator('#home').evaluate(element => element.getBoundingClientRect().bottom);
  const workflowTop = await workflow.evaluate(element => element.getBoundingClientRect().top);
  expect(Math.abs(workflowTop - heroBottom)).toBeLessThanOrEqual(1);
});

test('uses a safe, described social illustration instead of the legacy app screenshot', async ({ page, request }) => {
  await expect(page.getByRole('img', { name: 'Holdopstilling i Nembadminton', exact: true })).toHaveCount(0);
  const preview = 'https://nembadminton.dk/holdrunde-workflow.png';
  for (const property of ['og:image', 'twitter:image']) {
    await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute('content', preview);
  }
  for (const property of ['og:image:alt', 'twitter:image:alt']) {
    await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute('content', /illustration.*afbud.*officiel opstilling/i);
  }
  const image = await request.get('/holdrunde-workflow.png');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/png');
  // Old UI must not remain in the published social asset directory either.
  expect((await request.get('/teamfight-planning-landing-2.png')).status()).toBe(404);
});

test('offers current procedural Help destinations without contacting the app', async ({ page }) => {
  const workflow = page.getByRole('region', { name: 'Fra afbud til officiel opstilling' });
  for (const [name, path] of [
    ['Læs om afbud', 'haandter-afbud-foer-og-under-en-holdrunde'],
    ['Læs om opstilling og tjek', 'lav-og-kontroller-den-officielle-holdopstilling'],
    ['Læs om deling', 'del-den-officielle-holdopstilling'],
    ['Læs om at sende besked', 'send-holdrunden-til-spillerne'],
  ]) {
    await expect(workflow.getByRole('link', { name, exact: true })).toHaveAttribute('href', `https://app.nembadminton.dk/app/help/guides/${path}`);
  }
  await expect(workflow.getByRole('link', { name: 'Se hele forløbet i Hjælp', exact: true })).toHaveAttribute('href', 'https://app.nembadminton.dk/app/help/guides');
});
