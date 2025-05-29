import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dashboard from '../dashboard';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Dashboard', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  const mockTransactions = [
    {
      id: 1,
      amount: 100.50,
      description: 'Grocery Shopping',
      date: '2024-03-20',
      category: 'Food',
      type: 'expense'
    },
    {
      id: 2,
      amount: 2000.00,
      description: 'Salary',
      date: '2024-03-19',
      category: 'Income',
      type: 'income'
    }
  ];

  const mockAccount = {
    id: 1,
    account_name: 'Checking Account',
    balance: 5000.00,
    available_balance: 4800.00
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ 
      accountId: '1',
      party_id: '1'
    });
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/transactions')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockTransactions)
        });
      }
      if (url.includes('/bank-accounts')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockAccount)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with account and transactions', async () => {
    const { getByText, getAllByText } = render(<Dashboard />);
    
    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Add Transaction')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Checking Account')).toBeTruthy();
      expect(getByText('$5,000.00')).toBeTruthy(); // Balance
      expect(getByText('$4,800.00')).toBeTruthy(); // Available balance
      expect(getByText('Grocery Shopping')).toBeTruthy();
      expect(getByText('Salary')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    const { getByTestId } = render(<Dashboard />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('navigates to add transaction screen', () => {
    const { getByText } = render(<Dashboard />);
    
    fireEvent.press(getByText('Add Transaction'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/(tabs)/(Transactions)/addTransaction',
      params: { accountId: '1', party_id: '1' }
    });
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    const { getByText } = render(<Dashboard />);
    
    await waitFor(() => {
      expect(getByText('Failed to load transactions')).toBeTruthy();
    });
  });

  it('displays transaction amounts correctly', async () => {
    const { getByText } = render(<Dashboard />);
    
    await waitFor(() => {
      expect(getByText('-$100.50')).toBeTruthy(); // Expense
      expect(getByText('+$2,000.00')).toBeTruthy(); // Income
    });
  });

  it('filters transactions by type', async () => {
    const { getByText, queryByText } = render(<Dashboard />);
    
    await waitFor(() => {
      // Initially shows all transactions
      expect(getByText('Grocery Shopping')).toBeTruthy();
      expect(getByText('Salary')).toBeTruthy();

      // Filter expenses
      fireEvent.press(getByText('Expenses'));
      expect(getByText('Grocery Shopping')).toBeTruthy();
      expect(queryByText('Salary')).toBeNull();

      // Filter income
      fireEvent.press(getByText('Income'));
      expect(queryByText('Grocery Shopping')).toBeNull();
      expect(getByText('Salary')).toBeTruthy();
    });
  });

  it('calculates total balance correctly', async () => {
    const { getByText } = render(<Dashboard />);
    
    await waitFor(() => {
      const totalIncome = mockTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = mockTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      expect(getByText(`Total Income: $${totalIncome.toFixed(2)}`)).toBeTruthy();
      expect(getByText(`Total Expenses: $${totalExpenses.toFixed(2)}`)).toBeTruthy();
    });
  });
}); 