-- V10__Add_Admin_Profit_Analytics.sql

-- 10. Multi-branch Analytics Report Sheets
CREATE TABLE daily_financial_reports (
    id                 BIGSERIAL      PRIMARY KEY,
    branch_id          BIGINT         NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    report_date        DATE           NOT NULL,
    booking_revenue    DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (booking_revenue >= 0),
    product_revenue    DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (product_revenue >= 0),
    operational_costs  DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (operational_costs >= 0),
    net_profit         DECIMAL(12, 2) GENERATED ALWAYS AS ((booking_revenue + product_revenue) - operational_costs) STORED,
    created_at         TIMESTAMPTZ    NOT NULL DEFAULT now(),
    CONSTRAINT uidx_branch_daily_report UNIQUE (branch_id, report_date)
);

CREATE INDEX idx_reports_branch_date ON daily_financial_reports (branch_id, report_date);