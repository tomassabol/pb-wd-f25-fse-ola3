ALTER TABLE "category" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "entry" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;