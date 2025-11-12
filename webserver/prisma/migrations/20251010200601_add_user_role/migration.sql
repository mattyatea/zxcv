-- CreateTable
CREATE TABLE "users" (
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

-- CreateTable
CREATE TABLE "rules" (
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

-- CreateTable
CREATE TABLE "rule_versions" (
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

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    "updated_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joined_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "reset_at" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "api_keys" (
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

-- CreateTable
CREATE TABLE "rule_stars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "rule_stars_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rule_stars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rule_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "rule_views_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "rule_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "used_at" INTEGER,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "used_at" INTEGER,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch()),
    CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "oauth_accounts" (
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

-- CreateTable
CREATE TABLE "oauth_states" (
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

-- CreateTable
CREATE TABLE "oauth_temp_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "provider_username" TEXT,
    "expires_at" INTEGER NOT NULL,
    "created_at" INTEGER NOT NULL DEFAULT (unixepoch())
);

-- CreateTable
CREATE TABLE "organization_invitations" (
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

-- CreateTable
CREATE TABLE "device_codes" (
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

-- CreateTable
CREATE TABLE "cli_tokens" (
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "rules_user_id_idx" ON "rules"("user_id");

-- CreateIndex
CREATE INDEX "rules_visibility_idx" ON "rules"("visibility");

-- CreateIndex
CREATE INDEX "rules_name_idx" ON "rules"("name");

-- CreateIndex
CREATE INDEX "rules_updated_at_idx" ON "rules"("updated_at");

-- CreateIndex
CREATE INDEX "rules_organization_id_idx" ON "rules"("organization_id");

-- CreateIndex
CREATE INDEX "rules_type_idx" ON "rules"("type");

-- CreateIndex
CREATE INDEX "rule_versions_rule_id_idx" ON "rule_versions"("rule_id");

-- CreateIndex
CREATE INDEX "rule_versions_created_by_idx" ON "rule_versions"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "rule_versions_rule_id_version_number_key" ON "rule_versions"("rule_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_name_idx" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organizations_owner_id_idx" ON "organizations"("owner_id");

-- CreateIndex
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members"("organization_id");

-- CreateIndex
CREATE INDEX "organization_members_user_id_idx" ON "organization_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits"("reset_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_expires_at_idx" ON "api_keys"("expires_at");

-- CreateIndex
CREATE INDEX "rule_stars_rule_id_idx" ON "rule_stars"("rule_id");

-- CreateIndex
CREATE INDEX "rule_stars_user_id_idx" ON "rule_stars"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "rule_stars_rule_id_user_id_key" ON "rule_stars"("rule_id", "user_id");

-- CreateIndex
CREATE INDEX "rule_views_rule_id_idx" ON "rule_views"("rule_id");

-- CreateIndex
CREATE INDEX "rule_views_user_id_idx" ON "rule_views"("user_id");

-- CreateIndex
CREATE INDEX "rule_views_created_at_idx" ON "rule_views"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_token_idx" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "password_resets_expires_at_idx" ON "password_resets"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "email_verifications_token_idx" ON "email_verifications"("token");

-- CreateIndex
CREATE INDEX "email_verifications_expires_at_idx" ON "email_verifications"("expires_at");

-- CreateIndex
CREATE INDEX "oauth_accounts_user_id_idx" ON "oauth_accounts"("user_id");

-- CreateIndex
CREATE INDEX "oauth_accounts_provider_idx" ON "oauth_accounts"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_accounts_provider_provider_id_key" ON "oauth_accounts"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_states_state_key" ON "oauth_states"("state");

-- CreateIndex
CREATE INDEX "oauth_states_state_idx" ON "oauth_states"("state");

-- CreateIndex
CREATE INDEX "oauth_states_expires_at_idx" ON "oauth_states"("expires_at");

-- CreateIndex
CREATE INDEX "oauth_states_client_ip_idx" ON "oauth_states"("client_ip");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_temp_registrations_token_key" ON "oauth_temp_registrations"("token");

-- CreateIndex
CREATE INDEX "oauth_temp_registrations_token_idx" ON "oauth_temp_registrations"("token");

-- CreateIndex
CREATE INDEX "oauth_temp_registrations_expires_at_idx" ON "oauth_temp_registrations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_token_key" ON "organization_invitations"("token");

-- CreateIndex
CREATE INDEX "organization_invitations_token_idx" ON "organization_invitations"("token");

-- CreateIndex
CREATE INDEX "organization_invitations_organization_id_idx" ON "organization_invitations"("organization_id");

-- CreateIndex
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations"("email");

-- CreateIndex
CREATE INDEX "organization_invitations_expires_at_idx" ON "organization_invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_codes_device_code_key" ON "device_codes"("device_code");

-- CreateIndex
CREATE UNIQUE INDEX "device_codes_user_code_key" ON "device_codes"("user_code");

-- CreateIndex
CREATE INDEX "device_codes_device_code_idx" ON "device_codes"("device_code");

-- CreateIndex
CREATE INDEX "device_codes_user_code_idx" ON "device_codes"("user_code");

-- CreateIndex
CREATE INDEX "device_codes_expires_at_idx" ON "device_codes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "cli_tokens_token_hash_key" ON "cli_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "cli_tokens_token_hash_idx" ON "cli_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "cli_tokens_user_id_idx" ON "cli_tokens"("user_id");

-- CreateIndex
CREATE INDEX "cli_tokens_expires_at_idx" ON "cli_tokens"("expires_at");
