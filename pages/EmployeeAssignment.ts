import { expect, Locator, Page } from '@playwright/test';

export class EmployeeAssignment {
    readonly page: Page;

    // Navigation & Calendar Filters
    readonly dutyChartCalendarNav: Locator;
    readonly officeCombobox: Locator;
    readonly calendarEmptySlotButtons: Locator;

    // Employee Selection Popover / Dropdown
    readonly selectEmployeeTrigger: Locator;
    readonly employeeSearchInput: Locator;

    // Shift & Date Mode Selection
    readonly shiftCombobox: Locator;
    readonly singleDateModeButton: Locator;
    readonly rangeDateModeButton: Locator;

    // Modal & Date Range Selection
    readonly createDutyDialog: Locator;
    readonly startDateTrigger: Locator;
    readonly endDateTrigger: Locator;

    // Assignment Action & Feedback
    readonly assignButton: Locator;
    readonly dutyCreatedToast: Locator;

    // Deletion & Bulk Cleanup
    readonly deleteSelectedButton: Locator;
    readonly bulkDeleteAlertDialog: Locator;
    readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation & Calendar Filters
        this.dutyChartCalendarNav = this.page.getByRole('link', { name: 'Duty Chart Calendar' });
        this.officeCombobox = this.page.getByRole('combobox').filter({ hasText: /Select Office/i });
        this.calendarEmptySlotButtons = this.page.getByRole('button').filter({ hasText: /^$/ });

        // Employee Selection Popover / Dropdown
        this.selectEmployeeTrigger = this.page.getByText('Select Employee')
            .or(this.page.getByRole('button', { name: /Select Employee/i }));
        this.employeeSearchInput = this.page.getByPlaceholder('Search employee by name, ID');

        // Shift & Date Mode Selection
        this.shiftCombobox = this.page.getByRole('combobox').filter({ hasText: /Select Shift/i });
        this.singleDateModeButton = this.page.getByRole('button', { name: /^single$/i });
        this.rangeDateModeButton = this.page.getByRole('button', { name: /^range$/i });

        // Modal & Date Range Selection
        this.createDutyDialog = this.page.getByRole('dialog', { name: 'Create Duty' });
        this.startDateTrigger = this.createDutyDialog
            .locator('.space-y-1')
            .filter({ hasText: 'Start Date' })
            .locator('div[aria-haspopup="dialog"]');
        this.endDateTrigger = this.createDutyDialog
            .locator('.space-y-1')
            .filter({ hasText: 'End Date' })
            .locator('div[aria-haspopup="dialog"]');

        // Assignment Action & Feedback
        this.assignButton = this.page.getByRole('button', { name: 'Assign' });
        this.dutyCreatedToast = this.page.getByText(/Successfully assigned /i);

        // Deletion & Bulk Cleanup
        this.deleteSelectedButton = this.page.getByRole('button', { name: 'Delete Selected' });
        this.bulkDeleteAlertDialog = this.page.getByRole('alertdialog', { name: /Confirm Bulk Delete/i });
        this.confirmDeleteButton = this.page.getByRole('button', { name: 'Delete' });
    }

    /**
     * Navigates to the Duty Chart Calendar view
     */
    async navigateToCalendar() {
        await this.dutyChartCalendarNav.click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    /**
     * Selects an office from the calendar header dropdown
     * @param officeName Office name or partial text (default: 'Software and Security Wing')
     */
    async selectOffice(officeName: string = 'Software and Security Wing') {
        await this.officeCombobox.click();
        const option = this.page.getByRole('option').filter({ hasText: new RegExp(officeName, 'i') }).first();
        await option.click();
    }

    /**
     * Clicks on an empty slot/cell button on the duty chart calendar to open the assignment modal
     * @param slotIndex 0-indexed position among the empty cell buttons (default: 3)
     */
    async clickCalendarSlot(slotIndex: number = 3) {
        await this.calendarEmptySlotButtons.nth(slotIndex).click();
    }

    /**
     * Searches and selects an employee from the assignment employee dropdown
     * @param searchQuery Employee ID or Name (e.g. '40160')
     * @param optionLabel Optional full option label to click (defaults to matching searchQuery)
     */
    async selectEmployee(searchQuery: string = '40160', optionLabel?: string | RegExp) {
        await this.selectEmployeeTrigger.click();
        await this.employeeSearchInput.click();
        await this.employeeSearchInput.fill(searchQuery);

        const option = optionLabel
            ? (typeof optionLabel === 'string'
                ? this.page.getByRole('option', { name: optionLabel })
                : this.page.getByRole('option', { name: optionLabel }))
            : this.page.getByRole('option').filter({ hasText: new RegExp(searchQuery, 'i') }).first();

        await option.click();
    }

    /**
     * Selects a shift from the Shift dropdown
     * @param shiftPattern Shift name pattern (e.g. 'Evening Shift (12:00:00 - 19:' or /Evening Shift/i)
     */
    async selectShift(shiftPattern: string | RegExp = /Evening Shift/i) {
        await this.shiftCombobox.click();
        const option = typeof shiftPattern === 'string'
            ? this.page.getByRole('option', { name: shiftPattern }).first()
            : this.page.getByRole('option', { name: shiftPattern }).first();
        await option.click();
    }

    /**
     * Selects the assignment date mode ('single' or 'range')
     * @param mode 'single' or 'range'
     */
    async selectDateMode(mode: 'single' | 'range' = 'single') {
        if (mode === 'single') {
            await this.singleDateModeButton.click();
        } else {
            await this.rangeDateModeButton.click();
        }
    }

    /**
     * Selects the start date in the Create Duty modal
     * @param day Day of the month to select (default: '22')
     */
    async selectStartDate(day: string = '22') {
        await this.startDateTrigger.click();
        const popover = this.page.locator('[data-radix-popper-content-wrapper], [role="dialog"]').last();
        const dayButton = popover.getByRole('button', { name: day, exact: true })
            .or(popover.locator('button', { hasText: new RegExp(`^${day}$`) }));
        await dayButton.first().click();
    }

    /**
     * Selects the end date in the Create Duty modal and dismisses the popover
     * @param day Day of the month to select (default: '25')
     */
    async selectEndDate(day: string = '25') {
        await this.endDateTrigger.click();
        const popover = this.page.locator('[data-radix-popper-content-wrapper], [role="dialog"]').last();
        const dayButton = popover.getByRole('button', { name: day, exact: true })
            .or(popover.locator('button', { hasText: new RegExp(`^${day}$`) }));
        await dayButton.first().click();
        await this.dismissDatePopover();
    }

    /**
     * Selects a continuous date range (start date and end date) in Range mode
     * @param startDay Day of the month for start date (default: '22')
     * @param endDay Day of the month for end date (default: '25')
     */
    async selectDateRange(startDay: string = '22', endDay: string = '25') {
        await this.selectStartDate(startDay);
        await this.selectEndDate(endDay);
    }

    /**
     * Clicks the Create Duty dialog container to dismiss any open datepicker popovers
     */
    async dismissDatePopover() {
        await this.createDutyDialog.click();
    }

    /**
     * Clicks the Assign button to confirm employee assignment
     */
    async clickAssign() {
        await this.assignButton.click();
    }

    /**
     * Verifies that the duty created success message is displayed
     * @param timeout Optional timeout in milliseconds
     */
    async verifyDutyCreatedSuccessfully(timeout: number = 10000) {
        await expect(this.dutyCreatedToast).toBeVisible({ timeout });
    }


    async selectAssignedDuty(dutyTextPattern: string | RegExp = /^Sajendra BajracharyaES$/, occurrenceIndex: number = 1) {
        const dutyCard = typeof dutyTextPattern === 'string'
            ? this.page.locator('div').filter({ hasText: dutyTextPattern }).nth(occurrenceIndex)
            : this.page.locator('div').filter({ hasText: dutyTextPattern }).nth(occurrenceIndex);
        await dutyCard.click();
    }

    /**
     * Deletes the currently selected duty assignment(s) with confirmation dialog handling
     * @param checkboxIndex Index of the duty checkbox to select (default: 1)
     */
    async deleteSelectedDuty(checkboxIndex: number = 1) {
        await this.page.getByRole('checkbox').nth(checkboxIndex).click();
        await this.deleteSelectedButton.click();
        await expect(this.bulkDeleteAlertDialog).toBeVisible();
        await this.confirmDeleteButton.click();
    }

    /**
     * Convenience method to perform duty cleanup for an employee assignment
     * @param dutyTextPattern Identifier text on the duty badge
     * @param checkboxIndex Index of the checkbox to select
     */
    async cleanupAssignedDuty(dutyTextPattern: string | RegExp = /^Sajendra BajracharyaES$/, checkboxIndex: number = 1) {
        await this.selectAssignedDuty(dutyTextPattern);
        await this.deleteSelectedDuty(checkboxIndex);
    }

    /**
     * Complete workflow method for assigning an employee in Single mode and verifying success
     */
    async assignDutyInSingleMode(options: {
        office?: string;
        slotIndex?: number;
        employeeQuery?: string;
        employeeOption?: string | RegExp;
        shift?: string | RegExp;
    } = {}) {
        const office = options.office || 'Software and Security Wing';
        const slotIndex = options.slotIndex !== undefined ? options.slotIndex : 3;
        const employeeQuery = options.employeeQuery || '40160';
        const employeeOption = options.employeeOption || '40160 - Sajendra Bajracharya';
        const shift = options.shift || /Evening Shift/i;

        await this.navigateToCalendar();
        await this.selectOffice(office);
        await this.clickCalendarSlot(slotIndex);
        await this.selectEmployee(employeeQuery, employeeOption);
        await this.selectShift(shift);
        await this.selectDateMode('single');
        await this.clickAssign();
        await this.verifyDutyCreatedSuccessfully();
    }

    /**
     * Complete workflow method for assigning an employee in Range mode and verifying success
     */
    async assignDutyInRangeMode(options: {
        office?: string;
        slotIndex?: number;
        employeeQuery?: string;
        employeeOption?: string | RegExp;
        shift?: string | RegExp;
        startDay?: string;
        endDay?: string;
    } = {}) {
        const office = options.office || 'Software and Security Wing';
        const slotIndex = options.slotIndex !== undefined ? options.slotIndex : 3;
        const employeeQuery = options.employeeQuery || '40160';
        const employeeOption = options.employeeOption || '40160 - Sajendra Bajracharya';
        const shift = options.shift || /Evening Shift/i;
        const startDay = options.startDay || '22';
        const endDay = options.endDay || '25';

        await this.navigateToCalendar();
        await this.selectOffice(office);
        await this.clickCalendarSlot(slotIndex);
        await this.selectEmployee(employeeQuery, employeeOption);
        await this.selectShift(shift);
        await this.selectDateMode('range');
        await this.selectDateRange(startDay, endDay);
        await this.clickAssign();
        await this.verifyDutyCreatedSuccessfully();
    }
}
