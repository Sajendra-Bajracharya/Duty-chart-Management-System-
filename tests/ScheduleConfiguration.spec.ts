import { test, expect } from '@playwright/test';
import { Authentication } from '../pages/Authentication';
import { ScheduleConfiguration } from '../pages/ScheduleConfiguration';

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

    test('TC-026-FR_TMPL-01 Verify editing and deleting of existing Duty Schedule Templates', async ({ page }) => {
        const schedulePage = new ScheduleConfiguration(page);

        await schedulePage.navigateToDutyScheduleTemplate();

        await page.getByRole('textbox', { name: 'Enter schedule name (e.g.' }).click();
        await page.getByRole('textbox', { name: 'Enter schedule name (e.g.' }).fill('Dashain Shift for Checking ');
        await page.getByRole('textbox', { name: 'e.g. MS' }).click();
        await page.getByRole('textbox', { name: 'e.g. MS' }).fill('DC');
        await schedulePage.selectShiftType('Regular');
        await schedulePage.setStartTimeDutySchedule('01', '00', 'PM');
        await schedulePage.setEndTimeDutySchedule('04', '00', 'PM');
        await page.getByRole('button', { name: 'Create Duty Schedule Template' }).click();
        await expect(page.getByText('Dashain Shift for CheckingTemplate13:00 - 16:00Code: DCType: Regular Edit Delete')).toBeVisible();
        await expect(page.getByText('13:00 - 16:00')).toBeVisible();
        await schedulePage.deleteTemplate('Dashain Shift for Checking');
    });

    test('TC-025-FR_TMPL-01 Verify creation of a global Duty Schedule Template with complete shift timing parameters', async ({ page }) => {
        const schedulePage = new ScheduleConfiguration(page);
        await schedulePage.navigateToDutyScheduleTemplate();

        await schedulePage.clickEditTemplate('Test Template');
        await schedulePage.setStartTimeDutySchedule('01', '00', 'PM');
        await schedulePage.setEndTimeDutySchedule('05', '00', 'PM');
        await schedulePage.clickUpdateDutyScheduleTemplate();
        await schedulePage.verifyTemplateUpdated();
    });

    test('TC-029-FR-OSCH-01 Verify creating an Office Duty Schedule using an existing Schedule Template', async ({ page }) => {
        const schedulePage = new ScheduleConfiguration(page);

        // 1. Navigate to Office Duty Schedule
        await schedulePage.navigateToOfficeDutySchedule();

        // 2. Select template
        await schedulePage.selectScheduleFromTemplate('Dashain Shift');

        // 3. Create Duty Schedule
        await schedulePage.clickCreateDutySchedule();

        // 4. Verify Duty Schedule creation feedback
        await expect(
            schedulePage.successToast
                .or(page.getByText(/must make a unique set/i))
                .first()
        ).toBeVisible({ timeout: 10000 });


        // await schedulePage.deleteSchedule('Day Shift');
        // await schedulePage.selectScheduleFromTemplate('Dashain Shift');
        // await schedulePage.clickCreateDutySchedule();
    });

    test('TC-032-FR-OSCH-01 Verify office isolation: editing or deleting a schedule in Office A does not affect Office B', async ({ page }) => {
        // deleting the schedule in Office A
        const schedulePage = new ScheduleConfiguration(page);
        await schedulePage.navigateToOfficeDutySchedule();
        await page.getByRole('combobox').filter({ hasText: 'Select Schedule from Template' }).click();
        await page.getByRole('option', { name: 'Dashain Shift' }).click();
        await page.getByRole('button', { name: 'Create Duty Schedule' }).click();

        const shiftCard = page.locator('div.py-3', { hasText: 'Dashain Shift' });

        await shiftCard.locator('button:has(svg.lucide-trash2)').click();
        await page.getByRole('button', { name: 'Delete' }).click();

        // checking in  office B 
        await page.getByText('Software and Security Wing (').nth(2).click();
        await page.getByPlaceholder('Search office...').click();
        await page.getByPlaceholder('Search office...').fill('Enterprise');
        await page.getByRole('option', { name: 'Enterprise (ITD)', exact: true }).click();
        await expect(page.locator('div.py-3', { hasText: 'Dashain Shift' })).toBeVisible();

        // clean up code to recreate the schedule
        await schedulePage.navigateToOfficeDutySchedule();

        // 2. Select template
        await schedulePage.selectScheduleFromTemplate('Dashain Shift');

        // 3. Create Duty Schedule
        await schedulePage.clickCreateDutySchedule();

        // 4. Verify Duty Schedule creation feedback
        await expect(
            schedulePage.successToast
                .or(page.getByText(/must make a unique set/i))
                .first()
        ).toBeVisible({ timeout: 10000 });





    });

    test('TC-030-FR-OSCH-01 Verify inline creation of an Office Duty Schedule via "Add New Schedule" toggle', async ({ page }) => {
        const schedulePage = new ScheduleConfiguration(page);

        // 1. Navigate to Office Duty Schedule
        await schedulePage.navigateToOfficeDutySchedule();

        // 2. Click + Add New Schedule toggle
        await schedulePage.toggleAddNewSchedule();

        // 3. Fill Custom Schedule details
        await schedulePage.fillCustomScheduleName('Custom Schedule');
        await schedulePage.fillShiftAlias('CS');
        await schedulePage.selectShiftType('Regular');

        // 4. Set Start Time and End Time
        await schedulePage.setStartTime('01', '00', 'AM');
        await schedulePage.setEndTime('04', '00', 'PM');

        // 5. Submit form
        await schedulePage.clickCreateDutySchedule();

        // 6. Verify Duty Schedule creation feedback
        await expect(
            schedulePage.successToast
                .or(page.getByText(/must make a unique set/i))
                .first()
        ).toBeVisible({ timeout: 10000 });

        // 7. Verify schedule card is visible in the schedules list
        const customScheduleCard = page
            .locator('div.py-3.flex.items-center.justify-between')
            .filter({ hasText: 'Custom Schedule' })
            .first();
        await expect(customScheduleCard).toBeVisible({ timeout: 10000 });
        await schedulePage.deleteSchedule('Custom Schedule');
    });


});
