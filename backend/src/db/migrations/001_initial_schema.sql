-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  two_fa_secret VARCHAR(255),
  two_fa_enabled BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vaults table
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('inactivity', 'scheduled', 'manual', 'death_certificate', 'executor_vote')),
  trigger_config JSONB,
  is_encrypted BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  custom_slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video', 'audio', 'text', 'url')),
  file_path VARCHAR(500),
  encrypted_data TEXT,
  metadata JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Executors table
CREATE TABLE IF NOT EXISTS executors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  access_level VARCHAR(50) DEFAULT 'viewer' CHECK (access_level IN ('primary', 'curator', 'viewer')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'removed')),
  invite_token VARCHAR(255) UNIQUE,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vault-Executor junction table
CREATE TABLE IF NOT EXISTS vault_executors (
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  executor_id UUID NOT NULL REFERENCES executors(id) ON DELETE CASCADE,
  PRIMARY KEY (vault_id, executor_id)
);

-- Triggers table
CREATE TABLE IF NOT EXISTS triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'triggered', 'cancelled', 'expired')),
  scheduled_date TIMESTAMP,
  last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  inactivity_days INTEGER,
  cancellation_deadline TIMESTAMP,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proof of life table
CREATE TABLE IF NOT EXISTS proof_of_life (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  streak_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, check_in_date)
);

-- Memorial reactions table
CREATE TABLE IF NOT EXISTS memorial_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  executor_id UUID REFERENCES executors(id) ON DELETE SET NULL,
  reaction VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint for reactions (one reaction per user/executor per vault)
CREATE UNIQUE INDEX IF NOT EXISTS idx_memorial_reactions_unique 
ON memorial_reactions(vault_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(executor_id, '00000000-0000-0000-0000-000000000000'::uuid), reaction);

-- Memorial comments table
CREATE TABLE IF NOT EXISTS memorial_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  executor_id UUID REFERENCES executors(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES memorial_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_content_vault_id ON content(vault_id);
CREATE INDEX IF NOT EXISTS idx_executors_user_id ON executors(user_id);
CREATE INDEX IF NOT EXISTS idx_executors_email ON executors(email);
CREATE INDEX IF NOT EXISTS idx_triggers_vault_id ON triggers(vault_id);
CREATE INDEX IF NOT EXISTS idx_triggers_status ON triggers(status);
CREATE INDEX IF NOT EXISTS idx_proof_of_life_user_id ON proof_of_life(user_id);
CREATE INDEX IF NOT EXISTS idx_proof_of_life_check_in ON proof_of_life(check_in_date);
CREATE INDEX IF NOT EXISTS idx_memorial_reactions_vault_id ON memorial_reactions(vault_id);
CREATE INDEX IF NOT EXISTS idx_memorial_comments_vault_id ON memorial_comments(vault_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memorial_comments_updated_at BEFORE UPDATE ON memorial_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

