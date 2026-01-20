ALTER TABLE "teams" DROP CONSTRAINT "team_size_check";--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "team_size_check" CHECK ("teams"."team_size" BETWEEN 1 AND 10);