import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BudgetItem {
  label: string;
  color: string;
  value: number;
  amount: string;
  status: string;
  textColor?: string;
  limit: string;
  spent: string;
}

const BUDGET_DATA_KEY = 'budget_data';

export const getInitialBudgetData = (): BudgetItem[] => [
  { 
    label: "Food", 
    color: "#4285F4", 
    value: 0.2, 
    amount: "$100 / $300", 
    status: "Under",
    limit: "300",
    spent: "100"
  },
  { 
    label: "Rent", 
    color: "#8AB4F8", 
    value: 0.4, 
    amount: "$1,200 / $1,200", 
    status: "On track",
    limit: "1200",
    spent: "1200"
  },
  { 
    label: "Entertainment", 
    color: "#F25C54", 
    value: 0.15, 
    amount: "$250 / $300", 
    status: "Over", 
    textColor: "text-red-500",
    limit: "300",
    spent: "250"
  },
  { 
    label: "Other", 
    color: "#9AA0A6", 
    value: 0.25, 
    amount: "$400 / $500", 
    status: "Under",
    limit: "500",
    spent: "400"
  },
];

export const saveBudgetData = async (data: BudgetItem[]) => {
  try {
    await AsyncStorage.setItem(BUDGET_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving budget data:', error);
  }
};

export const loadBudgetData = async (): Promise<BudgetItem[]> => {
  try {
    const data = await AsyncStorage.getItem(BUDGET_DATA_KEY);
    return data ? JSON.parse(data) : getInitialBudgetData();
  } catch (error) {
    console.error('Error loading budget data:', error);
    return getInitialBudgetData();
  }
}; 