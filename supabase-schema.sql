-- Create tables for Tabby

-- Tabs table
CREATE TABLE IF NOT EXISTS tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  access_token VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IOUs table
CREATE TABLE IF NOT EXISTS ious (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  split_type VARCHAR(10) DEFAULT 'even' CHECK (split_type IN ('even', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IOU splits table
CREATE TABLE IF NOT EXISTS iou_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iou_id UUID REFERENCES ious(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE,
  from_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  to_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tabs_invite_code ON tabs(invite_code);
CREATE INDEX idx_participants_tab_id ON participants(tab_id);
CREATE INDEX idx_participants_access_token ON participants(access_token);
CREATE INDEX idx_ious_tab_id ON ious(tab_id);
CREATE INDEX idx_iou_splits_iou_id ON iou_splits(iou_id);
CREATE INDEX idx_settlements_tab_id ON settlements(tab_id);

-- Create net_balances view
CREATE OR REPLACE VIEW net_balances AS
WITH balance_details AS (
  -- Money owed to each participant (they paid)
  SELECT 
    i.tab_id,
    i.payer_id as participant_id,
    SUM(s.amount) as amount
  FROM ious i
  JOIN iou_splits s ON i.id = s.iou_id
  WHERE s.participant_id != i.payer_id
  GROUP BY i.tab_id, i.payer_id
  
  UNION ALL
  
  -- Money each participant owes (they benefited)
  SELECT 
    i.tab_id,
    s.participant_id,
    -SUM(s.amount) as amount
  FROM ious i
  JOIN iou_splits s ON i.id = s.iou_id
  WHERE s.participant_id != i.payer_id
  GROUP BY i.tab_id, s.participant_id
  
  UNION ALL
  
  -- Settlements paid
  SELECT 
    tab_id,
    from_id as participant_id,
    -amount as amount
  FROM settlements
  
  UNION ALL
  
  -- Settlements received
  SELECT 
    tab_id,
    to_id as participant_id,
    amount as amount
  FROM settlements
)
SELECT 
  bd.tab_id,
  bd.participant_id,
  p.name as participant_name,
  SUM(bd.amount) as net_balance
FROM balance_details bd
JOIN participants p ON bd.participant_id = p.id
GROUP BY bd.tab_id, bd.participant_id, p.name;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ious;
ALTER PUBLICATION supabase_realtime ADD TABLE settlements;