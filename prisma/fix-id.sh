#!/bin/bash

# Replace the values inside these quotes with your actual database credentials
PG_DSN="postgres://postgres:12345678@10.2.0.223:5432/bsc_explorer"

# Define an array of table names that need to be fixed
TABLES=("accountBalance" "balanceChange" "config" "internalTransaction" "tokenTransfer" "transaction" "transactionLogs" "functionInfo")

# Loop over each table and fix its schema
for TABLE_NAME in "${TABLES[@]}"; do
    echo "Fixing schema for table $TABLE_NAME..."

    # Add the "id" column as optional
    psql $PG_DSN -c "ALTER TABLE \"$TABLE_NAME\" ADD COLUMN id SERIAL PRIMARY KEY;"

    # Populate the "id" column with unique values
    psql $PG_DSN -c "UPDATE \"$TABLE_NAME\" SET id = DEFAULT;"

    # Make the "id" column required
    psql $PG_DSN -c "ALTER TABLE \"$TABLE_NAME\" ALTER COLUMN id SET NOT NULL;"
done

echo "Schema fixes complete."
