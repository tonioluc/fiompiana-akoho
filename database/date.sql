BEGIN TRANSACTION;
GO

DECLARE @IdRace INT;

INSERT INTO race (nom, prix_sakafo, prix_vente, prix_vente_atody)
VALUES ('borboneze', 5, 15, 500);

SET @IdRace = SCOPE_IDENTITY();

INSERT INTO description_race (age, variation_poids, lanja_sakafo, Id_race)
VALUES
(0,  50,  0,   @IdRace),
(1,  20,  75,  @IdRace),
(2,  25,  80,  @IdRace),
(3,  30,  100, @IdRace),
(4,  40,  150, @IdRace),
(5,  80,  170, @IdRace),
(6,  85,  190, @IdRace),
(7,  100, 200, @IdRace),
(8,  100, 250, @IdRace),
(9,  90,  270, @IdRace),
(10, 140, 290, @IdRace),
(11, 200, 300, @IdRace),
(12, 220, 370, @IdRace),
(13, 265, 390, @IdRace),
(14, 285, 350, @IdRace),
(15, 300, 300, @IdRace),
(16, 350, 450, @IdRace),
(17, 400, 500, @IdRace),
(18, 420, 400, @IdRace),
(19, 430, 500, @IdRace),
(20, 500, 500, @IdRace),
(21, 530, 650, @IdRace),
(22, 600, 600, @IdRace),
(23, 400, 750, @IdRace),
(24, 100, 750, @IdRace),
(25, 0,   600, @IdRace);

INSERT INTO lot_akoho (numero, date_entree, nombre, age, prix_achat, Id_race)
VALUES (1, '2026-01-01', 500, 0, 500, @IdRace);

COMMIT TRANSACTION;
GO
