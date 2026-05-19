-- ████████████████████████████████████████████████████████████████████████
-- ██  VAULT 16 — SEED DEFINITIVO v1                                     ██
-- ██  24 productos · ~142 variantes · 6 promociones · 5 empleados       ██
-- ██  Correr DESPUÉS del DDL. Schema: vortex                             ██
-- ████████████████████████████████████████████████████████████████████████
--
-- ⚠️  PASO PREVIO OBLIGATORIO — GENERAR EL HASH DE LA CONTRASEÑA
-- ─────────────────────────────────────────────────────────────────────────
-- Antes de correr este script, ejecutá en la terminal del backend:
--
--   node -e "require('bcryptjs').hash('Vault16Admin!', 10).then(h => console.log(h))"
--
-- El output es algo así:
--   $2b$10$K9Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
--
-- Hacé un Find & Replace en este archivo:
--   buscar:    $2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He
--   reemplazar: el hash que generaste
--
-- Si corrés el seed sin hacer este paso, el INSERT de usuarios_backoffice
-- va a cargar un hash inválido — el login va a fallar silenciosamente.
-- ████████████████████████████████████████████████████████████████████████

SET search_path TO vortex, public;

-- ════════════════════════════════════════════════════════════════════════
--  RESET TOTAL — en orden inverso de dependencias FK
--  TRUNCATE CASCADE maneja automáticamente las relaciones.
--  RESTART IDENTITY resetea columnas IDENTITY (no la sequence manual).
-- ════════════════════════════════════════════════════════════════════════

TRUNCATE TABLE
    chat_mensaje,
    chat_sesion,
    audit_log,
    carrito_detalle,
    carrito,
    detalle_factura,
    pago,
    factura,
    token_recuperacion,
    direccion_cliente,
    movimiento_stock,
    detalle_ajuste,
    ajuste_inventario,
    promocion_detalle,
    promocion,
    producto_fotos,
    producto_ai,
    variante_producto,
    producto,
    categoria_producto,
    talla,
    usuarios_backoffice,
    cliente,
    empleado,
    rol
RESTART IDENTITY CASCADE;

-- Resetear la sequence del id_producto
ALTER SEQUENCE vortex.seq_producto RESTART WITH 1;

-- ════════════════════════════════════════════════════════════════════════
--  1. ROL
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO rol (nombre, descripcion) VALUES
    ('ADMIN',     'Acceso total al sistema. Usuarios, reportes y configuracion.'),
    ('VENDEDOR',  'Gestion de ventas, facturas y atencion al cliente.'),
    ('BODEGA',    'Control de inventario, ajustes de stock y movimientos.'),
    ('MARKETING', 'Gestion de productos, fotos, descripciones IA y promociones.'),
    ('REPORTES',  'Solo lectura. Dashboard y exportacion de reportes.');

-- ════════════════════════════════════════════════════════════════════════
--  2. CATEGORIA_PRODUCTO
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO categoria_producto (id_categoria, nombre, descripcion, orden, estado) VALUES
    ('HOO', 'Hoodies',    'Sudaderas con capucha. Oversize, crop y heavyweight.',          1, 'ACT'),
    ('TEE', 'T-Shirts',   'Remeras de manga corta. Basicas, graficas y boxy.',             2, 'ACT'),
    ('PAN', 'Pants',      'Pantalones cargo, joggers y wide-leg.',                         3, 'ACT'),
    ('JAC', 'Jackets',    'Chaquetas, bombers, cortavientos y ripstop.',                   4, 'ACT'),
    ('ACC', 'Accesorios', 'Gorras, beanies, bolsos y complementos.',                       5, 'ACT'),
    ('SET', 'Sets',       'Conjuntos coordinados de dos o mas prendas.',                   6, 'ACT');

-- ════════════════════════════════════════════════════════════════════════
--  3. TALLA
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO talla (descripcion, orden, estado) VALUES
    ('XS',    1, 'ACT'),   -- id_talla 1
    ('S',     2, 'ACT'),   -- id_talla 2
    ('M',     3, 'ACT'),   -- id_talla 3
    ('L',     4, 'ACT'),   -- id_talla 4
    ('XL',    5, 'ACT'),   -- id_talla 5
    ('XXL',   6, 'ACT'),   -- id_talla 6
    ('UNICA', 7, 'ACT');   -- id_talla 7  ← accesorios

-- ════════════════════════════════════════════════════════════════════════
--  4. EMPLEADO
--  Cedulas ficticias de 10 digitos (validas por el CHECK)
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO empleado (cedula, nombre1, apellido1, telefono, estado_emp) VALUES
    ('1713456789', 'Sebastian', 'Mora',     '0991234567', 'ACT'),  -- id 1 → ADMIN
    ('1723456780', 'Valentina', 'Torres',   '0992345678', 'ACT'),  -- id 2 → MARKETING
    ('1733456781', 'Mateo',     'Andrade',  '0993456789', 'ACT'),  -- id 3 → BODEGA
    ('1743456782', 'Camila',    'Vega',     '0994567890', 'ACT'),  -- id 4 → VENTAS
    ('1753456783', 'Andres',    'Jimenez',  '0995678901', 'ACT');  -- id 5 → REPORTES

-- ════════════════════════════════════════════════════════════════════════
--  5. USUARIOS_BACKOFFICE
--
--  CREDENCIALES DE ACCESO AL BACKOFFICE:
--  ─────────────────────────────────────
--  admin@vault16.ec     /  Vault16Admin!  → rol ADMIN     (acceso total)
--  marketing@vault16.ec /  Vault16Admin!  → rol MARKETING (productos, promos)
--  bodega@vault16.ec    /  Vault16Admin!  → rol BODEGA    (inventario)
--  ventas@vault16.ec    /  Vault16Admin!  → rol VENDEDOR  (ventas, facturas)
--  reportes@vault16.ec  /  Vault16Admin!  → rol REPORTES  (solo lectura)
--
--  ✅ Hash bcrypt definitivo (cost=10) para 'Vault16Admin!' — NO reemplazar.
--      Verificable con `node backend/scripts/verify-hashes.cjs`.
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO usuarios_backoffice (email, password_hash, id_rol, id_empleado) VALUES
    ('admin@vault16.ec',
     '$2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He',
     (SELECT id_rol FROM rol WHERE nombre = 'ADMIN'),
     (SELECT id_empleado FROM empleado WHERE cedula = '1713456789')),

    ('marketing@vault16.ec',
     '$2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He',
     (SELECT id_rol FROM rol WHERE nombre = 'MARKETING'),
     (SELECT id_empleado FROM empleado WHERE cedula = '1723456780')),

    ('bodega@vault16.ec',
     '$2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He',
     (SELECT id_rol FROM rol WHERE nombre = 'BODEGA'),
     (SELECT id_empleado FROM empleado WHERE cedula = '1733456781')),

    ('ventas@vault16.ec',
     '$2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He',
     (SELECT id_rol FROM rol WHERE nombre = 'VENDEDOR'),
     (SELECT id_empleado FROM empleado WHERE cedula = '1743456782')),

    ('reportes@vault16.ec',
     '$2a$10$WpjGKkMYFPUD2qu6q6mS4.MPq3BZ3XAUzp.BB7ERLCHnO57OkX6He',
     (SELECT id_rol FROM rol WHERE nombre = 'REPORTES'),
     (SELECT id_empleado FROM empleado WHERE cedula = '1753456783'));

-- ════════════════════════════════════════════════════════════════════════
--  6. PRODUCTO — 24 productos (4 por categoría)
--  id_producto se genera automáticamente: P000001 ... P000024
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO producto (id_categoria, nombre, descripcion_corta, precio_venta, estado_prod) VALUES

    -- ── HOODIES (HOO) ────────────────────────────────────────────── P000001-004
    ('HOO', 'Hoodie Blackout',
     'French terry 420g, lavado acido, capucha tubular. El pesado de la linea.',
     59.99, 'ACT'),

    ('HOO', 'Hoodie Spectre Crop',
     'Corte cropped oversize, hombros caidos, dobladillo raw edge.',
     52.99, 'ACT'),

    ('HOO', 'Hoodie Gravedad',
     'Tela waffle brushed interior, fit recto, bolsillo canguro con zipper oculto.',
     64.99, 'ACT'),

    ('HOO', 'Hoodie Static',
     'French terry 380g, hoodie basico heavyweight. El de usar todos los dias.',
     54.99, 'ACT'),

    -- ── T-SHIRTS (TEE) ────────────────────────────────────────────── P000005-008
    ('TEE', 'Tee Ruido Blanco',
     '100% algodon peinado 240g, grafica distorsionada al frente.',
     29.99, 'ACT'),

    ('TEE', 'Tee Frecuencia',
     'Corte boxy, manga corta dropped shoulder, estampado en pecho y manga.',
     27.99, 'ACT'),

    ('TEE', 'Tee Sin Senal',
     'Basica heavy 220g, grafica minimalista espalda, cuello redondo rib.',
     24.99, 'ACT'),

    ('TEE', 'Tee Glitch',
     'Algodon organico 260g, grafica all-over sublimada, cuello camisero.',
     34.99, 'ACT'),

    -- ── PANTS (PAN) ───────────────────────────────────────────────── P000009-012
    ('PAN', 'Cargo Sombra',
     'Cargo wide-leg, 8 bolsillos, cintura doble elastico, tobillo ajustable.',
     69.99, 'ACT'),

    ('PAN', 'Jogger Estatico',
     'Fleece interior 320g, fit tapered, cintura elastica con cordon plano.',
     54.99, 'ACT'),

    ('PAN', 'Cargo Bunker',
     'Nylon ripstop, bolsillos con cierre, cintura con hebilla lateral.',
     74.99, 'ACT'),

    ('PAN', 'Jogger Eclipse',
     'Terry pesado 350g, pierna ancha, bolsillos traseros con parche.',
     59.99, 'ACT'),

    -- ── JACKETS (JAC) ────────────────────────────────────────────── P000013-016
    ('JAC', 'Jacket Bunker',
     'Shell nylon ripstop, interior micropolar, capucha removible, 4 bolsillos.',
     94.99, 'ACT'),

    ('JAC', 'Bomber Ceniza',
     'Bomber reversible: exterior satin negro, interior jacquard gris.',
     84.99, 'ACT'),

    ('JAC', 'Jacket Cortaviento',
     'Nylon ligero 100% impermeable, empaquetable en bolsillo, capucha integrada.',
     79.99, 'ACT'),

    ('JAC', 'Jacket Ripstop',
     'Ripstop militar reforzado, cierre YKK, bolsillos cargo en pecho.',
     89.99, 'ACT'),

    -- ── ACCESORIOS (ACC) ─────────────────────────────────────────── P000017-020
    ('ACC', 'Cap Signal',
     'Gorra 6 paneles twill 100% algodon, bordado tonal, snapback metalico.',
     24.99, 'ACT'),

    ('ACC', 'Beanie Void',
     'Gorro ribbed acrilico doble capa, largo slouchy, parche tejido lateral.',
     18.99, 'ACT'),

    ('ACC', 'Tote Sombra',
     'Bolso tote canvas 400g, asas largas reforzadas, bolsillo interno.',
     22.99, 'ACT'),

    ('ACC', 'Cap Bucket Shade',
     'Bucket hat en tela ripstop, ala media, logotipo bordado frontal.',
     26.99, 'ACT'),

    -- ── SETS (SET) ───────────────────────────────────────────────── P000021-024
    ('SET', 'Set Phantom',
     'Conjunto Hoodie Blackout + Cargo Sombra. La combo flagship de VAULT 16.',
     119.99, 'ACT'),

    ('SET', 'Set Void Crop',
     'Conjunto Hoodie Spectre Crop + Jogger Estatico. Fit femenino oversize.',
     99.99, 'ACT'),

    ('SET', 'Set Static',
     'Conjunto Tee Sin Senal + Cargo Bunker. El combo diario minimalista.',
     89.99, 'ACT'),

    ('SET', 'Set Bunker',
     'Conjunto Jacket Bunker + Cargo Bunker. Full techwear, full proteccion.',
     154.99, 'ACT');

-- ════════════════════════════════════════════════════════════════════════
--  7. VARIANTE_PRODUCTO
--  SKU formato: {ID_PRODUCTO}-{COLOR_ABREV3}-{TALLA}
--  1 variante por talla disponible × colores del producto
--  var_saldo_inicial = stock de arranque (no tocar var_qty_* aqui)
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO variante_producto (id_producto, id_talla, color, sku, var_saldo_inicial) VALUES

-- ────────────────────────────────────────────────────────────────────────
--  P000001 — Hoodie Blackout (S M L XL · Negro + Antracita)
-- ────────────────────────────────────────────────────────────────────────
('P000001',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000001-NEG-S',   15),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000001-NEG-M',   20),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000001-NEG-L',   18),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000001-NEG-XL',  12),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Antracita', 'P000001-ANT-S',   10),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Antracita', 'P000001-ANT-M',   14),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Antracita', 'P000001-ANT-L',   12),
('P000001',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Antracita', 'P000001-ANT-XL',   8),

-- ────────────────────────────────────────────────────────────────────────
--  P000002 — Hoodie Spectre Crop (XS S M · Negro + Arena)
-- ────────────────────────────────────────────────────────────────────────
('P000002',(SELECT id_talla FROM talla WHERE descripcion='XS'), 'Negro',     'P000002-NEG-XS',  10),
('P000002',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000002-NEG-S',   15),
('P000002',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000002-NEG-M',   12),
('P000002',(SELECT id_talla FROM talla WHERE descripcion='XS'), 'Arena',     'P000002-ARE-XS',   8),
('P000002',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Arena',     'P000002-ARE-S',   10),
('P000002',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Arena',     'P000002-ARE-M',    8),

-- ────────────────────────────────────────────────────────────────────────
--  P000003 — Hoodie Gravedad (S M L XL · Carbon + Pizarra)
-- ────────────────────────────────────────────────────────────────────────
('P000003',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Carbon',    'P000003-CAR-S',   10),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Carbon',    'P000003-CAR-M',   14),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Carbon',    'P000003-CAR-L',   12),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Carbon',    'P000003-CAR-XL',   6),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Pizarra',   'P000003-PIZ-S',    8),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Pizarra',   'P000003-PIZ-M',   10),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Pizarra',   'P000003-PIZ-L',    8),
('P000003',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Pizarra',   'P000003-PIZ-XL',   5),

-- ────────────────────────────────────────────────────────────────────────
--  P000004 — Hoodie Static (S M L XL XXL · Gris + Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000004',(SELECT id_talla FROM talla WHERE descripcion='S'),   'Gris',     'P000004-GRI-S',   18),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='M'),   'Gris',     'P000004-GRI-M',   22),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='L'),   'Gris',     'P000004-GRI-L',   20),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='XL'),  'Gris',     'P000004-GRI-XL',  14),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='XXL'), 'Gris',     'P000004-GRI-XXL',  6),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='S'),   'Negro',    'P000004-NEG-S',   15),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='M'),   'Negro',    'P000004-NEG-M',   20),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='L'),   'Negro',    'P000004-NEG-L',   18),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='XL'),  'Negro',    'P000004-NEG-XL',  10),
('P000004',(SELECT id_talla FROM talla WHERE descripcion='XXL'), 'Negro',    'P000004-NEG-XXL',  4),

-- ────────────────────────────────────────────────────────────────────────
--  P000005 — Tee Ruido Blanco (S M L XL · Negro + Hueso)
-- ────────────────────────────────────────────────────────────────────────
('P000005',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000005-NEG-S',   25),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000005-NEG-M',   30),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000005-NEG-L',   25),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000005-NEG-XL',  18),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Hueso',     'P000005-HUE-S',   20),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Hueso',     'P000005-HUE-M',   22),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Hueso',     'P000005-HUE-L',   18),
('P000005',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Hueso',     'P000005-HUE-XL',  12),

-- ────────────────────────────────────────────────────────────────────────
--  P000006 — Tee Frecuencia (S M L XL · Negro + Cemento)
-- ────────────────────────────────────────────────────────────────────────
('P000006',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000006-NEG-S',   20),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000006-NEG-M',   25),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000006-NEG-L',   22),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000006-NEG-XL',  15),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Cemento',   'P000006-CEM-S',   15),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Cemento',   'P000006-CEM-M',   18),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Cemento',   'P000006-CEM-L',   14),
('P000006',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Cemento',   'P000006-CEM-XL',  10),

-- ────────────────────────────────────────────────────────────────────────
--  P000007 — Tee Sin Senal (S M L XL · Negro + Blanco)
-- ────────────────────────────────────────────────────────────────────────
('P000007',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000007-NEG-S',   30),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000007-NEG-M',   35),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000007-NEG-L',   30),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000007-NEG-XL',  20),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Blanco',    'P000007-BLA-S',   25),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Blanco',    'P000007-BLA-M',   28),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Blanco',    'P000007-BLA-L',   22),
('P000007',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Blanco',    'P000007-BLA-XL',  16),

-- ────────────────────────────────────────────────────────────────────────
--  P000008 — Tee Glitch (S M L XL XXL · Negro + Vintage)
-- ────────────────────────────────────────────────────────────────────────
('P000008',(SELECT id_talla FROM talla WHERE descripcion='S'),   'Negro',    'P000008-NEG-S',   18),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='M'),   'Negro',    'P000008-NEG-M',   22),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='L'),   'Negro',    'P000008-NEG-L',   20),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='XL'),  'Negro',    'P000008-NEG-XL',  14),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='XXL'), 'Negro',    'P000008-NEG-XXL',  5),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='S'),   'Vintage',  'P000008-VIN-S',   12),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='M'),   'Vintage',  'P000008-VIN-M',   14),
('P000008',(SELECT id_talla FROM talla WHERE descripcion='L'),   'Vintage',  'P000008-VIN-L',   12),

-- ────────────────────────────────────────────────────────────────────────
--  P000009 — Cargo Sombra (S M L XL · Negro + Oliva)
-- ────────────────────────────────────────────────────────────────────────
('P000009',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000009-NEG-S',   10),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000009-NEG-M',   15),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000009-NEG-L',   12),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000009-NEG-XL',   8),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Oliva',     'P000009-OLI-S',    8),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Oliva',     'P000009-OLI-M',   10),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Oliva',     'P000009-OLI-L',    8),
('P000009',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Oliva',     'P000009-OLI-XL',   5),

-- ────────────────────────────────────────────────────────────────────────
--  P000010 — Jogger Estatico (S M L XL · Negro + Gris Mel)
-- ────────────────────────────────────────────────────────────────────────
('P000010',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000010-NEG-S',   12),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000010-NEG-M',   16),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000010-NEG-L',   14),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000010-NEG-XL',   9),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Gris Mel',  'P000010-GME-S',   10),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Gris Mel',  'P000010-GME-M',   12),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Gris Mel',  'P000010-GME-L',   10),
('P000010',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Gris Mel',  'P000010-GME-XL',   6),

-- ────────────────────────────────────────────────────────────────────────
--  P000011 — Cargo Bunker (S M L XL · Negro + Verde Militar)
-- ────────────────────────────────────────────────────────────────────────
('P000011',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',       'P000011-NEG-S',   8),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',       'P000011-NEG-M',  12),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',       'P000011-NEG-L',  10),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',       'P000011-NEG-XL',  6),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Verde Mil',   'P000011-VMI-S',   6),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Verde Mil',   'P000011-VMI-M',   8),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Verde Mil',   'P000011-VMI-L',   7),
('P000011',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Verde Mil',   'P000011-VMI-XL',  4),

-- ────────────────────────────────────────────────────────────────────────
--  P000012 — Jogger Eclipse (S M L XL · Negro + Carbon)
-- ────────────────────────────────────────────────────────────────────────
('P000012',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000012-NEG-S',   14),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000012-NEG-M',   18),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000012-NEG-L',   15),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000012-NEG-XL',   9),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Carbon',    'P000012-CAR-S',   10),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Carbon',    'P000012-CAR-M',   12),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Carbon',    'P000012-CAR-L',   10),
('P000012',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Carbon',    'P000012-CAR-XL',   5),

-- ────────────────────────────────────────────────────────────────────────
--  P000013 — Jacket Bunker (S M L XL · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000013',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000013-NEG-S',    6),
('P000013',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000013-NEG-M',    8),
('P000013',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000013-NEG-L',    8),
('P000013',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000013-NEG-XL',   4),

-- ────────────────────────────────────────────────────────────────────────
--  P000014 — Bomber Ceniza (S M L XL · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000014',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000014-NEG-S',    5),
('P000014',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000014-NEG-M',    8),
('P000014',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000014-NEG-L',    7),
('P000014',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000014-NEG-XL',   4),

-- ────────────────────────────────────────────────────────────────────────
--  P000015 — Jacket Cortaviento (S M L XL · Negro + Verde Oscuro)
-- ────────────────────────────────────────────────────────────────────────
('P000015',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',       'P000015-NEG-S',   6),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',       'P000015-NEG-M',   9),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',       'P000015-NEG-L',   8),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',       'P000015-NEG-XL',  4),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Verde Osc',   'P000015-VOS-S',   5),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Verde Osc',   'P000015-VOS-M',   7),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Verde Osc',   'P000015-VOS-L',   6),
('P000015',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Verde Osc',   'P000015-VOS-XL',  3),

-- ────────────────────────────────────────────────────────────────────────
--  P000016 — Jacket Ripstop (S M L XL · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000016',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000016-NEG-S',    7),
('P000016',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000016-NEG-M',   10),
('P000016',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000016-NEG-L',    8),
('P000016',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000016-NEG-XL',   5),

-- ────────────────────────────────────────────────────────────────────────
--  P000017 — Cap Signal (UNICA · Negro + Beige + Carbon)
-- ────────────────────────────────────────────────────────────────────────
('P000017',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Negro',   'P000017-NEG-UNI', 30),
('P000017',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Beige',   'P000017-BEI-UNI', 20),
('P000017',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Carbon',  'P000017-CAR-UNI', 15),

-- ────────────────────────────────────────────────────────────────────────
--  P000018 — Beanie Void (UNICA · Negro + Gris + Marron)
-- ────────────────────────────────────────────────────────────────────────
('P000018',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Negro',   'P000018-NEG-UNI', 25),
('P000018',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Gris',    'P000018-GRI-UNI', 18),
('P000018',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Marron',  'P000018-MAR-UNI', 12),

-- ────────────────────────────────────────────────────────────────────────
--  P000019 — Tote Sombra (UNICA · Negro + Crudo)
-- ────────────────────────────────────────────────────────────────────────
('P000019',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Negro',   'P000019-NEG-UNI', 20),
('P000019',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Crudo',   'P000019-CRU-UNI', 15),

-- ────────────────────────────────────────────────────────────────────────
--  P000020 — Cap Bucket Shade (UNICA · Negro + Beige + Oliva)
-- ────────────────────────────────────────────────────────────────────────
('P000020',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Negro',   'P000020-NEG-UNI', 18),
('P000020',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Beige',   'P000020-BEI-UNI', 14),
('P000020',(SELECT id_talla FROM talla WHERE descripcion='UNICA'),'Oliva',   'P000020-OLI-UNI', 10),

-- ────────────────────────────────────────────────────────────────────────
--  P000021 — Set Phantom (S M L XL · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000021',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000021-NEG-S',    8),
('P000021',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000021-NEG-M',   10),
('P000021',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000021-NEG-L',    9),
('P000021',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000021-NEG-XL',   5),

-- ────────────────────────────────────────────────────────────────────────
--  P000022 — Set Void Crop (XS S M · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000022',(SELECT id_talla FROM talla WHERE descripcion='XS'), 'Negro',     'P000022-NEG-XS',   6),
('P000022',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000022-NEG-S',    8),
('P000022',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000022-NEG-M',    7),

-- ────────────────────────────────────────────────────────────────────────
--  P000023 — Set Static (S M L XL · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000023',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000023-NEG-S',    9),
('P000023',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000023-NEG-M',   12),
('P000023',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000023-NEG-L',   10),
('P000023',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000023-NEG-XL',   6),

-- ────────────────────────────────────────────────────────────────────────
--  P000024 — Set Bunker (S M L XL · Negro)
-- ────────────────────────────────────────────────────────────────────────
('P000024',(SELECT id_talla FROM talla WHERE descripcion='S'),  'Negro',     'P000024-NEG-S',    5),
('P000024',(SELECT id_talla FROM talla WHERE descripcion='M'),  'Negro',     'P000024-NEG-M',    7),
('P000024',(SELECT id_talla FROM talla WHERE descripcion='L'),  'Negro',     'P000024-NEG-L',    6),
('P000024',(SELECT id_talla FROM talla WHERE descripcion='XL'), 'Negro',     'P000024-NEG-XL',   4);

-- ════════════════════════════════════════════════════════════════════════
--  8. PROMOCIONES (6 — nombres propios de streetwear)
--
--  ACTIVAS HOY (Mayo 2026):     1, 2, 3
--  TERMINADAS (historial):      4
--  PENDIENTES (no iniciaron):   5, 6
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO promocion (nombre, descripcion, porcentaje_descuento, fecha_inicio, fecha_fin, estado) VALUES

    -- 1 · ACTIVA — Hoodies
    ('DROP 001 · Apertura Vault',
     'Primera entrega oficial de VAULT 16. Todos los hoodies con 15% off. Sin limite de unidades.',
     15.00,
     '2026-05-01 00:00:00',
     '2026-05-31 23:59:59',
     'ACT'),

    -- 2 · ACTIVA — Pants
    ('CARGO SEASON 26',
     'Es temporada de cargos. 20% off en toda la linea de pantalones. Solo en mayo.',
     20.00,
     '2026-05-10 00:00:00',
     '2026-05-25 23:59:59',
     'ACT'),

    -- 3 · ACTIVA — Tees
    ('TEE WEEK · Los Basicos',
     'Una semana entera de tees. Todos los modelos con 10% off. El armario empieza aqui.',
     10.00,
     '2026-05-12 00:00:00',
     '2026-05-18 23:59:59',
     'ACT'),

    -- 4 · INACTIVA — historial (termino en abril)
    ('LAYER UP · Jackets',
     'El frio llego. 25% off en toda la linea de jackets. Solo por tiempo limitado.',
     25.00,
     '2026-04-01 00:00:00',
     '2026-04-30 23:59:59',
     'INA'),

    -- 5 · INACTIVA — pendiente (arranca en junio)
    ('CAPSULE SETS · Bundle Edition',
     'Compra el conjunto completo y ahorra. 20% off en todos los sets de la temporada.',
     20.00,
     '2026-06-01 00:00:00',
     '2026-06-30 23:59:59',
     'INA'),

    -- 6 · INACTIVA — pendiente (noviembre)
    ('BLACK FRIDAY VAULT 26',
     'Un dia. Todo con 30% off. Sin excepciones, sin codigos. Solo el 28 de noviembre.',
     30.00,
     '2026-11-28 00:00:00',
     '2026-11-28 23:59:59',
     'INA');

-- ════════════════════════════════════════════════════════════════════════
--  9. PROMOCION_DETALLE
--  Asocia productos a cada campaña.
-- ════════════════════════════════════════════════════════════════════════

-- Promo 1 · DROP 001 · Apertura Vault → todos los HOO (P000001-004)
INSERT INTO promocion_detalle (id_promocion, id_producto)
SELECT
    (SELECT id_promocion FROM promocion WHERE nombre = 'DROP 001 · Apertura Vault'),
    id_producto
FROM producto WHERE id_categoria = 'HOO';

-- Promo 2 · CARGO SEASON 26 → todos los PAN (P000009-012)
INSERT INTO promocion_detalle (id_promocion, id_producto)
SELECT
    (SELECT id_promocion FROM promocion WHERE nombre = 'CARGO SEASON 26'),
    id_producto
FROM producto WHERE id_categoria = 'PAN';

-- Promo 3 · TEE WEEK → todos los TEE (P000005-008)
INSERT INTO promocion_detalle (id_promocion, id_producto)
SELECT
    (SELECT id_promocion FROM promocion WHERE nombre = 'TEE WEEK · Los Basicos'),
    id_producto
FROM producto WHERE id_categoria = 'TEE';

-- Promo 4 · LAYER UP → todos los JAC (P000013-016)
INSERT INTO promocion_detalle (id_promocion, id_producto)
SELECT
    (SELECT id_promocion FROM promocion WHERE nombre = 'LAYER UP · Jackets'),
    id_producto
FROM producto WHERE id_categoria = 'JAC';

-- Promo 5 · CAPSULE SETS → todos los SET (P000021-024)
INSERT INTO promocion_detalle (id_promocion, id_producto)
SELECT
    (SELECT id_promocion FROM promocion WHERE nombre = 'CAPSULE SETS · Bundle Edition'),
    id_producto
FROM producto WHERE id_categoria = 'SET';

-- Promo 6 · BLACK FRIDAY → todos los productos (todas las categorias)
INSERT INTO promocion_detalle (id_promocion, id_producto)
SELECT
    (SELECT id_promocion FROM promocion WHERE nombre = 'BLACK FRIDAY VAULT 26'),
    id_producto
FROM producto;

-- ════════════════════════════════════════════════════════════════════════
--  CLIENTE DE PRUEBA — para testear el flujo de compra
--
--  CREDENCIAL E-COMMERCE:
--  test@vault16.ec   /  Vault16Test!
--  ✅ Hash bcrypt definitivo (cost=10) para 'Vault16Test!' — NO reemplazar.
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO cliente (email, password_hash, ruc_cedula, nombre1, apellido1, telefono, email_verificado, estado) VALUES
    ('test@vault16.ec',
     '$2a$10$d1valDjZSQNh4MLYHOg1eOQb5uygw76w0bcT6ZUz2pwm08bLm9If2',
     '1790012345',
     'Cliente',
     'Prueba',
     '0999999999',
     TRUE,
     'ACT');

-- ════════════════════════════════════════════════════════════════════════
--  VERIFICACION FINAL
-- ════════════════════════════════════════════════════════════════════════

SELECT
    'roles'               AS tabla, COUNT(*) AS registros FROM rol             UNION ALL
SELECT 'categorias',                COUNT(*) FROM categoria_producto           UNION ALL
SELECT 'tallas',                    COUNT(*) FROM talla                        UNION ALL
SELECT 'empleados',                 COUNT(*) FROM empleado                     UNION ALL
SELECT 'usuarios_backoffice',       COUNT(*) FROM usuarios_backoffice          UNION ALL
SELECT 'clientes_prueba',           COUNT(*) FROM cliente                      UNION ALL
SELECT 'productos',                 COUNT(*) FROM producto                     UNION ALL
SELECT 'variantes',                 COUNT(*) FROM variante_producto            UNION ALL
SELECT 'promociones',               COUNT(*) FROM promocion                    UNION ALL
SELECT 'promocion_detalle',         COUNT(*) FROM promocion_detalle;

-- RESULTADO ESPERADO:
-- roles               →   5
-- categorias          →   6
-- tallas              →   7
-- empleados           →   5
-- usuarios_backoffice →   5
-- clientes_prueba     →   1
-- productos           →  24
-- variantes           → 142
-- promociones         →   6
-- promocion_detalle   →  28  (4+4+4+4+4+24 productos en BLACK FRIDAY)

-- ════════════════════════════════════════════════════════════════════════
--  MAPA ID_PRODUCTO → NOMBRE (para organizar las fotos en Azure)
-- ════════════════════════════════════════════════════════════════════════
SELECT id_producto, nombre, id_categoria FROM producto ORDER BY id_producto;
