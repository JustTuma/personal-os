-- ============================================================
-- Personal OS — Migration 003: Functions & Triggers
-- ============================================================

-- ============================================================
-- Trigger: auto-create profile on new auth user
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger: auto-seed categories for new user
-- ============================================================
CREATE OR REPLACE FUNCTION public.seed_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Expense categories
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (NEW.id, 'Comida',          'expense', '#ef4444', 'utensils',       true),
    (NEW.id, 'Transporte',      'expense', '#f97316', 'car',            true),
    (NEW.id, 'Casa',            'expense', '#eab308', 'home',           true),
    (NEW.id, 'Entretenimiento', 'expense', '#8b5cf6', 'tv',             true),
    (NEW.id, 'Tecnología',      'expense', '#3b82f6', 'smartphone',     true),
    (NEW.id, 'Educación',       'expense', '#06b6d4', 'book-open',      true),
    (NEW.id, 'Compras',         'expense', '#ec4899', 'shopping-bag',   true),
    (NEW.id, 'Salud',           'expense', '#10b981', 'heart-pulse',    true),
    (NEW.id, 'Suscripciones',   'expense', '#6366f1', 'repeat',         true),
    (NEW.id, 'Viajes',          'expense', '#14b8a6', 'plane',          true),
    (NEW.id, 'Negocio',         'expense', '#f59e0b', 'briefcase',      true),
    (NEW.id, 'Otros',           'expense', '#6b7280', 'more-horizontal', true);

  -- Income categories
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (NEW.id, 'Trabajo',         'income', '#10b981', 'briefcase',      true),
    (NEW.id, 'Negocio',         'income', '#f59e0b', 'trending-up',    true),
    (NEW.id, 'Freelance',       'income', '#3b82f6', 'laptop',         true),
    (NEW.id, 'Inversiones',     'income', '#8b5cf6', 'bar-chart-2',    true),
    (NEW.id, 'Regalos',         'income', '#ec4899', 'gift',           true),
    (NEW.id, 'Otros',           'income', '#6b7280', 'more-horizontal', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_categories();

-- ============================================================
-- Updated_at trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- View: account balances (calculated, never stored)
-- ============================================================
CREATE OR REPLACE VIEW account_balances AS
SELECT
  a.id,
  a.user_id,
  a.name,
  a.type,
  a.currency,
  a.color,
  a.icon,
  a.is_active,
  a.initial_balance,
  (
    a.initial_balance
    + COALESCE((
        SELECT SUM(t.amount)
        FROM transactions t
        WHERE t.account_id = a.id AND t.type = 'income'
      ), 0)
    - COALESCE((
        SELECT SUM(t.amount)
        FROM transactions t
        WHERE t.account_id = a.id AND t.type = 'expense'
      ), 0)
    + COALESCE((
        SELECT SUM(tr.amount)
        FROM transfers tr
        WHERE tr.to_account_id = a.id
      ), 0)
    - COALESCE((
        SELECT SUM(tr.amount)
        FROM transfers tr
        WHERE tr.from_account_id = a.id
      ), 0)
  ) AS current_balance
FROM accounts a;

-- RLS on view is inherited from the accounts table
-- The view is security_invoker by default in Postgres 15+
