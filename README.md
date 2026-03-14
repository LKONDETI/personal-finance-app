# MOBILE BANKING APP WITH AI 

A React Native app built with Expo for managing personal finances, tracking expenses, and managing bank accounts with a modern, intuitive interface. The app integrates with a robust .NET 9.0 backend and PostgreSQL database for secure data management and real-time updates.
<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 15px; justify-content: center;">
   <img src="./assets/screenshots/IMG_5432.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5433.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5434.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5435.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5436.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5437.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5438.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5439.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5440.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5441.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5442.PNG" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5443.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5444.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5445.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5446.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5447.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5448.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5449.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5450.jpg" width="230" alt="App Screenshot"/>
   <img src="./assets/screenshots/IMG_5451.jpg" width="230" alt="App Screenshot"/>
</div>

## Features

### Dashboard
- 📊 Overview of all bank accounts
- 💳 Quick access to account balances
- 📈 Recent transactions summary
- 🔄 Real-time balance updates
- 🔐 Secure user authentication
- 👤 User-specific data with party_id
- 🎯 Clean, modern UI with intuitive navigation

### Budget Management
- 📈 Interactive pie chart visualization
- 🎯 Category-based spending tracking
- 💰 Customizable budget limits
- 🚨 Visual alerts for over-budget categories
- 📊 Detailed spending breakdown
- 🔄 Real-time budget updates
- 🎨 Color-coded status indicators

### Bank Accounts
- 🏦 Multiple account support
- 💳 Account balance tracking
- 🔄 Transaction history
- 📱 Easy account management
- 🔒 Secure account information
- ➕ Add new accounts functionality
- 🔍 Detailed account views

### Transactions
- 📝 Detailed transaction history
- 🏷️ Automatic categorization
- 🔍 Search and filter capabilities
- 📅 Date-based organization
- 💰 Amount tracking
- 🔄 Real-time transaction updates
- 📱 Responsive transaction list

### Payment Requests (Bills)
- 🧾 View pending and paid bills
- 💵 Pay in full directly from selected accounts
- ✂️ Make partial payments effortlessly
- ❌ Decline requests with confirmation
- 🔔 Due date badges and visual tracking

### Loans
- 💵 Overview of active, pending, and completed loans
- 📊 Detailed loan information (Outstanding Balance, Monthly Payment, Interest Rate)
- 📝 Loan application logic 
- ⏪ Soft-delete / Withdraw functionality for pending applications
- 🔔 Important reminders for upcoming loan payments

### Settings
- 👤 Personal Information management
- 🏦 Bank account management
- 💰 Budget limits configuration (with Upsert logic)
- 🔔 Notification preferences with modal interface
- 🔒 Security settings with **Change Password** capabilities
- 👁️ **Privacy Mode**: Globally mask sensitive financial balances
- 💬 AI Chatbot support
- 🎨 Modern, intuitive UI
- 🔄 Seamless navigation

## Getting Started

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd pf-app
   ```

2. Start the backend with Docker
   This will spin up the PostgreSQL database and the .NET 9.0 API, running any EF Core migrations and seeding the database.
   ```bash
   docker compose up -d --build
   ```
   *The backend will be available at http://localhost:5200. You can view the API documentation at http://localhost:5200/swagger*

3. Install frontend dependencies
   ```bash
   npm install
   ```

4. Start the React Native / Expo development server
   ```bash
   npx expo start
   ```

## Project Structure

```
pf-app/
├── app/
│   ├── (tabs)/
│   │   ├── (Budget)/
│   │   │   └── budget.tsx
│   │   ├── (Transactions)/
│   │   │   ├── dashboard.tsx
│   │   │   └── accountDetails.tsx
│   │   └── (Settings)/
│   │       ├── settings.tsx
│   │       ├── bankAccounts.tsx
│   │       ├── addAccount.tsx
│   │       └── budgetLimits.tsx
├── __tests__/
│   ├── components/
│   │   ├── BudgetView.test.tsx
│   │   ├── BankAccounts.test.tsx
│   │   ├── AddAccount.test.tsx
│   │   ├── Dashboard.test.tsx
│   │   └── AddTransaction.test.tsx
├── data/
│   ├── categoryMappings.json
│   └── transactions.json
└── assets/
    └── screenshots/
```

## Testing

The project uses Jest for testing. To run tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test/file.test.tsx

# Run tests in watch mode
npm test -- --watch
```

## Key Components

### Budget Management
- Dynamic pie chart visualization
- Category-based spending tracking
- Progress bars for budget limits
- Color-coded status indicators
- Real-time updates from backend
- Interactive category management

### Bank Account Management
- Account creation and management
- Balance tracking
- Transaction history
- Secure account information
- Party-specific account views
- Modern card-based UI

### Settings
- Budget limit configuration
- Account management
- Category customization
- App preferences
- User profile management
- Modal-based notifications
- Advanced Security Settings (Change Password)
- Privacy Mode (Masking sensitive information)
- AI-powered chatbot support

## Technologies Used

- [Expo](https://expo.dev) - React Native framework
- [React Native](https://reactnative.dev) - Mobile app development
- [NativeWind](https://www.nativewind.dev) - Styling
- [React Native SVG](https://github.com/react-native-svg/react-native-svg) - Chart visualization
- [.NET 9.0 API](https://dotnet.microsoft.com/) - Restful Backend API
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Relational Database
- [Docker](https://www.docker.com/) - Containerization
- [Jest](https://jestjs.io) - Testing framework
- [Expo Router](https://docs.expo.dev/router/introduction/) - Navigation
- [Lucide React Native](https://lucide.dev) - Icon library

## Development

### Adding New Features
1. Create new components in the appropriate directory
2. Update the navigation structure if needed
3. Add any required data to the JSON files
4. Write tests for new components
5. Test thoroughly on both iOS and Android
6. Follow the established UI/UX patterns

### Backend Integration
1. All API calls use the correct port (8000)
2. Party ID is passed through navigation
3. Error handling for API calls
4. Secure authentication flow
5. Proper error state management

### Styling
- Uses NativeWind for styling
- Follows the existing design system
- Maintains consistent spacing and typography
- Responsive design for all screen sizes
- Modern modal interfaces
- Consistent color scheme

## Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for new features
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
