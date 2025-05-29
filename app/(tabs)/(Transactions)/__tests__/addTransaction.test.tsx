import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddTransaction from '../addTransaction';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AddTransaction', () => {
  const mockRouter = {
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ 
      accountId: '1',
      party_id: '1'
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<AddTransaction />);
    
    expect(getByText('Add Transaction')).toBeTruthy();
    expect(getByPlaceholderText('Amount')).toBeTruthy();
    expect(getByPlaceholderText('Description')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });

  it('handles form submission successfully', async () => {
    const { getByText, getByPlaceholderText } = render(<AddTransaction />);
    
    fireEvent.changeText(getByPlaceholderText('Amount'), '100.50');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Grocery Shopping');
    fireEvent.press(getByText('Expense')); // Select transaction type

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/transactions'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Grocery Shopping'),
        })
      );
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    const { getByText } = render(<AddTransaction />);
    
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Amount is required')).toBeTruthy();
      expect(getByText('Description is required')).toBeTruthy();
    });
  });

  it('validates amount format', async () => {
    const { getByText, getByPlaceholderText } = render(<AddTransaction />);
    
    fireEvent.changeText(getByPlaceholderText('Amount'), 'invalid');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Amount must be a valid number')).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to save'));
    
    const { getByText, getByPlaceholderText } = render(<AddTransaction />);
    
    fireEvent.changeText(getByPlaceholderText('Amount'), '100.50');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Grocery Shopping');
    fireEvent.press(getByText('Expense'));

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Failed to save transaction')).toBeTruthy();
    });
  });

  it('navigates back when cancel is pressed', () => {
    const { getByText } = render(<AddTransaction />);
    
    fireEvent.press(getByText('Cancel'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('toggles between income and expense', () => {
    const { getByText } = render(<AddTransaction />);
    
    // Initially expense is selected
    expect(getByText('Expense')).toHaveStyle({ backgroundColor: expect.any(String) });
    
    // Toggle to income
    fireEvent.press(getByText('Income'));
    expect(getByText('Income')).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('formats amount input correctly', async () => {
    const { getByPlaceholderText } = render(<AddTransaction />);
    const amountInput = getByPlaceholderText('Amount');
    
    fireEvent.changeText(amountInput, '1000.50');
    expect(amountInput.props.value).toBe('1000.50');
  });
}); 