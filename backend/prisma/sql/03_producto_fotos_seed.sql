-- ════════════════════════════════════════════════════════════════════════
--  Seed de producto_fotos — 1 foto principal por producto (24 productos)
--  Las imágenes se sirven estáticamente desde frontend/public/imagenes/
--  → URL pública: /imagenes/{archivo}
--
--  Idempotente: TRUNCATE primero (no hay FKs entrantes a producto_fotos
--  más allá de la propia tabla; cualquier FK a id_foto sería un bug).
-- ════════════════════════════════════════════════════════════════════════

SET search_path TO vortex, public;

TRUNCATE TABLE producto_fotos RESTART IDENTITY CASCADE;

INSERT INTO producto_fotos (id_producto, url_foto, alt_text, es_principal, orden) VALUES
    -- Hoodies (existentes .webp)
    ('P000001', '/imagenes/p000001_hoodie_blackout.webp',     'Hoodie Blackout — foto principal',     TRUE, 1),
    ('P000002', '/imagenes/p000002_hoodie_spectre_crop.webp', 'Hoodie Spectre Crop — foto principal', TRUE, 1),
    ('P000003', '/imagenes/p000003_hoodie_gravedad.webp',     'Hoodie Gravedad — foto principal',     TRUE, 1),
    ('P000004', '/imagenes/p000004_hoodie_static.webp',       'Hoodie Static — foto principal',       TRUE, 1),

    -- Tees (3 webp + 1 nueva png)
    ('P000005', '/imagenes/p000005_tee_ruido_blanco.webp', 'Tee Ruido Blanco — foto principal', TRUE, 1),
    ('P000006', '/imagenes/p000006_tee_frecuencia.webp',   'Tee Frecuencia — foto principal',   TRUE, 1),
    ('P000007', '/imagenes/p000007_tee_sin_senal.webp',    'Tee Sin Senal — foto principal',    TRUE, 1),
    ('P000008', '/imagenes/p000008_tee_glitch.png',        'Tee Glitch — foto principal',       TRUE, 1),

    -- Pants
    ('P000009', '/imagenes/p000009_cargo_sombra.png',     'Cargo Sombra — foto principal',     TRUE, 1),
    ('P000010', '/imagenes/p000010_jogger_estatico.png',  'Jogger Estatico — foto principal',  TRUE, 1),
    ('P000011', '/imagenes/p000011_cargo_bunker.png',     'Cargo Bunker — foto principal',     TRUE, 1),
    ('P000012', '/imagenes/p000012_jogger_eclipse.png',   'Jogger Eclipse — foto principal',   TRUE, 1),

    -- Jackets
    ('P000013', '/imagenes/p000013_jacket_bunker.png',       'Jacket Bunker — foto principal',       TRUE, 1),
    ('P000014', '/imagenes/p000014_bomber_ceniza.png',       'Bomber Ceniza — foto principal',       TRUE, 1),
    ('P000015', '/imagenes/p000015_jacket_cortaviento.png',  'Jacket Cortaviento — foto principal',  TRUE, 1),
    ('P000016', '/imagenes/p000016_jacket_ripstop.png',      'Jacket Ripstop — foto principal',      TRUE, 1),

    -- Accesorios
    ('P000017', '/imagenes/p000017_cap_signal.png',        'Cap Signal — foto principal',        TRUE, 1),
    ('P000018', '/imagenes/p000018_beanie_void.png',       'Beanie Void — foto principal',       TRUE, 1),
    ('P000019', '/imagenes/p000019_tote_sombra.png',       'Tote Sombra — foto principal',       TRUE, 1),
    ('P000020', '/imagenes/p000020_cap_bucket_shade.png',  'Cap Bucket Shade — foto principal',  TRUE, 1),

    -- Sets
    ('P000021', '/imagenes/p000021_set_phantom.png',    'Set Phantom — foto principal',    TRUE, 1),
    ('P000022', '/imagenes/p000022_set_void_crop.png',  'Set Void Crop — foto principal',  TRUE, 1),
    ('P000023', '/imagenes/p000023_set_static.png',     'Set Static — foto principal',     TRUE, 1),
    ('P000024', '/imagenes/p000024_set_bunker.png',     'Set Bunker — foto principal',     TRUE, 1);
