import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BudgetView from '../budget';
import { useRouter, useLocalSearchParams } from 'expo-router';
import categoryMappings from '@/data/categoryMappings.json';
import transactionsData from '@/data/transactions.json';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
}));

// Mock the SVG components
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Path: 'Path',
  G: 'G',
  Text: 'Text',
}));

describe('BudgetView', () => {
  const mockRouter = {
    back: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ party_id: '1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with party_id', () => {
    const { getByText } = render(<BudgetView />);
    
    expect(getByText('Budget')).toBeTruthy();
    expect(getByText('Total Spent: $0.00')).toBeTruthy();
  });

  it('redirects when no party_id is provided', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ party_id: null });
    
    render(<BudgetView />);
    
    expect(mockRouter.replace).toHaveBeenCalledWith({
      pathname: '/(tabs)/(Budget)/budget',
      params: { party_id: 1 }
    });
  });

  it('calculates total spent correctly', async () => {
    const { getByText } = render(<BudgetView />);
    
    // Wait for the transactions to be processed
    await waitFor(() => {
      const totalSpent = transactionsData.transactions.reduce((sum, txn) => 
        sum + parseFloat(txn.amount), 0
      );
      expect(getByText(`Total Spent: $${totalSpent.toFixed(2)}`)).toBeTruthy();
    });
  });

  it('displays budget categories correctly', async () => {
    const { getByText } = render(<BudgetView />);
    
    await waitFor(() => {
      categoryMappings.categories.forEach(category => {
        expect(getByText(category.label)).toBeTruthy();
      });
    });
  });

  it('handles category selection', async () => {
    const { getByText } = render(<BudgetView />);
    
    await waitFor(() => {
      const firstCategory = categoryMappings.categories[0];
      fireEvent.press(getByText(firstCategory.label));
      // Add assertions for selection behavior
    });
  });

  it('displays progress bars for each category', async () => {
    const { getAllByTestId } = render(<BudgetView />);
    
    await waitFor(() => {
      const progressBars = getAllByTestId('progress-bar');
      expect(progressBars.length).toBe(categoryMappings.categories.length);
    });
  });
}); 