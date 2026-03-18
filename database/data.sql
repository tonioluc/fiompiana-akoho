USE gestion_akoho;
GO

INSERT INTO race (nom, prix_sakafo, prix_vente, prix_vente_atody, nombre_jour_foy, capacite_pondaison)
VALUES ('borboneze', 5, 15, 500, 30, 40);
GO


INSERT INTO description_race (age, variation_poids, lanja_sakafo, Id_race)
VALUES
(0,  50,  0,   1),
(1,  20,  75,  1),
(2,  25,  80,  1),
(3,  30,  100, 1),
(4,  40,  150, 1),
(5,  80,  170, 1),
(6,  85,  190, 1),
(7,  100, 200, 1),
(8,  100, 250, 1),
(9,  90,  270, 1),
(10, 140, 290, 1),
(11, 200, 300, 1),
(12, 220, 370, 1),
(13, 265, 390, 1),
(14, 285, 350, 1),
(15, 300, 300, 1),
(16, 350, 450, 1),
(17, 400, 500, 1),
(18, 420, 400, 1),
(19, 430, 500, 1),
(20, 500, 500, 1),
(21, 530, 650, 1),
(22, 600, 600, 1),
(23, 400, 750, 1),
(24, 100, 750, 1),
(25, 0,   600, 1);
GO

INSERT INTO lot_akoho (numero, date_entree, nombre, age, nombre_akoho_vavy, prix_achat, Id_race)
VALUES (1, '2026-01-01', 500, 0, 500, 500, 1);
GO