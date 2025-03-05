import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json';

test.beforeEach(async ({ page, request }) => {
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto('https://conduit.bondaracademy.com');
});

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = 'This is a mock test title';
    responseBody.articles[0].description = 'This is a mock test description';

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText('Global Feed').click();

  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText(
    'This is a mock test title',
  );
  await expect(page.locator('app-article-list p').first()).toContainText(
    'This is a mock test description',
  );
});

test('delete article', async ({ page, request }) => {
 await request.post(
    'https://conduit-api.bondaracademy.com/api/users/login',
    {
      data: {
        user: {
          email: 'alisson@test.com',
          password: 'QDE2eqg-ghd@zmk!hyf',
        },
      },
    },
  );

  const uuid = crypto.randomUUID();
  const articleResponse = await request.post(
    'https://conduit-api.bondaracademy.com/api/articles',
    {
      data: {
        article: {
          title: `test title ${uuid}`,
          description: `test description ${uuid}`,
          body: 'testy',
          tagList: ['testy'],
        },
      },
    },
  );

  expect(articleResponse.status()).toEqual(201);

  await page.getByText('Global Feed').click();
  await page.getByText(`test title ${uuid}`).click();
  await page.getByRole('button', { name: 'Delete Article' }).first().click();
  await page.getByText('Global Feed').click();
});
