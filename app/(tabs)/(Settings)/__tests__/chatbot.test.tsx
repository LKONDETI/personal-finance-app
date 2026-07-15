import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Chatbot from '../chatbot';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock the entire api service module so no real HTTP calls are made
jest.mock('@/services/api', () => ({
  aiAdvisor: {
    ask: jest.fn(),
  },
}));

// Import AFTER mocking so we get the mocked version
import { aiAdvisor } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockAsk = aiAdvisor.ask as jest.Mock;

const MOCK_RESPONSE = {
  answer: "Here is your financial summary for the last 3 months.",
  isMockResponse: true,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Test 1: Happy path — mock response displays correctly ─────────────────

  it('sends a message and displays the bot response with a demo badge', async () => {
    mockAsk.mockResolvedValueOnce(MOCK_RESPONSE);

    const { getByTestId, getByText, queryByTestId } = render(<Chatbot />);

    // Type a question
    const input = getByTestId('chat-input');
    fireEvent.changeText(input, 'How am I doing this month?');

    // Press Send
    const sendBtn = getByTestId('send-button');
    fireEvent.press(sendBtn);

    // Loading indicator should appear while waiting
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).not.toBeNull();
    });

    // Wait for bot response to appear
    await waitFor(() => {
      expect(getByText(MOCK_RESPONSE.answer)).toBeTruthy();
    });

    // Demo badge should be visible because isMockResponse = true
    expect(queryByTestId('mock-badge-0')).not.toBeNull();

    // api.ask was called with the exact question
    expect(mockAsk).toHaveBeenCalledTimes(1);
    expect(mockAsk).toHaveBeenCalledWith('How am I doing this month?');
  });

  // ── Test 2: Error handling — network failure shows fallback message ────────

  it('shows an error message in the bot bubble when the API call fails', async () => {
    mockAsk.mockRejectedValueOnce(new Error('Network Error'));

    const { getByTestId, getByText, queryByTestId } = render(<Chatbot />);

    fireEvent.changeText(getByTestId('chat-input'), 'What is my balance?');
    fireEvent.press(getByTestId('send-button'));

    await waitFor(() => {
      expect(
        getByText("I'm having trouble connecting right now. Please check your connection and try again.")
      ).toBeTruthy();
    });

    // No demo badge on error responses
    expect(queryByTestId('mock-badge-0')).toBeNull();

    // api.ask was still called once
    expect(mockAsk).toHaveBeenCalledTimes(1);
  });
});
