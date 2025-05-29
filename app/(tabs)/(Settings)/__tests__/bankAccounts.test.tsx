import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BankAccounts from '../bankAccounts';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('BankAccounts', () => {
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn(),
  };

  const mockAccounts = [
    {
      id: 1,
      account_name: 'Checking Account',
      account_number: '1234567890',
      balance: 1000,
      currency: 'USD',
      bank_name: 'Chase',
      available_balance: 950
    },
    {
      id: 2,
      account_name: 'Savings Account',
      account_number: '0987654321',
      balance: 5000,
      currency: 'USD',
      bank_name: 'Bank of America',
      available_balance: 5000
    }
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ party_id: '1' });
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(mockAccounts)
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with accounts', async () => {
    const { getByText, getAllByText } = render(<BankAccounts />);
    
    expect(getByText('Bank Accounts')).toBeTruthy();
    expect(getByText('Add Account')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Checking Account')).toBeTruthy();
      expect(getByText('Savings Account')).toBeTruthy();
      expect(getAllByText('Available balance')).toHaveLength(2);
    });
  });

  it('shows loading state initially', () => {
    const { getByTestId } = render(<BankAccounts />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('shows empty state when no accounts', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve([])
    });

    const { getByText } = render(<BankAccounts />);
    
    await waitFor(() => {
      expect(getByText('No bank accounts added yet')).toBeTruthy();
      expect(getByText('Add your first bank account to start tracking your finances')).toBeTruthy();
    });
  });

  it('navigates to add account screen', () => {
    const { getByText } = render(<BankAccounts />);
    
    fireEvent.press(getByText('Add Account'));
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/(Settings)/addAccount');
  });

  it('navigates to dashboard when account is pressed', async () => {
    const { getByText } = render(<BankAccounts />);
    
    await waitFor(() => {
      fireEvent.press(getByText('Checking Account'));
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/(tabs)/(Transactions)/dashboard',
        params: { accountId: 1, party_id: '1' }
      });
    });
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    const { getByText } = render(<BankAccounts />);
    
    await waitFor(() => {
      expect(getByText('No bank accounts added yet')).toBeTruthy();
    });
  });

  it('displays account balances correctly', async () => {
    const { getByText } = render(<BankAccounts />);
    
    await waitFor(() => {
      expect(getByText('$950.00')).toBeTruthy(); // Available balance for Checking
      expect(getByText('$5000.00')).toBeTruthy(); // Available balance for Savings
    });
  });
}); 