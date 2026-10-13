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
    await dutyChartPage.selectShift(/Evening Shift/i);
    await dutyChartPage.submitForm();
    await dutyChartPage.confirmCreation();

    // 7. Verify Duty Chart creation success notification
    await expect(page.getByText(/Duty Chart Created/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-033-FR-OSCH-04 Verify Duty Chart creation is blocked when selecting an office with zero configured schedules', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('NT Sundhara');
    await dutyChartPage.fillChartName('Duty chart with no Schedules');
    await dutyChartPage.selectEffectiveDate('22');
    await dutyChartPage.selectEndDate('25');
    await dutyChartPage.submitForm();
    await expect(page.getByText(/At least one shift must be selected/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-034-FR-OSCH-04 Verify Duty Chart creation is blocked when Duty chart Name is Left empty', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('NT Sundhara');
    await dutyChartPage.fillChartName('');
    await dutyChartPage.submitForm();
    await expect(page.getByText(/Duty Chart name is required/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-035-FR-OSCH-04 Verify Duty Chart creation is blocked when End Date is omitted', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('Software and Security Wing');
    await dutyChartPage.fillChartName('Duty chart without End Date');
    await dutyChartPage.selectEffectiveDate('22');
    // End Date is intentionally omitted
    await dutyChartPage.selectShift(/Evening Shift/i);
    await dutyChartPage.submitForm();
    await expect(page.getByText(/End date is required/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-036-FR-OSCH-04 Verify Duty Chart creation is blocked when Effective Date is omitted', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('Software and Security Wing');
    await dutyChartPage.fillChartName('Duty chart without Effective Date');
    // Effective Date is intentionally omitted
    await dutyChartPage.selectEndDate('25');
    await dutyChartPage.selectShift(/Evening Shift/i);
    await dutyChartPage.submitForm();
    await expect(page.getByText(/Effective date is required/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-037-FR-OSCH-04 Verify Duty Chart creation is blocked when both Effective Date and End Date are omitted', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('Software and Security Wing');
    await dutyChartPage.fillChartName('Duty chart without both dates');
    // Both Effective Date and End Date are intentionally omitted
    await dutyChartPage.selectShift(/Evening Shift/i);
    await dutyChartPage.submitForm();
    await expect(page.getByText(/Effective date is required/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-038-FR-OSCH-04 Verify duty chart creation allows selecting and assigning multiple shifts simultaneously', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('Software and Security Wing');
    await dutyChartPage.fillChartName('Duty chart with multiple shifts');
    await dutyChartPage.selectEffectiveDate('22');
    await dutyChartPage.selectEndDate('25');

    // Select multiple shifts simultaneously
    await dutyChartPage.selectShift(/Holiday Duty/i);
    await dutyChartPage.selectShift(/Evening Shift/i);

    await dutyChartPage.submitForm();
    await dutyChartPage.confirmCreation();

    // Verify Duty Chart creation success notification
    await expect(page.getByText(/Duty Chart Created/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-042-FR-CHT-03 Verify date validation error when End Date precedes Effective Date in Duty Chart', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('Software and Security Wing');
    await dutyChartPage.fillChartName('Jestha Rotation');

    // Set Effective Date to a later day than End Date (end precedes effective)
    await dutyChartPage.selectEffectiveDate('25');
    await dutyChartPage.selectEndDate('10');

    await dutyChartPage.selectShift(/Evening Shift/i);
    await dutyChartPage.submitForm();

    // Verify submission is blocked with date validation error
    await expect(page.getByText(/End date cannot be before effective date/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-044-FR-XLS-01 Verify "Download Template" Excel button is dynamically enabled only after all required criteria are selected', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    const downloadBtn = page.getByRole('button', { name: 'Download Template' });

    await dutyChartPage.navigateToCalendar();
    await dutyChartPage.openCreateModal();
    await dutyChartPage.selectOfficeInModal('Software and Security Wing');
    await expect(downloadBtn).toBeDisabled();
    await dutyChartPage.fillChartName('Jestha Rotation');

    // Set Effective Date to a later day than End Date (end precedes effective)
    await dutyChartPage.selectEffectiveDate('10');
    await dutyChartPage.selectEndDate('25');
    await dutyChartPage.selectShift(/Evening Shift/i);

    await expect(downloadBtn).toBeEnabled();
  });

  test('TC-048-FR-MAN-01 Verify manual employee duty assignment in "Single" date mode from Duty Chart Calendar', async ({ page }) => {
    const dutyChartPage = new DutyChartCreation(page);
    await dutyChartPage.navigateToCalendar();
    await page.getByRole('combobox').filter({ hasText: 'Select Office' }).click();
    await page.getByRole('option').filter({ hasText: 'Software and Security Wing (' }).click();
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
    await page.getByText('Select Employee').click();
    await page.getByPlaceholder('Search employee by name, ID').click();
    await page.getByPlaceholder('Search employee by name, ID').fill('40160');
    await page.getByRole('option', { name: '40160 - Sajendra Bajracharya' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Select Shift' }).click();
    await page.getByRole('option', { name: 'Evening Shift (12:00:00 - 19:' }).click();
    await page.getByRole('button', { name: 'single' }).click();
    await page.getByRole('button', { name: 'Assign' }).click();
    await expect(page.getByText(/Duty Created Successfully/i)).toBeVisible();
    await page.locator('div').filter({ hasText: /^Sajendra BajracharyaES$/ }).nth(1).click();
    await page.getByRole('checkbox').nth(1).click();
    await page.getByRole('button', { name: 'Delete Selected' }).click();
    await expect(page.getByRole('alertdialog', { name: 'Confirm Bulk Delete' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();

  });



});
