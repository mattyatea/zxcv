-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "reporter_id" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "review_note" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "updated_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "resolved_at" INTEGER,
    CONSTRAINT "reports_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reports_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "last_used_at" INTEGER,
    "expires_at" INTEGER,
    "scopes" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_api_keys" ("created_at", "expires_at", "id", "key_hash", "last_used_at", "name", "scopes", "user_id") SELECT "created_at", "expires_at", "id", "key_hash", "last_used_at", "name", "scopes", "user_id" FROM "api_keys";
DROP TABLE "api_keys";
ALTER TABLE "new_api_keys" RENAME TO "api_keys";
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");
CREATE INDEX "api_keys_expires_at_idx" ON "api_keys"("expires_at");
CREATE TABLE "new_cli_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'CLI Token',
    "client_id" TEXT NOT NULL,
    "last_used_at" INTEGER,
    "expires_at" INTEGER,
    "scope" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "cli_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cli_tokens" ("client_id", "created_at", "expires_at", "id", "last_used_at", "name", "scope", "token_hash", "user_id") SELECT "client_id", "created_at", "expires_at", "id", "last_used_at", "name", "scope", "token_hash", "user_id" FROM "cli_tokens";
DROP TABLE "cli_tokens";
ALTER TABLE "new_cli_tokens" RENAME TO "cli_tokens";
CREATE UNIQUE INDEX "cli_tokens_token_hash_key" ON "cli_tokens"("token_hash");
CREATE INDEX "cli_tokens_token_hash_idx" ON "cli_tokens"("token_hash");
CREATE INDEX "cli_tokens_user_id_idx" ON "cli_tokens"("user_id");
CREATE INDEX "cli_tokens_expires_at_idx" ON "cli_tokens"("expires_at");
CREATE TABLE "new_device_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "device_code" TEXT NOT NULL,
    "user_code" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,
    "client_id" TEXT NOT NULL,
    "scope" TEXT,
    "expires_at" INTEGER NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 5,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_attempt" INTEGER,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "device_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_device_codes" ("attempt_count", "client_id", "created_at", "device_code", "expires_at", "id", "interval", "is_approved", "last_attempt", "scope", "user_code", "user_id") SELECT "attempt_count", "client_id", "created_at", "device_code", "expires_at", "id", "interval", "is_approved", "last_attempt", "scope", "user_code", "user_id" FROM "device_codes";
DROP TABLE "device_codes";
ALTER TABLE "new_device_codes" RENAME TO "device_codes";
CREATE UNIQUE INDEX "device_codes_device_code_key" ON "device_codes"("device_code");
CREATE UNIQUE INDEX "device_codes_user_code_key" ON "device_codes"("user_code");
CREATE INDEX "device_codes_device_code_idx" ON "device_codes"("device_code");
CREATE INDEX "device_codes_user_code_idx" ON "device_codes"("user_code");
CREATE INDEX "device_codes_expires_at_idx" ON "device_codes"("expires_at");
CREATE TABLE "new_email_verifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "used_at" INTEGER,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_email_verifications" ("created_at", "expires_at", "id", "token", "used_at", "user_id") SELECT "created_at", "expires_at", "id", "token", "used_at", "user_id" FROM "email_verifications";
DROP TABLE "email_verifications";
ALTER TABLE "new_email_verifications" RENAME TO "email_verifications";
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");
CREATE INDEX "email_verifications_token_idx" ON "email_verifications"("token");
CREATE INDEX "email_verifications_expires_at_idx" ON "email_verifications"("expires_at");
CREATE TABLE "new_oauth_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "updated_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_oauth_accounts" ("created_at", "email", "id", "provider", "provider_id", "updated_at", "user_id", "username") SELECT "created_at", "email", "id", "provider", "provider_id", "updated_at", "user_id", "username" FROM "oauth_accounts";
DROP TABLE "oauth_accounts";
ALTER TABLE "new_oauth_accounts" RENAME TO "oauth_accounts";
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");
CREATE INDEX "oauth_accounts_provider_idx" ON "oauth_accounts"("provider");
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_id_key" ON "oauth_accounts"("provider", "provider_id");
CREATE TABLE "new_oauth_states" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "code_verifier" TEXT,
    "redirect_url" TEXT,
    "client_ip" TEXT,
    "nonce" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT INTO "new_oauth_states" ("attempt_count", "client_ip", "code_verifier", "created_at", "expires_at", "id", "nonce", "provider", "redirect_url", "state") SELECT "attempt_count", "client_ip", "code_verifier", "created_at", "expires_at", "id", "nonce", "provider", "redirect_url", "state" FROM "oauth_states";
DROP TABLE "oauth_states";
ALTER TABLE "new_oauth_states" RENAME TO "oauth_states";
CREATE UNIQUE INDEX "oauth_states_state_key" ON "oauth_states"("state");
CREATE INDEX "oauth_states_state_idx" ON "oauth_states"("state");
CREATE INDEX "oauth_states_expires_at_idx" ON "oauth_states"("expires_at");
CREATE INDEX "oauth_states_client_ip_idx" ON "oauth_states"("client_ip");
CREATE TABLE "new_oauth_temp_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider_username" TEXT,
    "expires_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT INTO "new_oauth_temp_registrations" ("created_at", "email", "expires_at", "id", "provider", "provider_id", "provider_username", "token") SELECT "created_at", "email", "expires_at", "id", "provider", "provider_id", "provider_username", "token" FROM "oauth_temp_registrations";
DROP TABLE "oauth_temp_registrations";
ALTER TABLE "new_oauth_temp_registrations" RENAME TO "oauth_temp_registrations";
CREATE UNIQUE INDEX "oauth_temp_registrations_token_key" ON "oauth_temp_registrations"("token");
CREATE INDEX "oauth_temp_registrations_token_idx" ON "oauth_temp_registrations"("token");
CREATE INDEX "oauth_temp_registrations_expires_at_idx" ON "oauth_temp_registrations"("expires_at");
CREATE TABLE "new_organization_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organization_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_organization_invitations" ("created_at", "email", "expires_at", "id", "invited_by", "organization_id", "token") SELECT "created_at", "email", "expires_at", "id", "invited_by", "organization_id", "token" FROM "organization_invitations";
DROP TABLE "organization_invitations";
ALTER TABLE "new_organization_invitations" RENAME TO "organization_invitations";
CREATE UNIQUE INDEX "organization_invitations_token_key" ON "organization_invitations"("token");
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations"("token");
CREATE INDEX "organization_invitations_organization_id_idx" ON "organization_invitations"("organization_id");
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations"("email");
CREATE INDEX "organization_invitations_expires_at_idx" ON "organization_invitations"("expires_at");
CREATE TABLE "new_organization_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_organization_members" ("id", "joined_at", "organization_id", "role", "user_id") SELECT "id", "joined_at", "organization_id", "role", "user_id" FROM "organization_members";
DROP TABLE "organization_members";
ALTER TABLE "new_organization_members" RENAME TO "organization_members";
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members"("organization_id");
CREATE INDEX "organization_members_user_id_idx" ON "organization_members"("user_id");
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");
CREATE TABLE "new_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "updated_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_organizations" ("created_at", "description", "display_name", "id", "name", "owner_id", "updated_at") SELECT "created_at", "description", "display_name", "id", "name", "owner_id", "updated_at" FROM "organizations";
DROP TABLE "organizations";
ALTER TABLE "new_organizations" RENAME TO "organizations";
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");
CREATE INDEX "organizations_name_idx" ON "organizations"("name");
CREATE INDEX "organizations_owner_id_idx" ON "organizations"("owner_id");
CREATE TABLE "new_password_resets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "used_at" INTEGER,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_password_resets" ("created_at", "expires_at", "id", "token", "used_at", "user_id") SELECT "created_at", "expires_at", "id", "token", "used_at", "user_id" FROM "password_resets";
DROP TABLE "password_resets";
ALTER TABLE "new_password_resets" RENAME TO "password_resets";
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");
CREATE INDEX "password_resets_expires_at_idx" ON "password_resets"("expires_at");
CREATE TABLE "new_rule_stars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "rule_stars_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rule_stars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rule_stars" ("created_at", "id", "rule_id", "user_id") SELECT "created_at", "id", "rule_id", "user_id" FROM "rule_stars";
DROP TABLE "rule_stars";
ALTER TABLE "new_rule_stars" RENAME TO "rule_stars";
CREATE INDEX "rule_stars_rule_id_idx" ON "rule_stars"("rule_id");
CREATE INDEX "rule_stars_user_id_idx" ON "rule_stars"("user_id");
CREATE UNIQUE INDEX "rule_stars_rule_id_user_id_key" ON "rule_stars"("rule_id", "user_id");
CREATE TABLE "new_rule_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "version_number" TEXT NOT NULL,
    "changelog" TEXT,
    "content_hash" TEXT NOT NULL,
    "r2_object_key" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "created_by" TEXT NOT NULL,
    CONSTRAINT "rule_versions_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rule_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rule_versions" ("changelog", "content_hash", "created_at", "created_by", "id", "r2_object_key", "rule_id", "version_number") SELECT "changelog", "content_hash", "created_at", "created_by", "id", "r2_object_key", "rule_id", "version_number" FROM "rule_versions";
DROP TABLE "rule_versions";
ALTER TABLE "new_rule_versions" RENAME TO "rule_versions";
CREATE INDEX "rule_versions_rule_id_idx" ON "rule_versions"("rule_id");
CREATE INDEX "rule_versions_created_by_idx" ON "rule_versions"("created_by");
CREATE UNIQUE INDEX "rule_versions_rule_id_version_number_key" ON "rule_versions"("rule_id", "version_number");
CREATE TABLE "new_rule_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "rule_views_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rule_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rule_views" ("created_at", "id", "ip_address", "rule_id", "user_agent", "user_id") SELECT "created_at", "id", "ip_address", "rule_id", "user_agent", "user_id" FROM "rule_views";
DROP TABLE "rule_views";
ALTER TABLE "new_rule_views" RENAME TO "rule_views";
CREATE INDEX "rule_views_rule_id_idx" ON "rule_views"("rule_id");
CREATE INDEX "rule_views_user_id_idx" ON "rule_views"("user_id");
CREATE INDEX "rule_views_created_at_idx" ON "rule_views"("created_at");
CREATE TABLE "new_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'rule',
    "visibility" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "updated_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "published_at" INTEGER,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "latest_version_id" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "organization_id" TEXT,
    CONSTRAINT "rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_rules" ("created_at", "description", "id", "latest_version_id", "name", "organization_id", "published_at", "stars", "tags", "type", "updated_at", "user_id", "version", "views", "visibility") SELECT "created_at", "description", "id", "latest_version_id", "name", "organization_id", "published_at", "stars", "tags", "type", "updated_at", "user_id", "version", "views", "visibility" FROM "rules";
DROP TABLE "rules";
ALTER TABLE "new_rules" RENAME TO "rules";
CREATE INDEX "rules_user_id_idx" ON "rules"("user_id");
CREATE INDEX "rules_visibility_idx" ON "rules"("visibility");
CREATE INDEX "rules_name_idx" ON "rules"("name");
CREATE INDEX "rules_updated_at_idx" ON "rules"("updated_at");
CREATE INDEX "rules_organization_id_idx" ON "rules"("organization_id");
CREATE INDEX "rules_type_idx" ON "rules"("type");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "password_hash" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "display_name" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "avatar_url" TEXT,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "updated_at" INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT INTO "new_users" ("avatar_url", "bio", "created_at", "display_name", "email", "email_verified", "id", "location", "password_hash", "role", "settings", "updated_at", "username", "website") SELECT "avatar_url", "bio", "created_at", "display_name", "email", "email_verified", "id", "location", "password_hash", "role", "settings", "updated_at", "username", "website" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_username_idx" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "reports_rule_id_idx" ON "reports"("rule_id");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE INDEX "reports_reviewed_by_idx" ON "reports"("reviewed_by");
