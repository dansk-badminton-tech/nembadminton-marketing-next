import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  await page.route('**/*', route =>
    new URL(route.request().url()).origin === new URL(baseURL!).origin
      ? route.continue()
      : route.abort(),
  );
  await page.goto('/');
});

test('Danish FAQ controls expose their answers and toggle by keyboard and pointer', async ({ page }, testInfo) => {
  const faq = page.locator('#faq');
  for (const question of await faq.getByRole('button').all()) {
    const name = (await question.innerText()).trim();
    const answer = faq.getByRole('region', { name, exact: true, includeHidden: true });
    await expect(question).toHaveAttribute('aria-expanded', 'false');
    await expect(answer).toBeHidden();
    const answerId = await question.getAttribute('aria-controls');
    expect(answerId).toBeTruthy();
    await expect(answer).toHaveAttribute('id', answerId!);
    await question.focus();
    await expect(question).toBeFocused();
    expect(await question.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
    await question.press('Enter');
    await expect(question).toHaveAttribute('aria-expanded', 'true');
    await expect(answer).toBeVisible();
    await question.press('Space');
    await expect(question).toHaveAttribute('aria-expanded', 'false');
    await expect(answer).toBeHidden();
    await question.click();
    await expect(question).toHaveAttribute('aria-expanded', 'true');
    await expect(answer).toBeVisible();
  }
  await faq.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  await faq.screenshot({ path: testInfo.outputPath('faq-expanded.png') });
});

test('six adoption answers explain the offer, setup, data and checking responsibility', async ({ page }) => {
  const faq = page.locator('#faq');
  await expect(faq.getByRole('heading', { name: 'Ofte stillede spørgsmål' })).toBeVisible();
  const questions = faq.getByRole('button');
  await expect(questions).toHaveCount(6);
  for (const question of await questions.all()) await question.click();

  await expect(faq.getByText(/gratis at bruge.*frivillig basis/)).toBeVisible();
  await expect(faq.getByText(/trænere og frivillige/)).toBeVisible();
  await expect(faq.getByText(/regionale.*egne regler/)).toBeVisible();
  await expect(faq.getByText(/Opret en bruger.*klubhus.*holdrunde/)).toBeVisible();
  await expect(faq.getByText(/spillere og ranglistepoint fra badmintonplayer.dk/)).toBeVisible();
  await expect(faq.getByText(/Badminton Danmark har gjort data.*tilgængelige/)).toBeVisible();
  await expect(faq.getByText(/Dataadgangen.*ikke.*godkendt.*beregninger/)).toBeVisible();
  await expect(faq.getByText(/understøttede regler i DH-turneringen/)).toBeVisible();
  await expect(faq.getByText(/OK.*ikke en garanti.*alle.*regler/)).toBeVisible();
  await expect(faq.getByText(/klubbens og trænerens ansvar/)).toBeVisible();

  const helpLinks = [
    ['Kom i gang med en holdrunde', 'guides/opret-og-klargoer-en-holdrunde'],
    ['Læs om projektet og dataadgangen', 'about'],
    ['Læs om kontroller og begrænsninger', 'guides/lav-og-kontroller-den-officielle-holdopstilling'],
    ['Find svar og fejlhjælp', 'faq'],
    ['se alle vejledninger', 'guides'],
  ];
  for (const [name, path] of helpLinks) {
    const link = faq.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', `https://app.nembadminton.dk/app/help/${path}`);
    await expect(link).toHaveCSS('text-decoration-line', 'underline');
  }
  await expect(faq).not.toContainText(/2024\/2025|vil altid være|alle nødvendige tilladelser|export|buffer 50|buffer 100/i);
});
