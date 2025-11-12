-- Rename teams table to organizations
ALTER TABLE teams RENAME TO organizations;

-- Rename team_members table to organization_members
ALTER TABLE team_members RENAME TO organization_members;

-- Rename team_invitations table to organization_invitations
ALTER TABLE team_invitations RENAME TO organization_invitations;

-- Rename columns in rules table
ALTER TABLE rules RENAME COLUMN team_id TO organization_id;

-- Rename columns in organization_members table
ALTER TABLE organization_members RENAME COLUMN team_id TO organization_id;

-- Rename columns in organization_invitations table
ALTER TABLE organization_invitations RENAME COLUMN team_id TO organization_id;

-- Update indexes for rules table
DROP INDEX IF EXISTS rules_team_id_idx;
CREATE INDEX rules_organization_id_idx ON rules(organization_id);

-- Update indexes and constraints for organization_members table
DROP INDEX IF EXISTS team_members_team_id_idx;
DROP INDEX IF EXISTS team_members_team_id_user_id_unique;
CREATE INDEX organization_members_organization_id_idx ON organization_members(organization_id);
CREATE UNIQUE INDEX organization_members_organization_id_user_id_unique ON organization_members(organization_id, user_id);

-- Update indexes for organization_invitations table
DROP INDEX IF EXISTS team_invitations_team_id_idx;
CREATE INDEX organization_invitations_organization_id_idx ON organization_invitations(organization_id);

-- Update indexes for organizations table (no changes needed as they use name and owner_id)