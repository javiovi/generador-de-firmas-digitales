-- Añadir columna user_id a la tabla signatures
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS user_id UUID;

-- Crear índice para búsqueda por user_id
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON signatures(user_id);

-- Añadir restricción de clave foránea (opcional, si tienes una tabla de usuarios)
-- ALTER TABLE signatures ADD CONSTRAINT fk_signatures_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
