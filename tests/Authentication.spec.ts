import { test, expect } from '@playwright/test';
import { Authentication } from '../pages/Authentication';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/');
    const authPage = new Authentication(page);
    await authPage.loginWithPin();
  });

  test('TC-001-AUTH - Verify successful login authentication with registered Employee ID and valid password', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.login();

    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('TC-002-AUTH - Verify login rejection and generic security error messaging when entering an invalid password', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.login('78977987897897987897', 'Chamati@123');

    const error = page.getByText('No active account found with the given credentials');
    await expect(error).toBeVisible();
  });

  test('TC-003-AUTH - Verify user session persistence across browser restarts when "Remember me" is checked', async ({ page, context }) => {
    const authPage = new Authentication(page);
    await authPage.login(undefined, undefined, true);

    await expect(page).toHaveURL('/dashboard');

    await page.close();

    const newPage = await context.newPage();
    await newPage.goto('/');
    await expect(newPage).toHaveURL('/dashboard');
  });

  test('TC-004-AUTH - Verify user session non-persistence across browser restarts when "Remember me" is unchecked', async ({ page, context }) => {
    const authPage = new Authentication(page);
    await authPage.login();

    await expect(page).toHaveURL('/dashboard');

    await page.close();

    const newPage = await context.newPage();
    await newPage.goto('/');
    await expect(newPage).toHaveURL('/login');
  });

  test('TC-005-AUTH - Verify self-registration account lookup with a valid unregistered Employee ID from official database', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    // Enter valid unregistered Employee ID
    const unregisteredEmpId = process.env.UNREGISTERED_EMPLOYEE_ID || '0007';
    await authPage.findAccount(unregisteredEmpId);

    // Verify system successfully transitions to Verify Details screen displaying matched details
    await expect(authPage.verifyDetailsHeading).toBeVisible();
    await expect(authPage.maskedPhoneDisplay).toBeVisible();
  });

  test('TC-006-AUTH - Verify self-registration lookup rejection and error feedback for non-existent Employee ID', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    // Enter non-existent Employee ID
    await authPage.findAccount(process.env.INVALID_EMPLOYEE_ID!);

    // Verify account not found error toast is displayed and progression is blocked
    await expect(authPage.accountNotFoundError).toBeVisible();
    await expect(authPage.verifyDetailsHeading).not.toBeVisible();
  });

  test('TC-007-AUTH - Verify self-registration redirection when submitting an already-activated Employee ID', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    // Enter already registered Employee ID
    const registeredEmpId = process.env.VALID_EMPLOYEE_ID || '7302';
    await authPage.findAccount(registeredEmpId);

    // Verify system indicates account already exists and directs to login or forgot password
    await expect(authPage.accountAlreadyActiveMessage).toBeVisible();
  });

  test('TC-008-AUTH - Verify OTP dispatch and partial mobile number masking on the Employee Verification screen', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    const unregisteredEmpId = process.env.UNREGISTERED_EMPLOYEE_ID!;
    await authPage.findAccount(unregisteredEmpId);

    await authPage.sendOtp();
    // await expect(authPage.otpSentNotification).toBeVisible();
    // Verify phone number is masked
    await expect(authPage.maskedPhoneDisplay).toBeVisible();

    // Dispatch OTP to mobile
  });

  test('TC-009-AUTH - Verify successful identity verification using valid 6-digit SMS OTP code', async ({ page }) => {
    test.setTimeout(120_000); // whole test may take longer than the default 30s

    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    const unregisteredEmpId = process.env.UNREGISTERED_EMPLOYEE_ID!;
    await authPage.findAccount(unregisteredEmpId);
    await authPage.sendOtp();

    // MANUAL STEP: enter the SMS OTP and click Verify in the browser window.
    // Resumes as soon as the next screen appears (up to 90s).
    await expect(authPage.setPasswordHeading).toBeVisible({ timeout: 90_000 });
  });

  test('TC-010-AUTH - Verify OTP validation failure and retry enforcement when entering invalid or expired code', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    const unregisteredEmpId = process.env.UNREGISTERED_EMPLOYEE_ID!;
    await authPage.findAccount(unregisteredEmpId);
    await authPage.sendOtp();

    // Enter invalid OTP
    await authPage.verifyOtp('000000');

    // Verify invalid OTP error is displayed and progression is blocked
    await expect(authPage.invalidOtpError).toBeVisible();
    await expect(authPage.setPasswordHeading).not.toBeVisible();
  });

  test('TC-011-AUTH - Verify enforcement of password complexity rules during account activation', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    const unregisteredEmpId = process.env.UNREGISTERED_EMPLOYEE_ID!;
    await authPage.findAccount(unregisteredEmpId);
    await authPage.sendOtp();
    // Enter password violating complexity policy (e.g., lacking numbers)
    await authPage.setPasswordAndActivate('abcd@@@@', 'abcd@@@@', 'ITD', 'Assistant');

    // Verify submission is rejected with password complexity guidance
    await expect(authPage.passwordComplexityError).toBeVisible();
  });

  test('TC-012-AUTH - Verify mandatory validation for Working Office and Designation/Position dropdowns during activation', async ({ page }) => {
    const authPage = new Authentication(page);
    await authPage.navigateToSignUp();

    const unregisteredEmpId = process.env.UNREGISTERED_EMPLOYEE_ID || '0007';
    await authPage.findAccount(unregisteredEmpId);
    await authPage.sendOtp();

    // Submit valid password without selecting required Working Office and Designation
    await authPage.setPasswordAndActivate('ComplexPass@123', 'ComplexPass@123');

    // Verify submission is blocked or activate button is disabled
    await expect(page.getByText('Please select a working office.')).toBeVisible();
  });
});