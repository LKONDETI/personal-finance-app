-- Initial Database Setup Script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if not exists (already created by POSTGRES_DB)
-- Create schema for better organization
CREATE SCHEMA IF NOT EXISTS banking;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA banking TO bankinguser;
GRANT ALL PRIVILEGES ON DATABASE bankingdb TO bankinguser;

-- Set default schema
ALTER DATABASE bankingdb SET search_path TO banking, public;

-- Create a simple test table to verify connection
CREATE TABLE IF NOT EXISTS banking.health_check (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO banking.health_check (message) VALUES ('Database initialized successfully');

-- Print confirmation
DO $$
BEGIN
    RAISE NOTICE 'Banking database initialized successfully!';
END $$;
