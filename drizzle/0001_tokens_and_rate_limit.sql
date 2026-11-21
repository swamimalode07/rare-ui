CREATE TABLE "cli_token" (
	"user_id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"token_prefix" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cli_token_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "license" DROP CONSTRAINT "license_token_hash_unique";--> statement-breakpoint
ALTER TABLE "cli_token" ADD CONSTRAINT "cli_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license" DROP COLUMN "token_hash";--> statement-breakpoint
ALTER TABLE "license" DROP COLUMN "token_prefix";