import { test, expect } from '@playwright/test';
import { Authentication } from '../pages/Authentication';

test.describe('Office Duty Schedule Configuration', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate and authenticate before each test
        await page.goto('/');

        const authPage = new Authentication(page);
        await authPage.loginWithPin();
        await authPage.login();

        await page.waitForURL('**/dashboard', { timeout: 10000 });
        await expect(page).toHaveURL('/dashboard');
    });

    test('TC-028-FR-OSCH-01 Verify creating an Office Duty Schedule using an existing Schedule Template', async ({ page }) => {
        // 1. Navigate to Office Duty Schedule
        await page.getByRole('link', { name: 'Office Duty Schedule' }).click();

        // 2. Open Schedule Name dropdown
        const scheduleDropdown = page
            .locator('div', { hasText: 'Schedule Name' })
            .locator('button[role="combobox"]')
            .first()
            .or(page.locator('main').locator('button[role="combobox"]').first());

        await scheduleDropdown.click();

        // 3. Select 'Day Shift' template from the options
        const templateOption = page.getByRole('option', { name: 'Day Shift', exact: true })
            .or(page.getByRole('option', { name: /Day Shift/i }))
            .first();

        await templateOption.click();

        // 4. Click 'Create Duty Schedule'
        await page.getByRole('button', { name: 'Create Duty Schedule' }).click();

        // 5. Verify Duty Schedule creation feedback (Toast notification or validation status)
        await expect(
            page.getByText(/Duty Schedule Created/i)
        ).toBeVisible({ timeout: 10000 });

        // remove the Day Shift
    });

    test('TC-029-FR-OSCH-01 Verify inline creation of an Office Duty Schedule via "Add New Schedule" toggle', async ({ page }) => {
        await page.getByRole('link', { name: 'Office Duty Schedule' }).click();
        await page.getByRole('button', { name: '+ Add New Schedule' }).click();

        // await expect(page.getByRole('textbox', { name: 'Enter custom schedule name' })).toBeVisible();
        await page.getByRole('textbox', { name: 'Enter custom schedule name' }).fill('Custom Schedule');
        await page.getByRole('textbox', { name: 'e.g. MS' }).fill('CS');
        await page.getByRole('combobox').filter({ hasText: 'Select Type' }).click();
        await page.getByRole('option', { name: 'Regular', exact: true }).click();

        async function pickFromCombobox(index: number, value: string) {
            await page.getByRole('combobox').nth(index).click();
            await page.getByRole('option', { name: value, exact: true }).click();
        }

        // Start time
        await pickFromCombobox(2, '01');
        await pickFromCombobox(3, '00');
        await pickFromCombobox(4, 'AM');

        // End time
        await pickFromCombobox(5, '04');
        await pickFromCombobox(6, '00');
        await pickFromCombobox(7, 'PM');

        await page.getByRole('button', { name: 'Create Duty Schedule' }).click();
        await expect(
            page.getByText(/Duty Schedule Created/i)
        ).toBeVisible({ timeout: 10000 });
    });
});
