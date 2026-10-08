import { test, expect } from '@playwright/test';
import { Authentication } from '../pages/Authentication';
import { DutyChartCreation } from '../pages/DutychartCreation';

test.describe('Duty Chart Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and authenticate before each test
    await page.goto('/');

    const authPage = new Authentication(page);
    await authPage.loginWithPin();
    await authPage.login();

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('Verify Duty Chart is created successfully', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);

    await dutyChartPage.navigateToCalendar();

    // 2. Open Create Duty Chart Modal
    await dutyChartPage.openCreateModal();


    await dutyChartPage.selectOfficeInModal('Software and Security Wing');

    await dutyChartPage.fillChartName('test duty chart automation');

    // 5. Select Effective Date and End Date
    await dutyChartPage.selectEffectiveDate('22');
    await dutyChartPage.selectEndDate('25');

    // 6. Select Shift and Submit
    await dutyChartPage.selectShift(/Day Shift/i);
    await dutyChartPage.submitForm();

    // 7. Verify Duty Chart creation success notification
    await expect(page.getByText(/Duty Chart Created/i)).toBeVisible({ timeout: 10000 });
  });
});
