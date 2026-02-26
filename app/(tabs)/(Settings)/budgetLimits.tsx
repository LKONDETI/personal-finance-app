import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import { budgets as budgetsApi, Budget } from "@/services/api";
import categoryMappings from "@/data/categoryMappings.json";

// A merged row: a category from the local JSON merged with a budget (if one exists on the backend)
interface BudgetRow {
  category: string;
  color: string;
  budget: Budget | null;       // null = no backend budget yet
  limitInput: string;          // what the user has typed in the text box
  isDirty: boolean;            // has the user changed the value?
}

const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

export default function BudgetLimits() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const serverBudgets = await budgetsApi.getAll();

      // Merge: every category from mappings gets a row. If the backend has a matching
      // budget for this category (current month/year), attach it.
      const merged: BudgetRow[] = categoryMappings.categories.map((cat) => {
        const existing = serverBudgets.find(
          (b) =>
            b.category.toLowerCase() === cat.label.toLowerCase() &&
            b.month === CURRENT_MONTH &&
            b.year === CURRENT_YEAR
        );
        return {
          category: cat.label,
          color: cat.color,
          budget: existing ?? null,
          limitInput: existing ? String(existing.monthlyLimit) : "",
          isDirty: false,
        };
      });

      setRows(merged);
    } catch (err) {
      console.error("Error loading budgets:", err);
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleLimitChange = (index: number, value: string) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], limitInput: value, isDirty: true };
      return updated;
    });
  };

  const handleDelete = (index: number) => {
    const row = rows[index];
    if (!row.budget) return; // nothing to delete

    Alert.alert(
      "Remove Budget Limit",
      `Remove the monthly limit for "${row.category}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await budgetsApi.delete(row.budget!.id);
              setRows((prev) => {
                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  budget: null,
                  limitInput: "",
                  isDirty: false,
                };
                return updated;
              });
            } catch {
              Alert.alert("Error", "Failed to remove budget limit.");
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.isDirty && r.limitInput.trim() !== "");
    if (dirtyRows.length === 0) {
      Alert.alert("No changes", "No budget limits were changed.");
      return;
    }

    setSaving(true);
    try {
      // Run all updates/creates in parallel
      await Promise.all(
        dirtyRows.map(async (row) => {
          const monthlyLimit = parseFloat(row.limitInput);
          if (isNaN(monthlyLimit) || monthlyLimit <= 0) return;

          if (row.budget) {
            // Update existing
            await budgetsApi.update(row.budget.id, { monthlyLimit });
          } else {
            // Create new
            await budgetsApi.create({
              category: row.category,
              monthlyLimit,
              month: CURRENT_MONTH,
              year: CURRENT_YEAR,
            });
          }
        })
      );

      Alert.alert("Saved!", "Your budget limits have been updated.");
      // Reload fresh data from backend
      await loadBudgets();
    } catch (err) {
      Alert.alert("Error", "Failed to save some budget limits. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View
        className="p-4 flex-row items-center justify-between border-b border-gray-100"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2 border border-gray-200"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4">Budget Limits</Text>
        </View>
        <Text className="text-gray-400 text-sm">
          {new Date().toLocaleString("default", { month: "long" })} {CURRENT_YEAR}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#4B7BF5" />
        </View>
      ) : error ? (
        <View className="items-center justify-center py-16 px-6">
          <Text className="text-red-500 text-base mb-4 text-center">{error}</Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-2 rounded-full"
            onPress={loadBudgets}
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Budget Rows */}
          <View className="p-4">
            {rows.map((row, index) => {
              const limit = parseFloat(row.limitInput) || 0;
              const spent = row.budget?.currentSpending ?? 0;
              const isOver = limit > 0 && spent >= limit;
              const progressPct = limit > 0 ? Math.min(spent / limit, 1) : 0;

              return (
                <View
                  key={row.category}
                  className="mb-5 bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  {/* Row header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <Text className="text-lg font-semibold">{row.category}</Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                      {/* Spent / limit summary */}
                      {row.budget && (
                        <Text
                          className={`text-sm font-medium ${isOver ? "text-red-500" : "text-gray-500"}`}
                        >
                          ${spent.toFixed(0)} spent
                        </Text>
                      )}
                      {/* Delete button — only shown when budget exists */}
                      {row.budget && (
                        <TouchableOpacity onPress={() => handleDelete(index)}>
                          <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Progress bar (only when a limit is set) */}
                  {row.budget && limit > 0 && (
                    <View className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPct * 100}%`,
                          backgroundColor: isOver ? "#EF4444" : row.color,
                        }}
                      />
                    </View>
                  )}

                  {/* Monthly limit input */}
                  <Text className="text-gray-600 text-sm mb-1">Monthly Limit</Text>
                  <View className="flex-row items-center bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <Text className="text-lg text-gray-500 mr-1">$</Text>
                    <TextInput
                      className="text-lg flex-1 py-0 h-8 mt-0 leading-tight"
                      keyboardType="numeric"
                      value={row.limitInput}
                      onChangeText={(v) => handleLimitChange(index, v)}
                      placeholder="No limit set"
                      placeholderTextColor="#9CA3AF"
                    />
                    {row.isDirty && (
                      <Text className="text-blue-500 text-xs font-medium ml-1">
                        edited
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Save button */}
          <View className="px-4 pb-8">
            <TouchableOpacity
              className={`py-4 rounded-xl ${saving ? "bg-blue-300" : "bg-blue-500"}`}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Save Limits
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}
