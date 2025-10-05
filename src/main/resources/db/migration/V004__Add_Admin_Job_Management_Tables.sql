-- Admin Job Management Database Schema Extensions
-- Version: V004
-- Description: Add tables for job moderation, audit trails, admin metadata, and performance metrics

-- Job Moderation Table
CREATE TABLE job_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    admin_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('APPROVED', 'REJECTED', 'FLAGGED', 'PENDING')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_job_moderation_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_moderation_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_job_moderation UNIQUE(job_id)
);

-- Job Audit Trail Table
CREATE TABLE job_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_role VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    CONSTRAINT fk_job_audit_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin Job Metadata Table
CREATE TABLE admin_job_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
    is_featured BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    moderation_status VARCHAR(50) DEFAULT 'PENDING' CHECK (moderation_status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')),
    created_by_admin UUID,
    updated_by_admin UUID,
    featured_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_admin_job_metadata_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_job_metadata_creator FOREIGN KEY (created_by_admin) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_admin_job_metadata_updater FOREIGN KEY (updated_by_admin) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_admin_job_metadata UNIQUE(job_id)
);

-- Job Performance Metrics Table
CREATE TABLE job_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_application_quality_score DECIMAL(3,2),
    time_to_first_application_hours INTEGER,
    total_search_appearances INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0.00,
    calculated_at TIMESTAMP DEFAULT NOW(),
    period_start TIMESTAMP DEFAULT NOW(),
    period_end TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_job_performance_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT unique_job_performance UNIQUE(job_id)
);

-- Employer Job Quotas Table (Admin feature)
CREATE TABLE employer_job_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL,
    max_active_jobs INTEGER DEFAULT 10,
    max_featured_jobs INTEGER DEFAULT 2,
    quota_period VARCHAR(20) DEFAULT 'MONTHLY' CHECK (quota_period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')),
    current_active_count INTEGER DEFAULT 0,
    current_featured_count INTEGER DEFAULT 0,
    reset_date TIMESTAMP DEFAULT NOW(),
    created_by_admin UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_employer_quota_employer FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_employer_quota_admin FOREIGN KEY (created_by_admin) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_employer_quota UNIQUE(employer_id)
);

-- Job Categories Table (Admin managed)
CREATE TABLE job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_by_admin UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_job_category_parent FOREIGN KEY (parent_category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_job_category_admin FOREIGN KEY (created_by_admin) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_job_category_name UNIQUE(name)
);

-- Job Category Mappings
CREATE TABLE job_category_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    category_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_job_category_mapping_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_category_mapping_category FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE CASCADE,
    CONSTRAINT unique_job_category_mapping UNIQUE(job_id, category_id)
);

-- Indexes for performance optimization
CREATE INDEX idx_job_moderation_job_id ON job_moderation(job_id);
CREATE INDEX idx_job_moderation_admin_id ON job_moderation(admin_id);
CREATE INDEX idx_job_moderation_action ON job_moderation(action);
CREATE INDEX idx_job_moderation_created_at ON job_moderation(created_at);

CREATE INDEX idx_job_audit_trail_job_id ON job_audit_trail(job_id);
CREATE INDEX idx_job_audit_trail_user_id ON job_audit_trail(user_id);
CREATE INDEX idx_job_audit_trail_timestamp ON job_audit_trail(timestamp);
CREATE INDEX idx_job_audit_trail_action ON job_audit_trail(action);

CREATE INDEX idx_admin_job_metadata_job_id ON admin_job_metadata(job_id);
CREATE INDEX idx_admin_job_metadata_moderation_status ON admin_job_metadata(moderation_status);
CREATE INDEX idx_admin_job_metadata_is_featured ON admin_job_metadata(is_featured);
CREATE INDEX idx_admin_job_metadata_priority_level ON admin_job_metadata(priority_level);

CREATE INDEX idx_job_performance_metrics_job_id ON job_performance_metrics(job_id);
CREATE INDEX idx_job_performance_metrics_calculated_at ON job_performance_metrics(calculated_at);
CREATE INDEX idx_job_performance_metrics_conversion_rate ON job_performance_metrics(conversion_rate);

CREATE INDEX idx_employer_job_quotas_employer_id ON employer_job_quotas(employer_id);
CREATE INDEX idx_employer_job_quotas_reset_date ON employer_job_quotas(reset_date);

CREATE INDEX idx_job_categories_parent_id ON job_categories(parent_category_id);
CREATE INDEX idx_job_categories_is_active ON job_categories(is_active);
CREATE INDEX idx_job_categories_sort_order ON job_categories(sort_order);

CREATE INDEX idx_job_category_mappings_job_id ON job_category_mappings(job_id);
CREATE INDEX idx_job_category_mappings_category_id ON job_category_mappings(category_id);

-- Insert default job categories
INSERT INTO job_categories (name, description, created_at) VALUES
('Technology', 'Software development, IT, and technology roles', NOW()),
('Healthcare', 'Medical, nursing, and healthcare positions', NOW()),
('Finance', 'Banking, accounting, and financial services', NOW()),
('Education', 'Teaching, training, and educational roles', NOW()),
('Marketing', 'Digital marketing, advertising, and communications', NOW()),
('Sales', 'Sales representatives, business development', NOW()),
('Engineering', 'Mechanical, civil, electrical engineering', NOW()),
('Customer Service', 'Support, help desk, and customer relations', NOW()),
('Human Resources', 'HR, recruitment, and people operations', NOW()),
('Operations', 'Operations management, logistics, supply chain', NOW());

-- Insert default employer quotas for existing employers (if any)
INSERT INTO employer_job_quotas (employer_id, max_active_jobs, max_featured_jobs, created_at)
SELECT id, 10, 2, NOW()
FROM employer_profiles
WHERE NOT EXISTS (
    SELECT 1 FROM employer_job_quotas WHERE employer_id = employer_profiles.id
);