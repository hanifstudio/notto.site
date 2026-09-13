CREATE INDEX "templates_status_published_at_idx" ON "templates" USING btree ("status","published_at" DESC NULLS LAST,"slug" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "templates_status_access_idx" ON "templates" USING btree ("status","access");--> statement-breakpoint
CREATE INDEX "templates_status_category_idx" ON "templates" USING btree ("status","category");