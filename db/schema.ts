import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const jobs = sqliteTable('jobs', { id: text('id').primaryKey(), userId: text('user_id').notNull(), payload: text('payload').notNull(), updatedAt: integer('updated_at').notNull() });
export const profiles = sqliteTable('profiles', { userId: text('user_id').primaryKey(), payload: text('payload').notNull() });
export const attachments = sqliteTable('attachments', { id: text('id').primaryKey(), userId: text('user_id').notNull(), jobId: text('job_id').notNull(), key: text('key').notNull(), name: text('name').notNull(), contentType: text('content_type').notNull(), size: integer('size').notNull() });
export const assessmentCache = sqliteTable('assessment_cache',{id:text('id').primaryKey(),userId:text('user_id').notNull(),state:text('state').notNull(),createdAt:integer('created_at').notNull(),leaseUntil:integer('lease_until').notNull(),result:text('result'),error:text('error')});
export const assessmentUsage = sqliteTable('assessment_usage',{id:text('id').primaryKey(),userId:text('user_id').notNull(),day:text('day').notNull(),calls:integer('calls').notNull()});

