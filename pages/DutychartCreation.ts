import { expect, Locator, Page } from '@playwright/test';

export class DutyChartCreation {
    readonly page: Page;

    // Navigation & Calendar Locators
    readonly dutyChartCalendarNav: Locator;
    readonly calendarOfficeFilter: Locator;
    readonly openCreateDutyChartButton: Locator;

    // Modal Form Locators
    readonly modalOfficeCombobox: Locator;
    readonly chartNameInput: Locator;
    readonly effectiveDateTrigger: Locator;
    readonly endDateTrigger: Locator;
    readonly defaultShiftButton: Locator;
    readonly createButton: Locator;
    readonly confirmCreateDutyChartButton: Locator;
    readonly successToast: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation & Calendar Locators
        this.dutyChartCalendarNav = this.page.getByRole('link', { name: 'Duty Chart Calendar' });
        this.calendarOfficeFilter = this.page.getByRole('combobox').filter({ hasText: /select office/i });
        this.openCreateDutyChartButton = this.page.getByRole('button', { name: 'Create Duty Chart' });

        // Modal Form Locators
        this.modalOfficeCombobox = this.page.locator('[role="dialog"]').locator('button[role="combobox"]').first();

        this.chartNameInput = this.page
            .locator('[role="dialog"]')
            .getByRole('textbox', { name: /e\.g\., March Rotation|Duty Chart/i })
            .or(this.page.locator('[role="dialog"]').getByPlaceholder(/e\.g\., March Rotation/i))
            .first();

        this.effectiveDateTrigger = this.page
            .locator('.space-y-1', { hasText: 'Effective Date' })
            .locator('div[aria-haspopup="dialog"]')
            .first();

        this.endDateTrigger = this.page
            .locator('.space-y-1', { hasText: 'End Date' })
            .locator('div[aria-haspopup="dialog"]')
            .first();

        this.defaultShiftButton = this.page.getByRole('button', { name: /Day Shift/i });
        this.createButton = this.page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
            .or(this.page.getByRole('button', { name: 'Create', exact: true }));

        this.confirmCreateDutyChartButton = this.page
            .getByRole('dialog', { name: /confirm duty chart creation/i })
            .getByRole('button', { name: 'Create Duty Chart' })
            .or(this.page.getByRole('button', { name: 'Create Duty Chart' }).last());

        this.successToast = this.page.getByText(/Duty Chart Created/i);
    }

    async navigateToCalendar() {
        await this.dutyChartCalendarNav.click();
        await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    async selectOfficeInCalendar(officeName?: string) {
        if (await this.calendarOfficeFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
            await this.calendarOfficeFilter.click();
            if (officeName) {
                const option = this.page.getByRole('listbox', { name: /suggestions/i })
                    .getByRole('option', { name: new RegExp(officeName, 'i') })
                    .or(this.page.getByRole('option', { name: new RegExp(officeName, 'i') }));
                if (await option.first().isVisible({ timeout: 1500 }).catch(() => false)) {
                    await option.first().click();
                }
            } else {
                const listbox = this.page.getByRole('listbox', { name: /suggestions/i })
                    .or(this.page.getByRole('option'))
                    .first();
                if (await listbox.isVisible({ timeout: 1500 }).catch(() => false)) {
                    await listbox.click();
                }
            }
        }
    }

    async openCreateModal() {
        if (await this.calendarOfficeFilter.isVisible({ timeout: 1500 }).catch(() => false)) {
            await this.selectOfficeInCalendar();
        }
        await this.openCreateDutyChartButton.click();
        await expect(this.page.getByRole('heading', { name: 'Create Duty Chart' })).toBeVisible({ timeout: 5000 });
    }

    async selectOfficeInModal(officeName: string = 'Software and Security Wing') {
        const officeCombobox = this.page.locator('[role="dialog"]').locator('button[role="combobox"]').first();
        await officeCombobox.click();

        const option = this.page
            .getByRole('listbox', { name: /suggestions/i })
            .getByRole('option', { name: new RegExp(officeName, 'i') })
            .or(this.page.getByRole('option', { name: new RegExp(officeName, 'i') }))
            .first();

        await option.click();
    }

    async fillChartName(name: string) {
        await this.chartNameInput.click();
        await this.chartNameInput.fill(name);
    }

    async selectEffectiveDate(day: string = '22') {
        await this.effectiveDateTrigger.click();
        const popover = this.page.locator('[data-radix-popper-content-wrapper], [role="dialog"]').last();
        const dayButton = popover.getByRole('button', { name: day, exact: true })
            .or(this.page.getByRole('button', { name: day, exact: true }));
        await dayButton.first().click();
    }

    async selectEndDate(day: string = '25') {
        await this.endDateTrigger.click();
        const popover = this.page.locator('[data-radix-popper-content-wrapper], [role="dialog"]').last();
        const dayButton = popover.getByRole('button', { name: day, exact: true })
            .or(this.page.getByRole('button', { name: day, exact: true }));
        await dayButton.first().click();
    }

    async selectShift(shiftNamePattern: RegExp = /Day Shift/i) {
        const shiftButton = this.page.locator('[role="dialog"]').getByRole('button', { name: shiftNamePattern })
            .or(this.page.getByRole('button', { name: shiftNamePattern }))
            .first();
        if (await shiftButton.isVisible({ timeout: 4000 }).catch(() => false)) {
            await shiftButton.click();
        }
    }

    async submitForm() {
        // 1. Click Create on the main modal
        const createBtn = this.page.locator('[role="dialog"]').getByRole('button', { name: 'Create', exact: true })
            .or(this.page.getByRole('button', { name: 'Create', exact: true }))
            .first();
        await createBtn.click();

        // 2. Confirm creation on the confirmation dialog
        const confirmBtn = this.page
            .getByRole('dialog', { name: /confirm duty chart creation/i })
            .getByRole('button', { name: 'Create Duty Chart' })
            .or(this.page.getByRole('button', { name: 'Create Duty Chart' }).last());

        await confirmBtn.waitFor({ state: 'visible', timeout: 5000 });
        await confirmBtn.click();
    }

    async createDutyChart(data: {
        office?: string;
        chartName?: string;
        effectiveDay?: string;
        endDay?: string;
        shiftPattern?: RegExp;
    } = {}) {
        const office = data.office || 'Software and Security Wing';
        const chartName = data.chartName || `test duty chart automation ${Date.now()}`;
        const effectiveDay = data.effectiveDay || '22';
        const endDay = data.endDay || '25';
        const shiftPattern = data.shiftPattern || /Day Shift/i;

        await this.navigateToCalendar();
        await this.openCreateModal();
        await this.selectOfficeInModal(office);
        await this.fillChartName(chartName);
        await this.selectEffectiveDate(effectiveDay);
        await this.selectEndDate(endDay);
        await this.selectShift(shiftPattern);
        await this.submitForm();
    }
}
