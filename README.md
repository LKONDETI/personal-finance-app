# FLOWWISE - A Finance Mobile App 📊

A React Native app built with Expo for managing personal finances, budgets, and tracking expenses.

## Screenshots

### Dashboard View
<img src="./assets/screenshots/dashboard.png" width="300" alt="Dashboard Screenshot"/>
- Real-time overview of total balance
- Income and expense tracking
- Chronological list of recent transactions
- Category-based transaction organization

### Budget View
<img src="./assets/screenshots/budget.png" width="300" alt="Budget Screenshot"/>
- Interactive pie chart visualization
- Category-wise budget breakdown
- Progress bars for budget utilization
- Color-coded spending indicators

### Budget Limits
<img src="./assets/screenshots/budgetLimits.png" width="300" alt="Budget Limits Screenshot"/>
- Customizable monthly limits per category
- Easy-to-use input interface
- Visual category indicators
- Real-time limit updates

### Settings
<img src="./assets/screenshots/settings.png" width="300" alt="Settings Screenshot"/>
- App configuration options
- Budget management tools
- Category customization
- Account settings

### Payment Status
<img src="./assets/screenshots/paid.png" width="300" alt="Paid Screenshot"/>
- Transaction status tracking
- Payment confirmations
- Historical payment records

### Requests
<img src="./assets/screenshots/requests.png" width="300" alt="Requests Screenshot"/>
- Pending payment requests
- Request management
- Transaction details
- Payment scheduling

## Features

- 📈 Budget tracking with dynamic pie chart visualization
- 💰 Transaction management and categorization
- 🎯 Customizable budget limits for different categories
- 📱 Cross-platform support (iOS, Android, Web)
- 💾 Persistent storage of user preferences and budget data

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
   
2. Install required packages
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```
   
3. Start the app
   ```bash
   npx expo start
   ```

## Project Structure

- `app/` - Main application code
  - `(tabs)/` - Tab-based navigation
    - `(Budget)/` - Budget visualization and management
    - `(Transactions)/` - Transaction listing and tracking
    - `(Settings)/` - App settings and budget limits
- `data/` - JSON data files
  - `categoryMappings.json` - Category definitions and transaction mappings
  - `transactions.json` - Transaction data
- `assets/` - Images and other static assets
  - `screenshots/` - Application screenshots

## Usage

### Managing Budget Limits
1. Navigate to Settings > Budget Limits
2. Enter monthly limits for each category
3. Click "Save Limits" to store your preferences

### Viewing Transactions
- Recent transactions are automatically categorized
- View spending patterns in the Budget tab
- Track expenses against category limits

## Technologies Used

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org)

## Development

To modify category mappings or add new features:

1. Edit category definitions in `data/categoryMappings.json`
2. Update transaction data in `data/transactions.json`
3. Modify component code in the respective tab directories

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
