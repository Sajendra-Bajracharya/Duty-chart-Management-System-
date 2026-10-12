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

    test('TC-028-FR-OSCH-01 Verify creating an Office Duty Schedule using an existing Schedule Template', async ({ page }) => {
        const schedulePage = new ScheduleConfiguration(page);

        // 1. Navigate to Office Duty Schedule
        await schedulePage.navigateToOfficeDutySchedule();

        // 2. Select template
        await schedulePage.selectScheduleFromTemplate('Day Shift');

        // 3. Create Duty Schedule
        await schedulePage.clickCreateDutySchedule();

        // 4. Verify Duty Schedule creation feedback
        await expect(
            schedulePage.successToast
                .or(page.getByText(/must make a unique set/i))
                .first()
        ).toBeVisible({ timeout: 10000 });
        await schedulePage.deleteSchedule('Day Shift');
    });

    test('TC-029-FR-OSCH-01 Verify inline creation of an Office Duty Schedule via "Add New Schedule" toggle', async ({ page }) => {
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
