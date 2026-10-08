import { test, expect } from '@playwright/test';
import { Authentication } from '../pages/Authentication';

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        const authPage = new Authentication(page);

        await authPage.loginWithPin();

        await authPage.login();
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await expect(page).toHaveURL('/dashboard');
    });

    test('TC-015-DASH Verify "My Current Duty" summary card displays active assignment details and status accurately ', async ({ page }) => {
        await page.getByText('My Current DutyNo Active').click();
        await expect(page.getByText('No Active Duty', { exact: true })).toBeVisible();
        await expect(page.getByText('Not scheduled currently')).toBeVisible();
        await expect(page.getByText('Free')).toBeVisible();
    });     
});
