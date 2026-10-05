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

        // Find Account / Self-Registration Elements
        this.findAccountTitle = this.page.getByRole('heading', { name: /find your account|employee activation/i });
        this.findAccountEmployeeIdInput = this.page.getByPlaceholder('Employee ID', { exact: true });
        this.findAccountButton = this.page.getByRole('button', { name: /find account/i });
        this.accountNotFoundError = this.page.getByText(`Employee ID '${process.env.INVALID_EMPLOYEE_ID}' not found.`);
        this.accountAlreadyActiveMessage = this.page.getByText('This account is already');

        // Verification & OTP Elements
        this.verifyDetailsHeading = this.page.getByRole('heading', { name: /verify details/i });
        this.employeeNameDisplay = this.page.locator('[data-testid="employee-name"], .employee-name');
        this.maskedPhoneDisplay = this.page.locator('[data-testid="masked-phone"], .masked-phone, span:has-text("985")');
        this.sendOtpButton = this.page.getByRole('button', { name: /send otp/i });
        this.otpSentNotification = this.page.getByText(/otp.*sent/i);
        this.otpInput = this.page.locator('input#otp, input[name="otp"]');
        this.verifyOtpButton = this.page.getByRole('button', { name: /verify otp/i });
        this.invalidOtpError = this.page.getByText(/invalid otp|incorrect otp|expired/i);

        // Set Password / Account Activation Elements
        this.setPasswordHeading = this.page.getByRole('heading', { name: /set password|activate account/i });
        this.newPasswordInput = this.page.locator('#new_password, input[name="new_password"]');
        this.confirmPasswordInput = this.page.locator('#confirm_password, input[name="confirm_password"]');
        this.workingOfficeDropdown = this.page.locator('select#working_office, select[name="working_office"], [data-testid="working-office"]');
        this.designationDropdown = this.page.locator('select#designation, select[name="designation"], [data-testid="designation"]');
        this.activateAccountButton = this.page.getByRole('button', { name: /activate account|save/i });
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

    async setPasswordAndActivate(
        newPassword: string,
        confirmPassword: string,
        office?: string,
        designation?: string
    ) {
        await this.newPasswordInput.fill(newPassword);
        await this.confirmPasswordInput.fill(confirmPassword);
        if (office) {
            await this.workingOfficeDropdown.selectOption(office);
        }
        if (designation) {
            await this.designationDropdown.selectOption(designation);
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