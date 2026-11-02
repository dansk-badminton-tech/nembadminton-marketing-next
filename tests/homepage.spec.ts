import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, baseURL }) => {
  // Keep analytics and all other third parties out of this public-page seam.
  await page.route('**/*', route =>
    new URL(route.request().url()).origin === new URL(baseURL!).origin
      ? route.continue()
      : route.abort(),
  );
  await page.goto('/');
});

test('mobile menu supports pointer, keyboard, Escape and focus restoration', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile disclosure only');
  const toggle = page.getByRole('button', { name: 'Åbn menu', exact: true });
  const menu = page.getByRole('navigation', { name: 'Mobilnavigation', exact: true });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeHidden();
  await toggle.click();
  const close = page.getByRole('button', { name: 'Luk menu', exact: true });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  const controlledId = await close.getAttribute('aria-controls');
  expect(controlledId).toBeTruthy();
  await expect(menu).toHaveAttribute('id', controlledId!);
  await page.keyboard.press('Tab');
  await expect(menu.getByRole('link', { name: 'Hjem', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.press('Enter');
  await expect(menu).toBeVisible();
  await close.press('Space');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.press('Space');
  await close.click();
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
});

test('Danish search and sharing previews describe the same concrete purpose', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'da');
  await expect(page).toHaveTitle(/Nembadminton.*Sæt klubbens hold med hjælp til regeltjek/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://nembadminton.dk');
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[property="twitter:description"]']) {
    await expect(page.locator(selector)).toHaveAttribute('content', /ranglistedata fra badmintonplayer.dk/);
    await expect(page.locator(selector)).toHaveAttribute('content', /hjælp.*kontrollere.*del/);
  }
  for (const property of ['og:title', 'twitter:title']) {
    await expect(page.locator(`meta[property="${property}"]`)).toHaveAttribute('content', /Sæt klubbens hold med hjælp til regeltjek/);
  }
});

test('explains setting club teams with help checking rules', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sæt klubbens hold med hjælp til regeltjek');
  const main = page.locator('#home');
  await expect(main.getByText(/Brug ranglistedata fra badmintonplayer.dk/)).toBeVisible();
  await expect(main.getByText(/Få hjælp til at kontrollere opstillingerne, og del dem med spillerne/)).toBeVisible();
  await expect(main.getByText('Gratis og drevet på frivillig basis.')).toBeVisible();
  await expect(main.getByRole('link', { name: 'Opret gratis bruger', exact: true })).toBeVisible();
});

test('navigation offers clearly labelled same-tab app access', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Åbn menu', exact: true }).click();
  }
  const navigation = page.getByRole('navigation', { name: testInfo.project.name === 'mobile' ? 'Mobilnavigation' : 'Hovednavigation', exact: true });
  for (const [name, path] of [['Opret gratis bruger', 'sign-up'], ['Log ind', 'home-redirect']]) {
    const action = navigation.getByRole('link', { name, exact: true });
    await expect(action).toBeVisible();
    await expect(action).toHaveAttribute('href', `https://app.nembadminton.dk/app/${path}`);
  }
  const appLinks = page.locator('a[href*="/app/sign-up"], a[href*="/app/home-redirect"]');
  for (const link of await appLinks.all()) {
    await expect(link).toHaveAttribute('href', /^https:\/\/app\.nembadminton\.dk\/app\/(sign-up|home-redirect)$/);
    expect([null, '', '_self']).toContain(await link.getAttribute('target'));
    if (await link.isVisible()) {
      await expect(link).toHaveAccessibleName(/^(Opret gratis bruger|Log ind)$/);
    }
  }
});

test('app actions navigate the current tab without contacting the app', async ({ page, context }, testInfo) => {
  await page.route('https://app.nembadminton.dk/**', route => route.fulfill({ contentType: 'text/html', body: '<title>Local destination stub</title>' }));
  for (const name of ['Opret gratis bruger', 'Log ind']) {
    await page.goto('/');
    if (testInfo.project.name === 'mobile') {
      await page.getByRole('button', { name: 'Åbn menu', exact: true }).click();
    }
    const navigation = page.getByRole('navigation', { name: testInfo.project.name === 'mobile' ? 'Mobilnavigation' : 'Hovednavigation', exact: true });
    await navigation.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(`https://app.nembadminton.dk/app/${name === 'Log ind' ? 'home-redirect' : 'sign-up'}`);
    expect(context.pages()).toHaveLength(1);
  }
});

test('section links work below the fixed header and keep contact and privacy available', async ({ page }, testInfo) => {
  const mobile = testInfo.project.name === 'mobile';
  const navigation = page.getByRole('navigation', { name: mobile ? 'Mobilnavigation' : 'Hovednavigation', exact: true });
  if (mobile) await page.getByRole('button', { name: 'Åbn menu', exact: true }).click();
  const links = await navigation.locator('a[href^="#"]').evaluateAll(anchors => anchors.map(anchor => ({
    href: anchor.getAttribute('href')!, name: anchor.textContent!.trim(),
  })));
  expect(links.length).toBeGreaterThanOrEqual(5);
  for (const { href, name } of links) {
    if (mobile && !(await navigation.isVisible())) {
      await page.getByRole('button', { name: 'Åbn menu', exact: true }).click();
    }
    const link = navigation.getByRole('link', { name, exact: true });
    if (href === '#faq') await link.press('Enter');
    else await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    const destination = page.locator(href);
    await expect(destination).toBeVisible();
    if (mobile) {
      await expect(navigation).toBeHidden();
      await expect(page.getByRole('button', { name: 'Åbn menu', exact: true })).toHaveAttribute('aria-expanded', 'false');
      await expect(destination).toBeFocused();
    }
    // Home begins behind the header by design, with padded hero content.
    if (href !== '#home') {
      const headerBottom = await page.getByRole('banner').evaluate(header => header.getBoundingClientRect().bottom);
      await expect.poll(() => destination.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(headerBottom);
    }
  }
  await expect(page.getByRole('contentinfo').getByRole('link', { name: /privatliv/i })).toHaveAttribute('href', 'https://app.nembadminton.dk/privatlivspolitik');
  await expect(page.locator('#contact')).toBeVisible();
});

test('page fits its viewport and keyboard navigation has visible focus', async ({ page }, testInfo) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: testInfo.outputPath('homepage.png') });
  await page.keyboard.press('Tab');
  const brand = page.getByRole('navigation', { name: 'Hovednavigation', exact: true }).getByRole('link', { name: 'Nembadminton', exact: true });
  await expect(brand).toBeFocused();
  expect(await brand.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none');
  if (testInfo.project.name === 'mobile') {
    await page.keyboard.press('Tab');
    const toggle = page.getByRole('button', { name: 'Åbn menu', exact: true });
    await expect(toggle).toBeFocused();
    await toggle.press('Enter');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
    const login = page.getByRole('navigation', { name: 'Mobilnavigation', exact: true }).getByRole('link', { name: 'Log ind', exact: true });
    const bounds = await login.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({ path: testInfo.outputPath('mobile-menu.png') });
  }
});

test('navigation fits at the desktop breakpoint and on small phones', async ({ page }, testInfo) => {
  const width = testInfo.project.name === 'mobile' ? 320 : 1024;
  await page.setViewportSize({ width, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  if (testInfo.project.name === 'desktop') {
    const login = page.getByRole('navigation', { name: 'Hovednavigation', exact: true }).getByRole('link', { name: 'Log ind', exact: true });
    const bounds = await login.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }
});
