import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, FlatList
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { Settings, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react-native';
import { accounts, transactions, budgets } from '@/services/api';
import type { Transaction, Budget, Account } from '@/services/api';
import categoryMappings from '@/data/categoryMappings.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryData {
  label: string;
  color: string;
  spent: number;
  limit: number;
  budgetId: number | null;
  transactions: Transaction[];
  startAngle: number;
  endAngle: number;
}

// ─── Pie slice ─────────────────────────────────────────────────────────────────

const PieSlice = ({
  cx, cy, radius, startAngle, endAngle, color, isActive, onPress,
}: {
  cx: number; cy: number; radius: number;
  startAngle: number; endAngle: number;
  color: string; isActive: boolean; onPress: () => void;
}) => {
  const r = isActive ? radius + 8 : radius;
  const largeArc = endAngle - startAngle > Math.PI ? '1' : '0';
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  return <Path d={d} fill={color} opacity={isActive ? 1 : 0.78} onPress={onPress} />;
};

// ─── Main component ────────────────────────────────────────────────────────────

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();
const MONTH_NAME = new Date().toLocaleString('default', { month: 'long' });

export default function BudgetView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { party_id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>([]);
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const [showUncategorized, setShowUncategorized] = useState(false);

  // ── Fetch data ────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [accs, budgetData] = await Promise.all([
          accounts.getAll(),
          budgets.getAll(),
        ]);

        setSavedBudgets(budgetData);

        // Fetch transactions for all accounts in parallel
        const txArrays = await Promise.all(
          accs.map((acc: Account) => transactions.getAll(acc.id).catch(() => [] as Transaction[]))
        );
        setAllTransactions(txArrays.flat());
      } catch (err) {
        console.error('Budget load error:', err);
        setError('Failed to load budget data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const currentMonthTx = useMemo(() =>
    allTransactions.filter(tx => {
      const date = new Date(tx.transactionTime ?? tx.transactionDate ?? tx.createdAt);
      return date.getMonth() + 1 === CURRENT_MONTH && date.getFullYear() === CURRENT_YEAR;
    }),
    [allTransactions]
  );

  const debitTx = useMemo(() => currentMonthTx.filter(tx => tx.transactionType === 'Debit'), [currentMonthTx]);
  const creditTx = useMemo(() => currentMonthTx.filter(tx => tx.transactionType === 'Credit'), [currentMonthTx]);

  const totalIncome = useMemo(() => creditTx.reduce((s, tx) => s + tx.amount, 0), [creditTx]);
  const totalExpenses = useMemo(() => debitTx.reduce((s, tx) => s + tx.amount, 0), [debitTx]);

  // Categorize debit transactions
  const { categorized, uncategorized } = useMemo(() => {
    const catMap: Record<string, Transaction[]> = {};
    const uncat: Transaction[] = [];

    categoryMappings.categories.forEach(c => { catMap[c.label] = []; });

    debitTx.forEach(tx => {
      const desc = (tx.description ?? '').toLowerCase();
      const match = categoryMappings.categories.find(cat =>
        cat.transactions.some(kw => desc.includes(kw.toLowerCase()))
      );
      if (match) {
        catMap[match.label].push(tx);
      } else {
        uncat.push(tx);
      }
    });

    return { categorized: catMap, uncategorized: uncat };
  }, [debitTx]);

  // Build per-category data with angles
  const categoryData: CategoryData[] = useMemo(() => {
    const items = categoryMappings.categories.map(cat => {
      const txs = categorized[cat.label] ?? [];
      const spent = txs.reduce((s, tx) => s + tx.amount, 0);
      const savedBudget = savedBudgets.find(
        b => b.category.toLowerCase() === cat.label.toLowerCase() &&
          b.month === CURRENT_MONTH && b.year === CURRENT_YEAR
      );
      const limit = savedBudget?.monthlyLimit ?? parseFloat(cat.limit);
      return {
        label: cat.label, color: cat.color, spent, limit,
        budgetId: savedBudget?.id ?? null,
        transactions: txs,
        startAngle: 0, endAngle: 0,
      };
    });

    // Assign pie angles
    const totalSpent = items.reduce((s, i) => s + i.spent, 0);
    let angle = -Math.PI / 2;
    return items.map(item => {
      const slice = totalSpent > 0 ? (item.spent / totalSpent) * 2 * Math.PI : 0;
      const start = angle;
      angle += slice;
      return { ...item, startAngle: start, endAngle: angle };
    });
  }, [categorized, savedBudgets]);

  const overBudgetCategories = categoryData.filter(c => c.spent > c.limit && c.limit > 0);
  const totalSpent = categoryData.reduce((s, c) => s + c.spent, 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white px-5 pb-4 border-b border-gray-100"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold">Budget</Text>
            <Text className="text-gray-400 text-sm">{MONTH_NAME} {CURRENT_YEAR}</Text>
          </View>
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2 border border-gray-200"
            onPress={() => router.push('/(tabs)/(Settings)/budgetLimits' as any)}
          >
            <Settings size={22} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-24">
          <ActivityIndicator size="large" color="#4B7BF5" />
        </View>
      ) : error ? (
        <View className="items-center justify-center py-20 px-6">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
        </View>
      ) : (
        <>
          {/* ── Feature 6 — Income vs Expense ── */}
          <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <Text className="text-base font-semibold text-gray-700 mb-3">This Month</Text>
            <View className="flex-row justify-between">
              <View className="flex-1 items-center bg-green-50 rounded-xl py-3 mr-2">
                <Text className="text-xs text-green-600 font-medium mb-1">Income</Text>
                <Text className="text-lg font-bold text-green-700">${totalIncome.toFixed(2)}</Text>
              </View>
              <View className="flex-1 items-center bg-red-50 rounded-xl py-3 ml-2">
                <Text className="text-xs text-red-500 font-medium mb-1">Expenses</Text>
                <Text className="text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</Text>
              </View>
            </View>
            {/* Net bar */}
            <View className="mt-3">
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${totalIncome > 0 ? Math.min((totalIncome - totalExpenses) / totalIncome * 100, 100) : 0}%` }}
                />
              </View>
              <Text className="text-xs text-gray-400 mt-1 text-right">
                Net: {totalIncome - totalExpenses >= 0 ? '+' : ''}${(totalIncome - totalExpenses).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* ── Feature 3 — Over-Budget Alert Banner ── */}
          {overBudgetCategories.length > 0 && (
            <View className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-2xl p-4 flex-row items-start">
              <AlertTriangle size={20} color="#EF4444" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-red-700">Over Budget!</Text>
                <Text className="text-red-600 text-sm mt-0.5">
                  {overBudgetCategories.map(c => c.label).join(', ')} exceeded {overBudgetCategories.length > 1 ? 'their limits' : 'its limit'} this month.
                </Text>
              </View>
            </View>
          )}

          {/* ── Pie Chart ── */}
          {totalSpent > 0 && (
            <View className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm items-center py-6">
              <Text className="text-base font-semibold text-gray-700 mb-4">Spending Breakdown</Text>
              <View style={{ position: 'relative' }}>
                <Svg height={220} width={220} viewBox="-110 -110 220 220">
                  <G>
                    {categoryData.filter(c => c.spent > 0).map((item, i) => (
                      <PieSlice
                        key={item.label}
                        cx={0} cy={0} radius={88}
                        startAngle={item.startAngle}
                        endAngle={item.endAngle}
                        color={item.color}
                        isActive={activeSlice === i}
                        onPress={() => setActiveSlice(activeSlice === i ? null : i)}
                      />
                    ))}
                    {/* Center donut hole */}
                    <Circle cx={0} cy={0} r={48} fill="white" />
                  </G>
                </Svg>
                {/* Center text */}
                <View
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  <Text className="text-xs text-gray-400">Spent</Text>
                  <Text className="text-base font-bold text-gray-800">${totalSpent.toFixed(0)}</Text>
                </View>
              </View>

              {/* Legend */}
              <View className="flex-row flex-wrap justify-center gap-2 mt-4 px-4">
                {categoryData.filter(c => c.spent > 0).map((item, i) => (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => setActiveSlice(activeSlice === i ? null : i)}
                    className="flex-row items-center px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: activeSlice === i ? item.color + '22' : '#F9FAFB',
                      borderWidth: 1,
                      borderColor: activeSlice === i ? item.color : '#E5E7EB',
                    }}
                  >
                    <View className="h-2.5 w-2.5 rounded-full mr-1.5" style={{ backgroundColor: item.color }} />
                    <Text className="text-xs font-medium" style={{ color: activeSlice === i ? item.color : '#4B5563' }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* ── Category Progress Bars ── */}
          <View className="mx-4 mt-4 mb-2">
            <Text className="text-base font-semibold text-gray-700 mb-3">Categories</Text>
            {categoryData.map((item, i) => {
              const progress = item.limit > 0 ? Math.min(item.spent / item.limit, 1) : 0;
              const isOver = item.spent > item.limit && item.limit > 0;
              const isSelected = activeSlice === i;
              const pct = item.limit > 0 ? ((item.spent / item.limit) * 100).toFixed(0) : '—';

              return (
                <TouchableOpacity
                  key={item.label}
                  className="mb-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                  style={{ opacity: activeSlice !== null && !isSelected ? 0.55 : 1 }}
                  onPress={() => setActiveSlice(isSelected ? null : i)}
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                      <Text className="font-semibold text-gray-800">{item.label}</Text>
                    </View>
                    <Text className={`text-xs font-semibold ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
                      {pct}% {isOver ? '🔴 Over' : 'of limit'}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${progress * 100}%`, backgroundColor: isOver ? '#EF4444' : item.color }}
                    />
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">Spent: <Text className="font-medium text-gray-700">${item.spent.toFixed(2)}</Text></Text>
                    <Text className="text-xs text-gray-500">Limit: <Text className="font-medium text-gray-700">${item.limit.toFixed(2)}</Text></Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Feature 4 — Uncategorized Transactions ── */}
          {uncategorized.length > 0 && (
            <View className="mx-4 mt-2 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-4"
                onPress={() => setShowUncategorized(v => !v)}
              >
                <View className="flex-row items-center">
                  <View className="bg-orange-100 rounded-full p-2 mr-3">
                    <AlertTriangle size={16} color="#F97316" />
                  </View>
                  <View>
                    <Text className="font-semibold text-gray-800">Uncategorized</Text>
                    <Text className="text-xs text-gray-400">{uncategorized.length} transaction{uncategorized.length > 1 ? 's' : ''} not matched</Text>
                  </View>
                </View>
                {showUncategorized
                  ? <ChevronDown size={18} color="#9CA3AF" />
                  : <ChevronRight size={18} color="#9CA3AF" />
                }
              </TouchableOpacity>

              {showUncategorized && (
                <View className="border-t border-gray-100">
                  {uncategorized.map((tx, i) => (
                    <View key={tx.id} className={`flex-row items-center justify-between px-4 py-3 ${i < uncategorized.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <View className="flex-1 mr-3">
                        <Text className="text-sm font-medium text-gray-700" numberOfLines={1}>{tx.description || '—'}</Text>
                        <Text className="text-xs text-gray-400">
                          {new Date(tx.transactionTime ?? tx.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-red-500">-${tx.amount.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {uncategorized.length === 0 && <View className="h-6" />}
        </>
      )}
    </ScrollView>
  );
}
