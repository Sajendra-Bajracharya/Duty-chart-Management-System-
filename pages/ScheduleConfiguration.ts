import { expect, Locator, Page } from '@playwright/test';

export class ScheduleConfiguration {
    readonly page: Page;

    // Navigation
    readonly officeDutyScheduleNav: Locator;
    readonly dutyScheduleTemplateNav: Locator;

    // Schedule Template Mode Locators
    readonly scheduleNameCombobox: Locator;
    readonly officeCombobox: Locator;
    readonly createDutyScheduleTemplateButton: Locator;
    readonly updateDutyScheduleTemplateButton: Locator;
    readonly templateUpdatedToast: Locator;

    // Inline (+ Add New Schedule) Mode Locators
    readonly addNewScheduleButton: Locator;
    readonly customScheduleNameInput: Locator;
    readonly shiftAliasInput: Locator;
    readonly shiftTypeCombobox: Locator;
    readonly createDutyScheduleButton: Locator;
    readonly successToast: Locator;

    constructor(page: Page) {
        this.page = page; // take the value from the constuctor  parameter and store in the this.page

        this.officeDutyScheduleNav = this.page.getByRole('link', { name: 'Office Duty Schedule' });
        this.dutyScheduleTemplateNav = this.page.getByRole('link', { name: 'Duty Schedule Template' });

        this.scheduleNameCombobox = this.page
            .locator('div', { hasText: 'Schedule Name' })
            .locator('button[role="combobox"]')
            .first()
            .or(this.page.locator('main').locator('button[role="combobox"]').first());

        this.officeCombobox = this.page.locator('form').locator('button[role="combobox"]').nth(1);

        // Duty Schedule Template Buttons & Feedback
        this.createDutyScheduleTemplateButton = this.page.getByRole('button', { name: 'Create Duty Schedule Template' });
        this.updateDutyScheduleTemplateButton = this.page.getByRole('button', { name: 'Update Duty Schedule Template' });
        this.templateUpdatedToast = this.page.getByText(/Schedule updated successfully/i);

        // Inline (+ Add New Schedule) Mode Locators
        this.addNewScheduleButton = this.page.getByRole('button', { name: '+ Add New Schedule' });
        this.customScheduleNameInput = this.page.getByRole('textbox', { name: 'Enter custom schedule name' })
            .or(this.page.getByPlaceholder('Enter custom schedule name'));
        this.shiftAliasInput = this.page.getByRole('textbox', { name: 'e.g. MS' })
            .or(this.page.getByPlaceholder('e.g. MS'));
        this.shiftTypeCombobox = this.page.getByRole('combobox').filter({ hasText: /Select Type|Regular|Shift|On Call|Holiday Duty/i });

        // Submit & Feedback Locators
        this.createDutyScheduleButton = this.page.getByRole('button', { name: 'Create Duty Schedule' });
        this.successToast = this.page.getByText(/Duty Schedule Created/i);
    }

    async navigateToOfficeDutySchedule() {
        await this.officeDutyScheduleNav.click();
        await this.page.waitForLoadState('networkidle').catch(() => { });
    }

    async navigateToDutyScheduleTemplate() {
        await this.dutyScheduleTemplateNav.click();
    }

    async selectScheduleFromTemplate(templateName: string = 'Day Shift') {
        await this.scheduleNameCombobox.click();
        const option = this.page.getByRole('option', { name: templateName, exact: true })
            .or(this.page.getByRole('option', { name: new RegExp(templateName, 'i') }))
            .first();
        await option.click();
    }

    async toggleAddNewSchedule() {
        await this.addNewScheduleButton.click();
    }

    async fillCustomScheduleName(name: string) {
        await this.customScheduleNameInput.fill(name);
    }

    async fillShiftAlias(alias: string) {
        await this.shiftAliasInput.fill(alias);
    }

    async selectShiftType(type: string = 'Regular') {
        await this.shiftTypeCombobox.click();
        await this.page.getByRole('option', { name: type, exact: true }).click();
    }

    async pickFromComboboxDutySchedule(index: number, value: string) {
        await this.page.getByRole('combobox').nth(index).click();
        await this.page.getByRole('option', { name: value, exact: true }).click();
    }

    async setStartTimeDutySchedule(hour: string, minute: string, period: 'AM' | 'PM') {
        await this.pickFromComboboxDutySchedule(1, hour);
        await this.pickFromComboboxDutySchedule(2, minute);
        await this.pickFromComboboxDutySchedule(3, period);
    }

    async setEndTimeDutySchedule(hour: string, minute: string, period: 'AM' | 'PM') {
        await this.pickFromComboboxDutySchedule(4, hour);
        await this.pickFromComboboxDutySchedule(5, minute);
        await this.pickFromComboboxDutySchedule(6, period);
    }

    async pickFromCombobox(index: number, value: string) {
        await this.page.getByRole('combobox').nth(index).click();
        await this.page.getByRole('option', { name: value, exact: true }).click();
    }

    async setStartTime(hour: string = '01', minute: string = '00', period: 'AM' | 'PM' = 'AM') {
        await this.pickFromCombobox(2, hour);
        await this.pickFromCombobox(3, minute);
        await this.pickFromCombobox(4, period);
    }

    async setEndTime(hour: string = '04', minute: string = '00', period: 'AM' | 'PM' = 'PM') {
        await this.pickFromCombobox(5, hour);
        await this.pickFromCombobox(6, minute);
        await this.pickFromCombobox(7, period);
    }

    async clickCreateDutySchedule() {
        await this.createDutyScheduleButton.click();
    }

    async createScheduleFromTemplateFlow(templateName: string = 'Day Shift') {
        await this.navigateToOfficeDutySchedule();
        await this.selectScheduleFromTemplate(templateName);
        await this.clickCreateDutySchedule();
    }

    async createInlineScheduleFlow(data: {
        name: string;
        alias: string;
        type?: string;
        startHour?: string;
        startMinute?: string;
        startPeriod?: 'AM' | 'PM';
        endHour?: string;
        endMinute?: string;
        endPeriod?: 'AM' | 'PM';
    }) {
        await this.navigateToOfficeDutySchedule();
        await this.toggleAddNewSchedule();
        await this.fillCustomScheduleName(data.name);
        await this.fillShiftAlias(data.alias);
        await this.selectShiftType(data.type || 'Regular');
        await this.setStartTime(data.startHour || '01', data.startMinute || '00', data.startPeriod || 'AM');
        await this.setEndTime(data.endHour || '04', data.endMinute || '00', data.endPeriod || 'PM');
        await this.clickCreateDutySchedule();
    }

    async deleteSchedule(scheduleName: string) {
        const scheduleRow = this.page
            .locator('div.py-3.flex.items-center.justify-between')
            .filter({ hasText: scheduleName })
            .first();
        await expect(scheduleRow).toBeVisible({ timeout: 5000 });

        const deleteButton = scheduleRow.locator('button:has(svg.lucide-trash2)').or(
            scheduleRow.locator('button').filter({ has: this.page.locator('svg.lucide-trash2') })
        );
        await deleteButton.first().click();

        const confirmDeleteButton = this.page
            .getByRole('dialog')
            .getByRole('button', { name: 'Delete', exact: true })
            .or(this.page.getByRole('button', { name: 'Delete', exact: true }));
        await expect(confirmDeleteButton.first()).toBeVisible({ timeout: 5000 });
        await confirmDeleteButton.first().click();
    }

    getTemplateCard(templateName: string): Locator {
        return this.page
            .locator('div.border.rounded-lg')
            .filter({ hasText: templateName })
            .last()
            .or(this.page.getByText(templateName));
    }

    async clickEditTemplate(templateName: string) {
        const card = this.getTemplateCard(templateName);
        await expect(card.first()).toBeVisible({ timeout: 5000 });
        await card.first().hover();
        await card.first().getByRole('button', { name: 'Edit' }).click();
    }

    async clickUpdateDutyScheduleTemplate() {
        await this.updateDutyScheduleTemplateButton.click();
    }

    async clickCreateDutyScheduleTemplate() {
        await this.createDutyScheduleTemplateButton.click();
    }

    async verifyTemplateUpdated() {
        await expect(this.templateUpdatedToast).toBeVisible({ timeout: 5000 });
    }

    async deleteTemplate(templateIdentifier: string | number = 1) {
        if (typeof templateIdentifier === 'string') {
            const templateCard = this.getTemplateCard(templateIdentifier);
            await expect(templateCard.first()).toBeVisible({ timeout: 5000 });
            await templateCard.first().hover().catch(() => {});
            await templateCard.first().getByRole('button', { name: 'Delete' }).click();

            const confirmDialog = this.page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true });
            if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
                await confirmDialog.click();
            }

            await expect(templateCard.first()).not.toBeVisible({ timeout: 5000 });
        } else {
            const deleteButton = this.page.getByRole('button', { name: 'Delete' }).nth(templateIdentifier);
            await deleteButton.click();

            const confirmDialog = this.page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true });
            if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
                await confirmDialog.click();
            }
        }
    }
}


