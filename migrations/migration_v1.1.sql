-- Migration v1.1 — Allineamento a specifiche tecniche Registro AI v1.1
-- =====================================================================

-- Step 2: Tier 1 — Alto rischio (5 campi)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_access boolean;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_students boolean;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_orientation boolean;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_staff boolean;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_exam boolean;

-- Step 2: Tier 2 — Rischio limitato (2 campi)
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_interaction boolean;
ALTER TABLE evaluations ADD COLUMN IF NOT EXISTS risk_synthetic boolean;

-- Corregge has_prohibited_practice: esclude prohibited_access_determination
-- (è alto rischio Allegato III, non pratica vietata art. 5)
ALTER TABLE evaluations DROP COLUMN IF EXISTS has_prohibited_practice;
ALTER TABLE evaluations ADD COLUMN has_prohibited_practice boolean GENERATED ALWAYS AS (
    COALESCE(prohibited_emotion_recognition, false) OR 
    COALESCE(prohibited_biometric_categorization, false) OR 
    COALESCE(prohibited_social_scoring, false) OR 
    COALESCE(prohibited_vulnerability_manipulation, false)
) STORED;

-- Aggiorna v_registry per mostrare l'ultima valutazione (qualsiasi status)
CREATE OR REPLACE VIEW v_registry AS
SELECT 
    s.*,
    e.id as evaluation_id,
    e.risk_level,
    e.dpo_score,
    e.dpo_auto_verdict,
    e.dpo_final_verdict,
    e.dpo_conditions,
    e.dpo_motivations,
    e.status as eval_status,
    e.school_year,
    e.registered_at,
    e.version
FROM ai_systems s
LEFT JOIN LATERAL (
    SELECT * FROM evaluations e2 
    WHERE e2.ai_system_id = s.id 
    ORDER BY e2.version DESC 
    LIMIT 1
) e ON true;

-- Aggiorna v_evaluation_detail per includere i nuovi campi Step 2
CREATE OR REPLACE VIEW v_evaluation_detail AS
SELECT 
    e.*,
    s.name as system_name,
    s.provider,
    s.website_url,
    s.categories,
    s.subjects,
    s.activity_area,
    s.activities_didattica,
    s.activities_amministrazione,
    s.is_active,
    s.adoption_date,
    s.responsible_person,
    s.notes as system_notes,
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
