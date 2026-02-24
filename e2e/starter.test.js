describe('Dashboard Startup', () => {
  beforeAll(async () => {
    // Launch the app
    await device.launchApp();
  });

  beforeEach(async () => {
    // Reload react native instance before each test
    await device.reloadReactNative();
  });

  it('should successfully launch the app and render the Login screen', async () => {
    // Look for text or elements unique to the login screen
    // E.g., The "Login" button, Input placeholders, etc.
    await expect(element(by.text('Sign In'))).toBeVisible();
    await expect(element(by.text('Email Address'))).toBeVisible();
  });
});
