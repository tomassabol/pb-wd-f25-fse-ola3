CREATE TABLE "category" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entry" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category_id" varchar,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "entry" ADD CONSTRAINT "entry_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;