import type { BrowserContext, Page } from '@playwright/test';

export async function openHomepage({ page, context, baseURL }: { page: Page; context: BrowserContext; baseURL: string | undefined }) {
  // Cover popup requests too; page-local destination stubs can still override this.
  await context.route('**/*', route =>
    new URL(route.request().url()).origin === new URL(baseURL!).origin
      ? route.continue()
      : route.abort(),
  );
  await page.goto('/');
}
