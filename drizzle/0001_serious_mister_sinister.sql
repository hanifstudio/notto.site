CREATE TYPE "public"."template_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "status" "template_status" DEFAULT 'draft' NOT NULL;