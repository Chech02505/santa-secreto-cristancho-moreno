-- Ejecutar TODO este archivo una sola vez en Neon > SQL Editor.
-- No subir contraseñas reales al repositorio.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  expected_count integer CHECK (expected_count BETWEEN 2 AND 100),
  registration_open boolean NOT NULL DEFAULT true,
  draw_completed boolean NOT NULL DEFAULT false,
  draw_at timestamptz
);
INSERT INTO app_settings(id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(24) NOT NULL UNIQUE,
  display_name varchar(70) NOT NULL,
  password_hash text NOT NULL,
  wishes varchar(800) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  giver_id uuid PRIMARY KEY REFERENCES participants(id) ON DELETE RESTRICT,
  receiver_id uuid NOT NULL UNIQUE REFERENCES participants(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT not_own_santa CHECK(giver_id <> receiver_id)
);

CREATE TABLE IF NOT EXISTS login_attempts (
  username varchar(24) PRIMARY KEY,
  failures integer NOT NULL DEFAULT 0,
  blocked_until timestamptz
);

-- Registra cada persona bajo bloqueo de ajustes: evita inscribirse durante el sorteo.
CREATE OR REPLACE FUNCTION enroll_participant(
  p_username text, p_display_name text, p_password_hash text, p_wishes text
) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_setting app_settings%ROWTYPE;
  v_count integer;
  v_id uuid;
BEGIN
  SELECT * INTO v_setting FROM app_settings WHERE id = 1 FOR UPDATE;
  IF NOT v_setting.registration_open OR v_setting.draw_completed THEN
    RAISE EXCEPTION 'REGISTRATION_CLOSED';
  END IF;
  SELECT count(*) INTO v_count FROM participants;
  IF v_setting.expected_count IS NOT NULL AND v_count >= v_setting.expected_count THEN
    RAISE EXCEPTION 'REGISTRATION_FULL';
  END IF;
  INSERT INTO participants(username, display_name, password_hash, wishes)
  VALUES (p_username, p_display_name, p_password_hash, p_wishes)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Modifica el cupo sin mostrar los datos de las personas inscritas.
CREATE OR REPLACE FUNCTION set_expected_participants(p_count integer)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_setting app_settings%ROWTYPE;
  v_registered integer;
BEGIN
  SELECT * INTO v_setting FROM app_settings WHERE id = 1 FOR UPDATE;
  IF v_setting.draw_completed THEN RAISE EXCEPTION 'DRAW_ALREADY_COMPLETED'; END IF;
  SELECT count(*) INTO v_registered FROM participants;
  IF p_count < 2 OR p_count > 100 OR p_count < v_registered THEN
    RAISE EXCEPTION 'INVALID_CAPACITY';
  END IF;
  UPDATE app_settings SET expected_count = p_count WHERE id = 1;
END;
$$;

-- Una sola asignación por persona. Un ciclo aleatorio impide sacar su propio nombre.
-- Toda la operación ocurre de forma atómica: nunca queda un sorteo a medias.
CREATE OR REPLACE FUNCTION perform_secret_draw()
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  v_setting app_settings%ROWTYPE;
  v_ids uuid[];
  v_count integer;
  i integer;
BEGIN
  SELECT * INTO v_setting FROM app_settings WHERE id = 1 FOR UPDATE;
  IF v_setting.draw_completed THEN RAISE EXCEPTION 'DRAW_ALREADY_COMPLETED'; END IF;
  IF v_setting.expected_count IS NULL THEN RAISE EXCEPTION 'CAPACITY_NOT_SET'; END IF;
  SELECT array_agg(id ORDER BY gen_random_uuid()) INTO v_ids FROM participants;
  v_count := COALESCE(array_length(v_ids, 1), 0);
  IF v_count < 2 OR v_count <> v_setting.expected_count THEN
    RAISE EXCEPTION 'PARTICIPANTS_INCOMPLETE';
  END IF;
  FOR i IN 1..v_count LOOP
    INSERT INTO assignments(giver_id, receiver_id)
    VALUES (v_ids[i], v_ids[(i % v_count) + 1]);
  END LOOP;
  UPDATE app_settings SET registration_open = false, draw_completed = true, draw_at = now()
  WHERE id = 1;
  RETURN v_count;
END;
$$;
