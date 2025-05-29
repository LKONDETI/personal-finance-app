import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddAccount from '../addAccount';
import { useRouter } from 'expo-router';

// Mock the expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AddAccount', () => {
  const mockRouter = {
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<AddAccount />);
    
    expect(getByText('Add Bank Account')).toBeTruthy();
    expect(getByPlaceholderText('Account Name')).toBeTruthy();
    expect(getByPlaceholderText('Account Number')).toBeTruthy();
    expect(getByPlaceholderText('Bank Name')).toBeTruthy();
    expect(getByPlaceholderText('Balance')).toBeTruthy();
    expect(getByText('Save')).toBeTruthy();
  });

  it('handles form submission successfully', async () => {
    const { getByText, getByPlaceholderText } = render(<AddAccount />);
    
    fireEvent.changeText(getByPlaceholderText('Account Name'), 'Test Account');
    fireEvent.changeText(getByPlaceholderText('Account Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Bank Name'), 'Test Bank');
    fireEvent.changeText(getByPlaceholderText('Balance'), '1000');

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/bank-accounts'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Account'),
        })
      );
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    const { getByText } = render(<AddAccount />);
    
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Account name is required')).toBeTruthy();
      expect(getByText('Account number is required')).toBeTruthy();
      expect(getByText('Bank name is required')).toBeTruthy();
      expect(getByText('Balance is required')).toBeTruthy();
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to save'));
    
    const { getByText, getByPlaceholderText } = render(<AddAccount />);
    
    fireEvent.changeText(getByPlaceholderText('Account Name'), 'Test Account');
    fireEvent.changeText(getByPlaceholderText('Account Number'), '1234567890');
    fireEvent.changeText(getByPlaceholderText('Bank Name'), 'Test Bank');
    fireEvent.changeText(getByPlaceholderText('Balance'), '1000');

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Failed to save account')).toBeTruthy();
    });
  });

  it('navigates back when cancel is pressed', () => {
    const { getByText } = render(<AddAccount />);
    
    fireEvent.press(getByText('Cancel'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('validates account number format', async () => {
    const { getByText, getByPlaceholderText } = render(<AddAccount />);
    
    fireEvent.changeText(getByPlaceholderText('Account Number'), '123');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Account number must be at least 10 digits')).toBeTruthy();
    });
  });

  it('validates balance format', async () => {
    const { getByText, getByPlaceholderText } = render(<AddAccount />);
    
    fireEvent.changeText(getByPlaceholderText('Balance'), 'invalid');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Balance must be a valid number')).toBeTruthy();
    });
  });
}); 