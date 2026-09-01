-- ============================================================================
-- V25: PostgreSQL Audit Triggers & Append-Only Enforcement
-- ============================================================================

-- 1. Prevent UPDATE or DELETE on audit_logs (Append-Only guarantee)
CREATE OR REPLACE FUNCTION prevent_audit_logs_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'UPDATE and DELETE operations on audit_logs table are strictly prohibited';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_prevent_modification ON audit_logs;

CREATE TRIGGER trg_audit_logs_prevent_modification
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_logs_modification();

-- 2. Automatically log user role changes (Privilege Escalation Audit)
CREATE OR REPLACE FUNCTION audit_user_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
        VALUES (
            NEW.id,
            'USER_ROLE_CHANGED',
            'User',
            NEW.id,
            json_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'email', NEW.email,
                'source', 'DB_TRIGGER'
            )::text,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_user_role_change ON users;

CREATE TRIGGER trg_audit_user_role_change
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_user_role_change();

-- 3. Automatically log enrollment status transitions
CREATE OR REPLACE FUNCTION audit_enrollment_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, created_at)
        VALUES (
            NEW.user_id,
            'ENROLLMENT_STATUS_CHANGED',
            'Enrollment',
            NEW.id,
            json_build_object(
                'course_id', NEW.course_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'source', 'DB_TRIGGER'
            )::text,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_enrollment_status_change ON enrollments;

CREATE TRIGGER trg_audit_enrollment_status_change
    AFTER UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION audit_enrollment_status_change();
