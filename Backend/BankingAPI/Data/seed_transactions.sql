-- ============================================================
-- Seed: 3 months of realistic transactions for User 1 (John Doe)
-- Accounts: 1 (Checking), 2 (Savings)
-- Period: May, June, July 2026
-- TransactionType: 0=Debit, 1=Credit
-- Status: 1=Completed
-- ============================================================

-- ── MAY 2026 ─────────────────────────────────────────────────

-- Income / Salary
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 1, 4850.00, 'USD', 'Salary',      'Monthly salary deposit',         '2026-05-01 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 1, 320.00,  'USD', 'Income',      'Freelance project payment',       '2026-05-10 14:30:00+00', 1, NOW(), NOW());

-- Rent
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 1800.00, 'USD', 'Rent',        'May rent payment',                '2026-05-01 10:00:00+00', 1, NOW(), NOW());

-- Groceries
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 127.45, 'USD', 'Groceries',   'Whole Foods weekly shop',          '2026-05-04 11:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 89.20,  'USD', 'Groceries',   'Trader Joe weekly shop',           '2026-05-11 12:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 143.80, 'USD', 'Groceries',   'Costco bulk buy',                  '2026-05-19 13:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 72.60,  'USD', 'Groceries',   'Whole Foods top-up',               '2026-05-26 10:30:00+00', 1, NOW(), NOW());

-- Food / Dining
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 58.40,  'USD', 'Food',        'Dinner at Nobu',                   '2026-05-03 19:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 14.20,  'USD', 'Food',        'Lunch at Chipotle',                '2026-05-07 12:30:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 42.75,  'USD', 'Food',        'Sushi dinner',                     '2026-05-14 20:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 9.80,   'USD', 'Food',        'Coffee & bagel',                   '2026-05-20 08:15:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 67.30,  'USD', 'Food',        'Birthday dinner out',              '2026-05-25 19:30:00+00', 1, NOW(), NOW());

-- Utilities
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 95.40,  'USD', 'Utilities',   'Electric bill',                    '2026-05-05 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 45.00,  'USD', 'Utilities',   'Internet bill',                    '2026-05-05 09:05:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 28.50,  'USD', 'Utilities',   'Water bill',                       '2026-05-06 09:00:00+00', 1, NOW(), NOW());

-- Entertainment
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 15.99,  'USD', 'Entertainment','Netflix subscription',            '2026-05-08 00:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 14.99,  'USD', 'Entertainment','Spotify subscription',            '2026-05-08 00:05:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 62.00,  'USD', 'Entertainment','Concert tickets',                 '2026-05-16 18:00:00+00', 1, NOW(), NOW());

-- Shopping
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 134.99, 'USD', 'Shopping',    'Nike sneakers',                    '2026-05-22 14:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 49.99,  'USD', 'Shopping',    'Amazon order - books',             '2026-05-28 10:00:00+00', 1, NOW(), NOW());

-- Bills & Payments
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 220.00, 'USD', 'Bills & Payments','Car insurance premium',        '2026-05-15 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 85.00,  'USD', 'Bills & Payments','Phone bill',                   '2026-05-15 09:10:00+00', 1, NOW(), NOW());

-- Savings transfer
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (2, 1, 500.00,  'USD', 'Income',     'Transfer to savings',              '2026-05-30 10:00:00+00', 1, NOW(), NOW());


-- ── JUNE 2026 ────────────────────────────────────────────────

-- Income / Salary
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 1, 4850.00, 'USD', 'Salary',     'Monthly salary deposit',           '2026-06-01 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 1, 150.00,  'USD', 'Income',     'Cash back reward',                 '2026-06-15 10:00:00+00', 1, NOW(), NOW());

-- Rent
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 1800.00, 'USD', 'Rent',       'June rent payment',                '2026-06-01 10:00:00+00', 1, NOW(), NOW());

-- Groceries
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 112.30, 'USD', 'Groceries',   'Whole Foods weekly shop',          '2026-06-02 11:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 98.75,  'USD', 'Groceries',   'Trader Joe weekly shop',           '2026-06-09 12:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 167.20, 'USD', 'Groceries',   'Costco bulk buy',                  '2026-06-17 13:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 55.40,  'USD', 'Groceries',   'Whole Foods top-up',               '2026-06-24 10:30:00+00', 1, NOW(), NOW());

-- Food / Dining  (heavier dining — over food budget)
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 88.50,  'USD', 'Food',        'Steakhouse dinner',                '2026-06-05 19:30:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 22.40,  'USD', 'Food',        'Thai lunch',                       '2026-06-10 12:30:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 54.90,  'USD', 'Food',        'Italian dinner',                   '2026-06-14 20:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 31.60,  'USD', 'Food',        'Brunch with friends',              '2026-06-21 10:30:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 12.50,  'USD', 'Food',        'Coffee shop work session',         '2026-06-26 09:00:00+00', 1, NOW(), NOW());

-- Utilities
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 88.20,  'USD', 'Utilities',   'Electric bill',                    '2026-06-05 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 45.00,  'USD', 'Utilities',   'Internet bill',                    '2026-06-05 09:05:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 31.75,  'USD', 'Utilities',   'Gas bill',                         '2026-06-06 09:00:00+00', 1, NOW(), NOW());

-- Entertainment
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 15.99,  'USD', 'Entertainment','Netflix subscription',            '2026-06-08 00:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 14.99,  'USD', 'Entertainment','Spotify subscription',            '2026-06-08 00:05:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 120.00, 'USD', 'Entertainment','Sports event tickets',            '2026-06-20 15:00:00+00', 1, NOW(), NOW());

-- Shopping
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 279.99, 'USD', 'Shopping',    'New headphones',                   '2026-06-11 13:00:00+00', 1, NOW(), NOW());

-- Bills & Payments
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 220.00, 'USD', 'Bills & Payments','Car insurance premium',        '2026-06-15 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 85.00,  'USD', 'Bills & Payments','Phone bill',                   '2026-06-15 09:10:00+00', 1, NOW(), NOW());

-- Savings transfer
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (2, 1, 400.00,  'USD', 'Income',     'Transfer to savings',              '2026-06-30 10:00:00+00', 1, NOW(), NOW());


-- ── JULY 2026 (current month, partial) ───────────────────────

-- Income / Salary
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 1, 4850.00, 'USD', 'Salary',     'Monthly salary deposit',           '2026-07-01 09:00:00+00', 1, NOW(), NOW());

-- Rent
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 1800.00, 'USD', 'Rent',       'July rent payment',                '2026-07-01 10:00:00+00', 1, NOW(), NOW());

-- Groceries
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 138.60, 'USD', 'Groceries',   'Whole Foods weekly shop',          '2026-07-06 11:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 91.40,  'USD', 'Groceries',   'Trader Joe weekly shop',           '2026-07-13 12:00:00+00', 1, NOW(), NOW());

-- Food / Dining
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 45.80,  'USD', 'Food',        'July 4th BBQ supplies restaurant', '2026-07-04 18:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 18.90,  'USD', 'Food',        'Lunch takeout',                    '2026-07-09 12:30:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 73.20,  'USD', 'Food',        'Dinner with colleagues',           '2026-07-16 19:00:00+00', 1, NOW(), NOW());

-- Utilities
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 112.80, 'USD', 'Utilities',   'Electric bill (AC heavy month)',   '2026-07-05 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 45.00,  'USD', 'Utilities',   'Internet bill',                    '2026-07-05 09:05:00+00', 1, NOW(), NOW());

-- Entertainment
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 15.99,  'USD', 'Entertainment','Netflix subscription',            '2026-07-08 00:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 14.99,  'USD', 'Entertainment','Spotify subscription',            '2026-07-08 00:05:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 85.00,  'USD', 'Entertainment','Movie night + dinner',            '2026-07-12 17:00:00+00', 1, NOW(), NOW());

-- Shopping
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 89.99,  'USD', 'Shopping',    'Summer clothes haul',              '2026-07-10 14:00:00+00', 1, NOW(), NOW());

-- Bills & Payments
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 220.00, 'USD', 'Bills & Payments','Car insurance premium',        '2026-07-15 09:00:00+00', 1, NOW(), NOW());
INSERT INTO banking.transactions ("AccountId","TransactionType","Amount","Currency","Category","Description","TransactionTime","Status","CreatedAt","UpdatedAt")
VALUES (1, 0, 85.00,  'USD', 'Bills & Payments','Phone bill',                   '2026-07-15 09:10:00+00', 1, NOW(), NOW());


-- ── Budget limits for July 2026 (current month) ──────────────
-- Upsert-style: insert only if not already present for this user/category/month/year

INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Rent',             2000.00, 1800.00,  7, 2026, NOW(), NOW());
INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Groceries',         500.00,  230.00,  7, 2026, NOW(), NOW());
INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Food',              300.00,  137.90,  7, 2026, NOW(), NOW());
INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Utilities',         250.00,  157.80,  7, 2026, NOW(), NOW());
INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Entertainment',     150.00,  115.98,  7, 2026, NOW(), NOW());
INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Shopping',          150.00,   89.99,  7, 2026, NOW(), NOW());
INSERT INTO banking.budget_limits ("UserId","Category","MonthlyLimit","CurrentSpending","Month","Year","CreatedAt","UpdatedAt")
VALUES (1, 'Bills & Payments',  350.00,  305.00,  7, 2026, NOW(), NOW());
