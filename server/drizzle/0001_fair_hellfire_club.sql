CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "category_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "entry" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "entry" DROP COLUMN "updated_at";