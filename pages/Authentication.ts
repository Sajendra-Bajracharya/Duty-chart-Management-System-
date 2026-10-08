import { expect, Locator, Page } from '@playwright/test';

export class Authentication {
    readonly page: Page;

    // PIN Authentication Elements
    readonly pinTab: Locator;
    readonly pinInput: Locator;
    readonly pinLoginButton: Locator;
    readonly logo: Locator;

    // Credential Login Elements
    readonly employeeIdInput: Locator;
    readonly passwordInput: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly signUpLink: Locator;
    readonly forgotPasswordLink: Locator;

    // Find Account / Self-Registration Elements
    readonly findAccountTitle: Locator;
    readonly findAccountEmployeeIdInput: Locator;
    readonly findAccountButton: Locator;
    readonly accountNotFoundError: Locator;
    readonly accountAlreadyActiveMessage: Locator;

    // Verification & OTP Elements
    readonly verifyDetailsHeading: Locator;
    readonly employeeNameDisplay: Locator;
    readonly maskedPhoneDisplay: Locator;
    readonly sendOtpButton: Locator;
    readonly otpSentNotification: Locator;
    readonly otpInput: Locator;
    readonly verifyOtpButton: Locator;
    readonly invalidOtpError: Locator;

    // Set Password / Account Activation Elements
    readonly setPasswordHeading: Locator;
    readonly newPasswordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly workingOfficeDropdown: Locator;
    readonly designationDropdown: Locator;
    readonly activateAccountButton: Locator;
    readonly passwordComplexityError: Locator;
    readonly mandatoryFieldError: Locator;

    // Forgot Password Elements
    readonly forgotPasswordHeading: Locator;
    readonly forgotPasswordEmployeeIdInput: Locator;
    readonly forgotPasswordSubmitButton: Locator;
    readonly resetPasswordButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // PIN Authentication Elements
        this.pinTab = this.page.getByRole('tab', { name: 'PIN' });
        this.pinInput = this.page.locator('input[name="pin"]');
        this.pinLoginButton = this.page.getByRole('button', { name: 'Log in with PIN' });
        this.logo = this.page.getByAltText('Nepal Telecom Logo');

        // Credential Login Elements
        this.employeeIdInput = this.page.locator('#employee_id');
        this.passwordInput = this.page.locator('#password');
        this.rememberMeCheckbox = this.page.getByLabel('Remember me');
        this.loginButton = this.page.locator('button[type="submit"]');
        this.errorMessage = this.page.getByText('No active account found with the given credentials');
        this.signUpLink = this.page.getByRole('button', { name: 'Sign up', exact: true });
        this.forgotPasswordLink = this.page.getByRole('link', { name: /forgot password/i });

        // Find Account / Self-Registration Elementsveri
        this.findAccountTitle = this.page.getByRole('heading', { name: /find your account|employee activation/i });
        this.findAccountEmployeeIdInput = this.page.getByPlaceholder('Employee ID', { exact: true });
        this.findAccountButton = this.page.getByRole('button', { name: /find account/i });
        this.accountNotFoundError = this.page.getByText(`Employee ID '${process.env.INVALID_EMPLOYEE_ID}' not found.`);
        this.accountAlreadyActiveMessage = this.page.getByText(/already active|already registered/i);

        // Verification & OTP Elements
        this.verifyDetailsHeading = this.page.getByRole('heading', { name: /verify details/i });
        this.employeeNameDisplay = this.page.locator('[data-testid="employee-name"], .employee-name');
        this.maskedPhoneDisplay = this.page.getByText('Sent to 984****');
        this.sendOtpButton = this.page.getByRole('button', { name: 'Send OTP to Mobile' })
        this.otpSentNotification = this.page.getByText(/otp.*sent/i);
        this.otpInput = this.page.getByPlaceholder('••••••');
        this.verifyOtpButton = this.page.getByRole('button', { name: 'Verify OTP' })
        this.invalidOtpError = this.page.getByText('Invalid OTP. Please try again.');

        // Set Password / Account Activation Elements
        this.setPasswordHeading = this.page.getByRole('heading', { name: /set password|activate account/i });
        this.newPasswordInput = this.page.getByPlaceholder('New Password')
        this.confirmPasswordInput = this.page.getByPlaceholder('Confirm Password')
        this.workingOfficeDropdown = this.page.locator('button[role="combobox"]').filter({ hasText: /working office/i });
        this.designationDropdown = this.page.locator('button[role="combobox"]').filter({ hasText: /working position|designation/i });
        this.activateAccountButton = this.page.getByRole('button', { name: 'Activate Account' });
        this.passwordComplexityError = this.page.getByText(/password must be at least 8 characters/i);
        this.mandatoryFieldError = this.page.getByText(/field is required|please select/i);

        // Forgot Password Elements
        this.forgotPasswordHeading = this.page.getByRole('heading', { name: /forgot password|account recovery/i });
        this.forgotPasswordEmployeeIdInput = this.page.getByPlaceholder('Employee ID', { exact: true });
        this.forgotPasswordSubmitButton = this.page.getByRole('button', { name: /submit|send/i });
        this.resetPasswordButton = this.page.getByRole('button', { name: /reset password|save/i });
    }

    async goto() {
        await this.page.goto('/');
    }

    async loginWithPin(pin: string = process.env.PIN || '012345') {
        await this.pinTab.click();
        await this.pinInput.fill(pin);
        await this.pinLoginButton.click();
        await expect(this.logo).toBeVisible();
    }

    async login(
        employeeId: string = process.env.VALID_EMPLOYEE_ID || '',
        password: string = process.env.VALID_PASSWORD || '',
        rememberMe: boolean = false
    ) {
        await this.employeeIdInput.fill(employeeId);
        await this.passwordInput.fill(password);
        if (rememberMe) {
            await this.rememberMeCheckbox.check();
        }
        await this.loginButton.click();
    }

    async navigateToSignUp() {
        await this.signUpLink.click();
    }

    async findAccount(employeeId: string) {
        await this.findAccountEmployeeIdInput.fill(employeeId);
        await this.findAccountButton.click();
    }

    async sendOtp() {
        await this.sendOtpButton.click();
    }

    async verifyOtp(otp: string) {
        await this.otpInput.fill(otp);
        await this.verifyOtpButton.click();
    }

    async selectDropdownOption(trigger: Locator, value: string) {
        // 1. Click the combobox trigger button
        await trigger.click();

        // 2. Locate any search/cmdk input inside the opened popover / dialog
        const popover = this.page.locator('[data-radix-popper-content-wrapper], [role="dialog"], [cmdk-root]').last();
        const searchInput = popover.locator('input');

        if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await searchInput.fill(value);
            await this.page.waitForTimeout(300);
        }

        // 3. Find matching item inside popover
        const optionInPopover = popover
            .locator('[role="option"], [cmdk-item], [data-radix-collection-item], div')
            .filter({ hasText: new RegExp(value, 'i') })
            .first();

        if (await optionInPopover.isVisible({ timeout: 1500 }).catch(() => false)) {
            await optionInPopover.click();
        } else {
            // Fallback: search globally
            const pageOption = this.page.getByRole('option', { name: new RegExp(value, 'i') })
                .or(this.page.locator('[role="option"], [cmdk-item]').filter({ hasText: new RegExp(value, 'i') }))
                .or(this.page.getByText(new RegExp(value, 'i')));
            await pageOption.first().click();
        }
    }

    async setPasswordAndActivate(
        newPassword: string,
        confirmPassword: string,
        office?: string,
        designation?: string
    ) {
        await this.newPasswordInput.fill(newPassword);
        await this.confirmPasswordInput.fill(confirmPassword);

        if (office) {
            await this.selectDropdownOption(this.workingOfficeDropdown, office);
        }

        if (designation) {
            await this.selectDropdownOption(this.designationDropdown, designation);
        }

        await this.activateAccountButton.click();
    }

    async navigateToForgotPassword() {
        await this.forgotPasswordLink.click();
    }

    async submitForgotPassword(employeeId: string) {
        await this.forgotPasswordEmployeeIdInput.fill(employeeId);
        await this.forgotPasswordSubmitButton.click();
    }
}