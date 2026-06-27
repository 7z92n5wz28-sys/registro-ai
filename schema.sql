-- risk_level
CREATE TYPE risk_level AS ENUM ('unacceptable', 'high', 'limited', 'minimal');

-- evaluation_status
CREATE TYPE evaluation_status AS ENUM ('draft', 'pending_review', 'approved', 'approved_with_conditions', 'rejected', 'archived');

-- dpo_verdict
CREATE TYPE dpo_verdict AS ENUM ('approved', 'approved_with_conditions', 'rejected', 'pending');

-- ai_confidence_level
CREATE TYPE ai_confidence_level AS ENUM ('inferred', 'to_verify');

-- tool_category (tipologia strumento)
CREATE TYPE tool_category AS ENUM (
  'writing_assistant', 'chatbot', 'image_generator', 'presentations', 'quiz',
  'concept_maps', 'search', 'translation', 'tts', 'stt', 'audio', 'video',
  'image_editing', 'adaptive_tutor', 'admin_support', 'data_analysis',
  'coding', 'accessibility_bes_dsa', 'ai_detection', 'other'
);

-- subject_type (soggetti coinvolti)
CREATE TYPE subject_type AS ENUM (
  'students', 'minor_students', 'teachers', 'ata', 'families',
  'staff', 'external', 'no_personal_data', 'other'
);

-- activity_area
CREATE TYPE activity_area AS ENUM ('didattica', 'amministrazione');

-- activity_type_didattica
CREATE TYPE activity_type_didattica AS ENUM (
  'teaching_materials', 'presentations', 'quiz', 'maps', 'images', 'content',
  'text_synthesis', 'translations', 'tutoring', 'bes_dsa', 'languages',
  'coding', 'research', 'transcription', 'podcast', 'video', 'other'
);

-- activity_type_amministrazione
CREATE TYPE activity_type_amministrazione AS ENUM (
  'circulars', 'documents', 'spreadsheets', 'admin', 'chatbot',
  'schedules', 'pnrr', 'other'
);

CREATE TABLE institutions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    school_code text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL REFERENCES institutions(id),
    full_name text NOT NULL,
    role text NOT NULL DEFAULT 'operator',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai_systems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL REFERENCES institutions(id),
    name text NOT NULL,
    provider text NOT NULL,
    website_url text,
    categories tool_category[] NOT NULL,
    subjects subject_type[] NOT NULL,
    activity_area activity_area NOT NULL,
    activities_didattica activity_type_didattica[],
    activities_amministrazione activity_type_amministrazione[],
    adoption_date date,
    responsible_person text,
    notes text,
    is_active boolean NOT NULL DEFAULT true,
    dismissed_at timestamptz,
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_systems_institution_id ON ai_systems(institution_id);
CREATE INDEX idx_ai_systems_institution_active ON ai_systems(institution_id, is_active);
CREATE INDEX idx_ai_systems_name ON ai_systems(name);

CREATE TABLE evaluations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_system_id uuid NOT NULL REFERENCES ai_systems(id),
    institution_id uuid NOT NULL REFERENCES institutions(id),
    version integer NOT NULL DEFAULT 1,
    status evaluation_status NOT NULL DEFAULT 'draft',
    school_year text NOT NULL,
    
    -- FASE 2
    prohibited_emotion_recognition boolean,
    prohibited_biometric_categorization boolean,
    prohibited_social_scoring boolean,
    prohibited_vulnerability_manipulation boolean,
    prohibited_access_determination boolean,
    has_prohibited_practice boolean GENERATED ALWAYS AS (
        COALESCE(prohibited_emotion_recognition, false) OR 
        COALESCE(prohibited_biometric_categorization, false) OR 
        COALESCE(prohibited_social_scoring, false) OR 
        COALESCE(prohibited_vulnerability_manipulation, false) OR 
        COALESCE(prohibited_access_determination, false)
    ) STORED,
    
    -- FASE 3
    risk_level risk_level,
    risk_classification_rationale text,
    
    -- FASE 4
    dpo_server_eu boolean,
    dpo_extra_data_required boolean,
    dpo_marketing boolean,
    dpo_dpa boolean,
    dpo_acn_marketplace boolean,
    dpo_effective_ai_usage boolean,
    dpo_score integer,
    dpo_auto_verdict text,
    
    -- Avallo DPO
    dpo_final_verdict dpo_verdict,
    dpo_conditions text,
    dpo_motivations text,
    dpo_prescriptions text,
    dpo_reviewed_by uuid REFERENCES users(id),
    dpo_reviewed_at timestamptz,
    
    -- Scheda finale
    compliance_requirements text[],
    recommendation text,
    
    -- Metadati
    created_by uuid REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    registered_at timestamptz
);

CREATE INDEX idx_evaluations_ai_system_id ON evaluations(ai_system_id);
CREATE INDEX idx_evaluations_inst_year ON evaluations(institution_id, school_year);
CREATE INDEX idx_evaluations_inst_status ON evaluations(institution_id, status);
CREATE INDEX idx_evaluations_risk_level ON evaluations(risk_level);

CREATE TABLE ai_evidences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    parameter_key text NOT NULL,
    ai_proposed_value text,
    ai_rationale text,
    ai_source_url text,
    ai_source_snippet text,
    ai_confidence ai_confidence_level NOT NULL,
    user_accepted boolean,
    user_override_value text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_evidences_eval_id ON ai_evidences(evaluation_id);
CREATE INDEX idx_ai_evidences_eval_param ON ai_evidences(evaluation_id, parameter_key);

CREATE TABLE crawl_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid REFERENCES evaluations(id) ON DELETE CASCADE,
    url text NOT NULL,
    content_markdown text,
    crawl_type text NOT NULL,
    crawled_at timestamptz NOT NULL DEFAULT now(),
    raw_metadata jsonb
);

CREATE INDEX idx_crawl_results_eval_id ON crawl_results(evaluation_id);
CREATE INDEX idx_crawl_results_url ON crawl_results(url);

CREATE TABLE evaluation_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id uuid REFERENCES evaluations(id) ON DELETE CASCADE,
    action text NOT NULL,
    details jsonb,
    performed_by uuid REFERENCES users(id),
    performed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_evaluation_logs_eval_id ON evaluation_logs(evaluation_id);

CREATE OR REPLACE VIEW v_registry AS
SELECT 
    s.*,
    e.risk_level,
    e.dpo_score,
    e.dpo_auto_verdict,
    e.dpo_final_verdict,
    e.status,
    e.school_year,
    e.registered_at,
    e.version
FROM ai_systems s
LEFT JOIN LATERAL (
    SELECT * FROM evaluations e 
    WHERE e.ai_system_id = s.id 
      AND e.status IN ('approved', 'approved_with_conditions', 'rejected') 
    ORDER BY e.version DESC 
    LIMIT 1
) e ON true;

CREATE OR REPLACE VIEW v_evaluation_detail AS
SELECT 
    e.*,
    s.name as system_name,
    s.provider,
    s.website_url,
    s.categories,
    s.subjects,
    s.activity_area,
    s.is_active,
    (
        SELECT json_agg(json_build_object(
            'parameter_key', a.parameter_key,
            'ai_proposed_value', a.ai_proposed_value,
            'ai_rationale', a.ai_rationale,
            'ai_source_url', a.ai_source_url,
            'ai_source_snippet', a.ai_source_snippet,
            'ai_confidence', a.ai_confidence,
            'user_accepted', a.user_accepted,
            'user_override_value', a.user_override_value
        ))
        FROM ai_evidences a
        WHERE a.evaluation_id = e.id
    ) as evidences
FROM evaluations e
JOIN ai_systems s ON e.ai_system_id = s.id;

-- Seed Data (Demo MVP)
INSERT INTO institutions (id, name, school_code) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Istituto Comprensivo Demo', 'DEMO012345')
ON CONFLICT (school_code) DO NOTHING;

INSERT INTO users (id, institution_id, full_name, role)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Operatore Demo', 'operator')
ON CONFLICT DO NOTHING;
