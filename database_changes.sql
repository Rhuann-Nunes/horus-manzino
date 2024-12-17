-- Adicionar novas colunas na tabela products
ALTER TABLE products 
ADD COLUMN color VARCHAR(50),
ADD COLUMN size VARCHAR(50),
ADD COLUMN image_url TEXT,
ADD COLUMN product_type VARCHAR(50);

-- Adicionar novas colunas na tabela sale_items
ALTER TABLE sale_items
ADD COLUMN color VARCHAR(50),
ADD COLUMN size VARCHAR(50);

-- Remover a coluna de email da tabela customers
ALTER TABLE customers DROP COLUMN email; 

-- Remover coluna email da tabela suppliers
ALTER TABLE suppliers DROP COLUMN email;

-- Adicionar coluna sale_date na tabela sales
ALTER TABLE sales ADD COLUMN sale_date DATE DEFAULT CURRENT_DATE;