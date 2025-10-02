ALTER TABLE "refresh_tokens" ALTER COLUMN "refresh_token" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" SET NOT NULL;