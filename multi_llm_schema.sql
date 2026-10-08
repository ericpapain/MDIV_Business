-- multi_llm_schema.sql

-- 1. Fournisseurs IA
CREATE TABLE IF NOT EXISTS ai_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- OpenAI, Mistral, Groq
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Modèles IA
CREATE TABLE IF NOT EXISTS ai_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    name VARCHAR(100) NOT NULL, -- ex: GPT-6 Astra
    model_code VARCHAR(100) NOT NULL, -- ex: gpt-6-astra
    specialty VARCHAR(255), -- ex: Hardest end-to-end work
    input_cost_per_1k DECIMAL(10, 6) DEFAULT 0,
    output_cost_per_1k DECIMAL(10, 6) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
);

-- 3. Configuration par Application Métier
CREATE TABLE IF NOT EXISTS ai_app_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_key VARCHAR(50) UNIQUE NOT NULL, -- ex: 'leads_generator'
    intelligence_level ENUM('Standard', 'Advanced', 'Expert', 'Research') DEFAULT 'Standard',
    execution_mode ENUM('Single', 'Challenge', 'Fusion') DEFAULT 'Single',
    custom_scoring_weights JSON, -- ex: {"confidence": 30, "reasoning": 25, "completeness": 25, "source": 20}
    active_models_json JSON, -- IDs of models to use for this app
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Journalisation Principale (Requêtes)
CREATE TABLE IF NOT EXISTS ai_request_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    app_key VARCHAR(50) NOT NULL,
    mode_used VARCHAR(20) NOT NULL,
    user_id INT NULL,
    company_id INT NULL,
    prompt_hash VARCHAR(64) NOT NULL,
    winning_model_id INT NULL,
    total_cost DECIMAL(10, 6) DEFAULT 0,
    total_tokens INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    fusion_applied BOOLEAN DEFAULT FALSE,
    final_response LONGTEXT,
    reasoning_for_choice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (winning_model_id) REFERENCES ai_models(id) ON DELETE SET NULL
);

-- 5. Sous-évaluations (Réponses individuelles par modèle dans un Challenge/Fusion)
CREATE TABLE IF NOT EXISTS ai_model_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    model_id INT NOT NULL,
    raw_response LONGTEXT,
    confidence_score INT DEFAULT 0,
    reasoning_score INT DEFAULT 0,
    completeness_score INT DEFAULT 0,
    source_quality_score INT DEFAULT 0,
    final_aggregated_score DECIMAL(5,2) DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    tokens INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    FOREIGN KEY (request_id) REFERENCES ai_request_logs(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE CASCADE
);

-- Insertion des données par défaut basées sur les instructions
INSERT INTO ai_providers (name, is_active) VALUES 
('OpenAI', 1),
('Mistral', 1),
('Groq', 1);

-- Modèles OpenAI (d'après le screenshot fourni)
INSERT INTO ai_models (provider_id, name, model_code, specialty, input_cost_per_1k, output_cost_per_1k) VALUES 
((SELECT id FROM ai_providers WHERE name = 'OpenAI'), 'GPT-6 Astra', 'gpt-6-astra', 'Our most capable model, built for the hardest end-to-end work', 0.01, 0.03),
((SELECT id FROM ai_providers WHERE name = 'OpenAI'), 'GPT-6.1 Sol', 'gpt-6.1-sol', 'High-performance for complex tasks where time and cost matter', 0.005, 0.015),
((SELECT id FROM ai_providers WHERE name = 'OpenAI'), 'GPT-6 Luna', 'gpt-6-luna', 'Most efficient model for focused, high-volume tasks', 0.001, 0.002);

-- Modèles Groq & Mistral (Déjà existants)
INSERT INTO ai_models (provider_id, name, model_code, specialty, input_cost_per_1k, output_cost_per_1k) VALUES 
((SELECT id FROM ai_providers WHERE name = 'Groq'), 'Mixtral 8x7B', 'mixtral-8x7b-32768', 'Rapide et excellent en RAG', 0.0007, 0.0007),
((SELECT id FROM ai_providers WHERE name = 'Groq'), 'Llama 3 70B', 'llama3-70b-8192', 'Raisonnement logique poussé', 0.0009, 0.0009),
((SELECT id FROM ai_providers WHERE name = 'Mistral'), 'Mistral Large', 'mistral-large-latest', 'Français parfait et synthèse', 0.004, 0.012);

-- Configuration des applications critiques en Research / Fusion
INSERT INTO ai_app_configs (app_key, intelligence_level, execution_mode, custom_scoring_weights) VALUES 
('leads_generator', 'Research', 'Fusion', '{"confidence":30,"reasoning":25,"completeness":25,"source":20}'),
('ocr_extractor', 'Expert', 'Challenge', '{"confidence":40,"reasoning":10,"completeness":40,"source":10}'),
('diagnostic', 'Research', 'Fusion', '{"confidence":20,"reasoning":40,"completeness":20,"source":20}'),
('meeting_prep', 'Research', 'Fusion', '{"confidence":25,"reasoning":25,"completeness":30,"source":20}'),
('email_analyze', 'Expert', 'Challenge', '{"confidence":30,"reasoning":30,"completeness":20,"source":20}'),
('rag_chatbot', 'Research', 'Fusion', '{"confidence":30,"reasoning":20,"completeness":20,"source":30}');
