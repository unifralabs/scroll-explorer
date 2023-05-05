-- This file is used to define some sql that must be executed manually

-- postgresql.conf
-- shared_preload_libraries = 'pg_cron'    # (change requires restart)
-- CREATE EXTENSION pg_cron;

-- This is a view that can be used to get the number of transactions per day
CREATE MATERIALIZED VIEW daily_transaction_count AS
SELECT TO_CHAR(to_timestamp("blockTime"), 'YYYY-MM-DD') AS date,
       COUNT(*) AS count
FROM transaction
GROUP BY date
ORDER BY date ASC;

CREATE OR REPLACE FUNCTION refresh_daily_transaction_count() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_transaction_count;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('0 * * * *', 'SELECT refresh_daily_transaction_count()');  -- every hour


-- This is a view that can be used to get the number of token transfers per days
CREATE MATERIALIZED VIEW daily_token_transfer_counts
AS
SELECT
  TO_CHAR(to_timestamp("blockTime"), 'YYYY-MM-DD') AS date,
  "tokenType",
  COUNT(*) AS count
FROM "tokenTransfer"
GROUP BY date, "tokenType"
ORDER BY date ASC;

CREATE OR REPLACE FUNCTION refresh_daily_token_transfer_counts() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_token_transfer_counts;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('0 * * * *', 'SELECT refresh_daily_token_transfer_counts()');  -- every hour


-- This is a view that can be used to get the number of unique addresses per day
CREATE MATERIALIZED VIEW daily_unique_address_count AS
SELECT TO_CHAR(to_timestamp("blockTime"), 'YYYY-MM-DD') AS date,
       COUNT(DISTINCT "to") AS count
FROM "transaction"
GROUP BY date
ORDER BY date ASC;

CREATE OR REPLACE FUNCTION refresh_daily_unique_address_count() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_unique_address_count;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('0 * * * *', 'SELECT refresh_daily_unique_address_count()');  -- every hour

-- This is a view that can be used to get the number of token holders per day, and the number of token transfers per day
CREATE MATERIALIZED VIEW token_list_materialized AS
SELECT 
  contract."contractAddress", contract.symbol, contract."contractType", contract.name,
  "tokenListMaintain".description, "tokenListMaintain".tag, "tokenListMaintain".logo_path, "tokenListMaintain".list_priority,
  COALESCE(holders_count.count, 0) AS holders,
  COALESCE(trans24h_count.count, 0) AS trans24h,
  COALESCE(trans3d_count.count, 0) AS trans3d
FROM contract 
LEFT OUTER JOIN "tokenListMaintain"
ON contract."contractAddress" = "tokenListMaintain".contract_address 
LEFT OUTER JOIN (
  SELECT "accountBalance".contract, COUNT("accountBalance".address) AS count
  FROM "accountBalance"
  WHERE "accountBalance".value > 0
  GROUP BY "accountBalance".contract
) AS holders_count
ON contract."contractAddress" = holders_count.contract
LEFT OUTER JOIN (
  SELECT "tokenTransfer".contract, COUNT("tokenTransfer".id) AS count
  FROM "tokenTransfer"
  WHERE "tokenTransfer"."blockTime" > (EXTRACT(EPOCH FROM NOW()) - 86400)
  GROUP BY "tokenTransfer".contract
) AS trans24h_count
ON contract."contractAddress" = trans24h_count.contract
LEFT OUTER JOIN (
  SELECT "tokenTransfer".contract, COUNT("tokenTransfer".id) AS count
  FROM "tokenTransfer"
  WHERE "tokenTransfer"."blockTime" > (EXTRACT(EPOCH FROM NOW()) - 3 * 86400)
  GROUP BY "tokenTransfer".contract
) AS trans3d_count
ON contract."contractAddress" = trans3d_count.contract;

CREATE OR REPLACE FUNCTION refresh_token_list_materialized() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY token_list_materialized;
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('0,30 * * * *', 'SELECT refresh_token_list_materialized()');  -- twice per hour