const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fiompiana Akoho API',
            version: '1.0.0',
            description: 'Documentation de l\'API de gestion de poulets (fiompiana akoho)',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Serveur local',
            },
        ],
        components: {
            schemas: {
                // ─── Race ────────────────────────────────────────────────
                Race: {
                    type: 'object',
                    required: ['nom', 'prix_sakafo', 'prix_vente', 'prix_vente_atody'],
                    properties: {
                        Id_race: { type: 'integer', example: 1 },
                        nom: { type: 'string', example: 'Rhode Island' },
                        prix_sakafo: { type: 'number', format: 'float', example: 1500.0 },
                        prix_vente: { type: 'number', format: 'float', example: 25000.0 },
                        prix_vente_atody: { type: 'number', format: 'float', example: 500.0 },
                    },
                },
                RaceInput: {
                    type: 'object',
                    required: ['nom', 'prix_sakafo', 'prix_vente', 'prix_vente_atody'],
                    properties: {
                        nom: { type: 'string', example: 'Rhode Island' },
                        prix_sakafo: { type: 'number', format: 'float', example: 1500.0 },
                        prix_vente: { type: 'number', format: 'float', example: 25000.0 },
                        prix_vente_atody: { type: 'number', format: 'float', example: 500.0 },
                    },
                },

                // ─── DescriptionRace ─────────────────────────────────────
                DescriptionRace: {
                    type: 'object',
                    required: ['age', 'variation_poids', 'lanja_sakafo', 'Id_race'],
                    properties: {
                        Id_description_race: { type: 'integer', example: 1 },
                        age: { type: 'integer', example: 30, description: 'Âge en jours' },
                        variation_poids: { type: 'number', format: 'float', example: 0.05 },
                        lanja_sakafo: { type: 'number', format: 'float', example: 120.0, description: 'Quantité de nourriture (g/jour)' },
                        Id_race: { type: 'integer', example: 1 },
                    },
                },
                DescriptionRaceInput: {
                    type: 'object',
                    required: ['age', 'variation_poids', 'lanja_sakafo', 'Id_race'],
                    properties: {
                        age: { type: 'integer', example: 30 },
                        variation_poids: { type: 'number', format: 'float', example: 0.05 },
                        lanja_sakafo: { type: 'number', format: 'float', example: 120.0 },
                        Id_race: { type: 'integer', example: 1 },
                    },
                },

                // ─── LotAkoho ────────────────────────────────────────────
                LotAkoho: {
                    type: 'object',
                    required: ['numero', 'date_entree', 'nombre', 'age', 'nombre_akoho_vavy', 'prix_achat', 'Id_race'],
                    properties: {
                        Id_lot_akoho: { type: 'integer', example: 1 },
                        numero: { type: 'integer', example: 101 },
                        date_entree: { type: 'string', format: 'date', example: '2025-01-15' },
                        nombre: { type: 'integer', example: 50 },
                        age: { type: 'integer', example: 7, description: 'Âge en semaines à l\'entrée' },
                        nombre_akoho_vavy: { type: 'integer', example: 25, description: 'Nombre de poules femelles dans le lot' },
                        prix_achat: { type: 'number', format: 'float', example: 8000.0 },
                        Id_race: { type: 'integer', example: 1 },
                    },
                },
                LotAkohoInput: {
                    type: 'object',
                    required: ['numero', 'date_entree', 'nombre', 'age', 'nombre_akoho_vavy', 'prix_achat', 'Id_race'],
                    properties: {
                        numero: { type: 'integer', example: 101 },
                        date_entree: { type: 'string', format: 'date', example: '2025-01-15' },
                        nombre: { type: 'integer', example: 50 },
                        age: { type: 'integer', example: 7 },
                        nombre_akoho_vavy: { type: 'integer', example: 25 },
                        prix_achat: { type: 'number', format: 'float', example: 8000.0 },
                        Id_race: { type: 'integer', example: 1 },
                    },
                },

                // ─── LotAtody ────────────────────────────────────────────
                LotAtody: {
                    type: 'object',
                    required: ['numero', 'date_entree', 'nombre', 'Id_lot_akoho'],
                    properties: {
                        Id_lot_atody: { type: 'integer', example: 1 },
                        numero: { type: 'integer', example: 201 },
                        date_entree: { type: 'string', format: 'date', example: '2025-02-01' },
                        nombre: { type: 'integer', example: 300, description: 'Nombre d\'œufs' },
                        Id_lot_akoho: { type: 'integer', example: 1 },
                    },
                },
                LotAtodyInput: {
                    type: 'object',
                    required: ['numero', 'date_entree', 'nombre', 'Id_lot_akoho'],
                    properties: {
                        numero: { type: 'integer', example: 201 },
                        date_entree: { type: 'string', format: 'date', example: '2025-02-01' },
                        nombre: { type: 'integer', example: 300 },
                        Id_lot_akoho: { type: 'integer', example: 1 },
                    },
                },

                // ─── NaissanceOeuf ───────────────────────────────────────
                NaissanceOeuf: {
                    type: 'object',
                    required: ['nombre_poussin', 'date_naissance', 'Id_lot_atody'],
                    properties: {
                        Id_naissance_oeuf: { type: 'integer', example: 1 },
                        nombre_poussin: { type: 'string', example: '250', description: 'Nombre de poussins nés' },
                        date_naissance: { type: 'string', format: 'date', example: '2025-03-01' },
                        Id_lot_atody: { type: 'integer', example: 1 },
                    },
                },
                NaissanceOeufInput: {
                    type: 'object',
                    required: ['nombre_poussin', 'date_naissance', 'Id_lot_atody'],
                    properties: {
                        nombre_poussin: { type: 'string', example: '250' },
                        date_naissance: { type: 'string', format: 'date', example: '2025-03-01' },
                        Id_lot_atody: { type: 'integer', example: 1 },
                    },
                },

                // ─── AkohoMaty ───────────────────────────────────────────
                AkohoMaty: {
                    type: 'object',
                    required: ['date_mort', 'nombre', 'Id_lot_akoho'],
                    properties: {
                        Id_akoho_maty: { type: 'integer', example: 1 },
                        date_mort: { type: 'string', format: 'date', example: '2025-02-10' },
                        nombre: { type: 'integer', example: 3, description: 'Nombre de poulets morts' },
                        Id_lot_akoho: { type: 'integer', example: 1 },
                    },
                },
                AkohoMatyInput: {
                    type: 'object',
                    required: ['date_mort', 'nombre', 'Id_lot_akoho'],
                    properties: {
                        date_mort: { type: 'string', format: 'date', example: '2025-02-10' },
                        nombre: { type: 'integer', example: 3 },
                        Id_lot_akoho: { type: 'integer', example: 1 },
                    },
                },

                // ─── AtodyLamokany ────────────────────────────────────────
                AtodyLamokany: {
                    type: 'object',
                    required: ['date_lamokany', 'nombre', 'Id_lot_atody'],
                    properties: {
                        Id_atody_lamokany: { type: 'integer', example: 1 },
                        date_lamokany: { type: 'string', format: 'date', example: '2025-03-05', description: 'Date de constatation des œufs pourris' },
                        nombre: { type: 'integer', example: 10, description: 'Nombre d\'œufs pourris' },
                        Id_lot_atody: { type: 'integer', example: 1 },
                    },
                },
                AtodyLamokanyInput: {
                    type: 'object',
                    required: ['date_lamokany', 'nombre', 'Id_lot_atody'],
                    properties: {
                        date_lamokany: { type: 'string', format: 'date', example: '2025-03-05' },
                        nombre: { type: 'integer', example: 10 },
                        Id_lot_atody: { type: 'integer', example: 1 },
                    },
                },

                // ─── Réponses génériques ─────────────────────────────────
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        status: { type: 'integer', example: 500 },
                        message: { type: 'string', example: 'Erreur interne du serveur' },
                    },
                },
                NotFound: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        status: { type: 'integer', example: 404 },
                        message: { type: 'string', example: 'Ressource introuvable' },
                    },
                },
            },
        },
    },
    // Fichiers contenant les annotations JSDoc @swagger
    apis: ['./src/routes/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
