import { expect, test } from '@playwright/test';
import { openHomepage } from './helpers/homepage';

test.beforeEach(openHomepage);

test('benefits explain badminton-specific assistance without unsupported spreadsheet comparisons', async ({ page }) => {
  const benefits = page.getByRole('region', { name: 'Hjælp til arbejdet med klubbens hold' });
  await expect(benefits).toBeVisible();
  await expect(benefits.getByText(/ranglistedata fra badmintonplayer\.dk/)).toBeVisible();
  await expect(benefits.getByText(/rækkefølgen på holdet og mellem holdene i DH-turneringen/)).toBeVisible();
  await expect(benefits.getByText(/dækker ikke alle regler/)).toBeVisible();
  await expect(benefits.getByText(/Klubben og træneren har ansvaret/)).toBeVisible();
  await expect(benefits.getByRole('heading', { name: /tidligere placeringer/ })).toBeVisible();
  await expect(page.getByRole('main')).not.toContainText(/Excel|Microsoft 365|5 minutter|Flere timer|Automatisk backup|Sikre du overholder/);
});

test('coaches can explore Plan B while players see only the official lineup', async ({ page }) => {
  const scenarios = page.getByRole('region', { name: /Prøv en Plan B/ });
  await expect(scenarios).toBeVisible();
  await expect(scenarios.getByText(/spillernes placeringer på tværs af holdene i samme holdrunde/)).toBeVisible();
  await expect(scenarios.getByText(/Spillerne ser kun den officielle opstilling/)).toBeVisible();
  await expect(scenarios.getByText(/Udkast ændrer ikke den officielle opstilling og sender ikke beskeder til spillerne/)).toBeVisible();
  await expect(scenarios.getByText(/Hvert holds spilletid og spillested er de samme i alle scenarier/)).toBeVisible();
  await expect(scenarios.getByText(/Gør til officiel/)).toBeVisible();
  await expect(scenarios.getByRole('link', { name: /Læs om scenarier/ })).toHaveAttribute('href', 'https://app.nembadminton.dk/app/help/guides/arbejd-med-scenarier-i-en-holdrunde');
});

test('scenario and benefits content fits desktop and small phone widths', async ({ page }, testInfo) => {
  const widths = testInfo.project.name === 'mobile' ? [393, 320] : [1440, 1024];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const name of [/Prøv en Plan B/, /Hjælp til arbejdet med klubbens hold/]) {
      const section = page.getByRole('region', { name });
      await expect(section).toBeVisible();
      const bounds = await section.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await section.screenshot({ path: testInfo.outputPath(`${width}-${name.source.startsWith('Prøv') ? 'scenarios' : 'benefits'}.png`) });
    }
  }
});
