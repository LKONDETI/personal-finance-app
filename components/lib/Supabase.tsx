import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://wbzryejjnycaxvnzynhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndienJ5ZWpqbnljYXh2bnp5bmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4ODQwMTAsImV4cCI6MjAyMzQ2MDAxMH0.h7LIX7BcKIb-taVwSjMXTDSScJIjVPoQYAShXojO7gg';

// Creating a custom storage object
const customStorage = {
  async getItem(key: string) {
    try {
      return await AsyncStorage.getItem(key)
    } catch (e) {
      return null
    }
  },
  async setItem(key: string, value: string) {
    try {
      return await AsyncStorage.setItem(key, value)
    } catch (e) {
      return null
    }
  },
  async removeItem(key: string) {
    try {
      return await AsyncStorage.removeItem(key)
    } catch (e) {
      return null
    }
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

//export const supabase = createClient(supabaseUrl, supabaseAnonKey);
//export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//    auth: {
//      storage: AsyncStorage,
//      autoRefreshToken: true,
//      persistSession: true,
//      detectSessionInUrl: false,
//    },
//  })
