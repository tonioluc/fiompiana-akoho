-- Créer la base si elle n'existe pas
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'gestion_akoho')
BEGIN
    CREATE DATABASE gestion_akoho;
END
GO

USE gestion_akoho;
GO

-- Drop tables si elles existent déjà (ordre inverse des FK)
IF OBJECT_ID('akoho_maty', 'U') IS NOT NULL DROP TABLE akoho_maty;
IF OBJECT_ID('naissance_oeuf', 'U') IS NOT NULL DROP TABLE naissance_oeuf;
IF OBJECT_ID('atody_lamokany', 'U') IS NOT NULL DROP TABLE atody_lamokany;
IF OBJECT_ID('lot_atody', 'U') IS NOT NULL DROP TABLE lot_atody;
IF OBJECT_ID('lot_akoho', 'U') IS NOT NULL DROP TABLE lot_akoho;
IF OBJECT_ID('description_race', 'U') IS NOT NULL DROP TABLE description_race;
IF OBJECT_ID('race', 'U') IS NOT NULL DROP TABLE race;
GO

CREATE TABLE race(
   Id_race INT IDENTITY,
   nom VARCHAR(50),
   prix_sakafo FLOAT,
   prix_vente FLOAT,
   prix_vente_atody FLOAT,
   nombre_jour_foy INT,
   capacite_pondaison INT,
   PRIMARY KEY(Id_race)
);
GO

CREATE TABLE description_race(
   Id_description_race INT IDENTITY,
   age INT,
   variation_poids FLOAT,
   lanja_sakafo FLOAT,
   Id_race INT NOT NULL,
   PRIMARY KEY(Id_description_race),
   FOREIGN KEY(Id_race) REFERENCES race(Id_race)
);
GO

CREATE TABLE lot_akoho(
   Id_lot_akoho INT IDENTITY,
   numero INT,
   date_entree DATE,
   nombre INT,
   age INT,
   nombre_akoho_vavy INT,
   prix_achat FLOAT,
   Id_race INT NOT NULL,
   PRIMARY KEY(Id_lot_akoho),
   FOREIGN KEY(Id_race) REFERENCES race(Id_race)
);
GO

CREATE TABLE lot_atody(
   Id_lot_atody INT IDENTITY,
   numero INT,
   date_entree DATE,
   nombre INT,
   pourcentage_atody_lamokany INT,
   pourcentage_vavy INT,
   Id_lot_akoho INT NOT NULL,
   PRIMARY KEY(Id_lot_atody),
   FOREIGN KEY(Id_lot_akoho) REFERENCES lot_akoho(Id_lot_akoho)
);
GO

CREATE TABLE atody_lamokany(
   Id_atody_lamokany INT IDENTITY,
   date_lamokany DATE,
   nombre INT,
   Id_lot_atody INT NOT NULL,
   PRIMARY KEY(Id_atody_lamokany),
   FOREIGN KEY(Id_lot_atody) REFERENCES lot_atody(Id_lot_atody)
);
GO

CREATE TABLE naissance_oeuf(
   Id_naissance_oeuf INT IDENTITY,
   nombre_poussin INT NOT NULL,
   date_naissance DATE,
   Id_lot_atody INT NOT NULL,
   Id_lot_akoho INT NOT NULL,
   -- pour dire quel lot_akoho est créé par cette naissance_oeuf , donc on doit créer d'abord le lot_akoho avant de créer la naissance_oeuf
   PRIMARY KEY(Id_naissance_oeuf),
   FOREIGN KEY (Id_lot_akoho) REFERENCES lot_akoho(Id_lot_akoho),
   FOREIGN KEY(Id_lot_atody) REFERENCES lot_atody(Id_lot_atody)
);
GO

CREATE TABLE akoho_maty(
   Id_akoho_maty INT IDENTITY,
   date_mort DATE,
   nombre INT,
   Id_lot_akoho INT NOT NULL,
   PRIMARY KEY(Id_akoho_maty),
   FOREIGN KEY(Id_lot_akoho) REFERENCES lot_akoho(Id_lot_akoho)
);
GO
