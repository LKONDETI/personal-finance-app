describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display the login screen with all inputs visible', async () => {
    await expect(element(by.text('Sign In'))).toBeVisible();
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should show an error if attempting to login without credentials', async () => {
    await element(by.id('login-button')).tap();
    // Assuming showAlert displays a text like "Please enter your email"
    await expect(element(by.text('Please enter your email'))).toBeVisible();
    // Tap OK to dismiss alert if needed depending on how your alerts are structured
    // In detox, tapping system alerts often requires system level interaction,
    // or if it's a JS alert, we matching by text
    await element(by.text('OK')).tap();
  });

  it('should successfully login with test credentials and go to dashboard', async () => {
    await element(by.id('email-input')).typeText('john.doe@example.com');
    await element(by.id('password-input')).typeText('Test123!');

    // Close keyboard if needed (tapping outside or return)
    await element(by.id('password-input')).tapReturnKey();

    await element(by.id('login-button')).tap();

    // Expecting to be navigated to Dashboard
    await waitFor(element(by.text('Total Balance'))).toBeVisible().withTimeout(5000);
  });
});
