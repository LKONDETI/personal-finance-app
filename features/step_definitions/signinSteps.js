const { Given, When, Then } = require('cucumber');
const Login =require(app/Auth);


Given('I am on the Login page', function () {
  // Code to render or navigate to the Login page
  // Example:
  this.loginComponent = render(<Login />);
});

When('I enter valid credentials', function () {
  // Code to simulate entering credentials
  const { getByPlaceholderText } = this.loginComponent;
  fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
  fireEvent.changeText(getByPlaceholderText('Password'), 'password');
});

When('I press the signin button', function () {
  // Code to simulate pressing the signin button
  const { getByText } = this.loginComponent;
  fireEvent.press(getByText('Sign In'));
});

Then('I should see the index page', function () {
  // Code to assert that the user is on the index page
  // Example: Checking if a component specific to the index page is rendered
  const { getByText } = this.loginComponent;
//   const indexMessage = getByText('Welcome to the Index Page!');
  expect(indexMessage).to.not.be.null;
});
