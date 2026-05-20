PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`hourly_rate` integer DEFAULT 8000,
	`overtime_rate` real DEFAULT 1.25,
	`night_surcharge` real DEFAULT 1.35,
	`night_overtime_rate` real DEFAULT 1.75,
	`holiday_surcharge` real DEFAULT 1.8,
	`holiday_overtime_rate` real DEFAULT 2.05,
	`holiday_night_overtime_rate` real DEFAULT 2.55,
	`sunday_surcharge` real DEFAULT 1.8,
	`sunday_overtime_rate` real DEFAULT 2.05,
	`sunday_night_overtime_rate` real DEFAULT 2.55,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_config`("id", "user_id", "hourly_rate", "overtime_rate", "night_surcharge", "night_overtime_rate", "holiday_surcharge", "holiday_overtime_rate", "holiday_night_overtime_rate", "sunday_surcharge", "sunday_overtime_rate", "sunday_night_overtime_rate", "updated_at") SELECT "id", "user_id", "hourly_rate", "overtime_rate", "night_surcharge", "night_overtime_rate", "holiday_surcharge", "holiday_overtime_rate", "holiday_night_overtime_rate", "sunday_surcharge", "sunday_overtime_rate", "sunday_night_overtime_rate", "updated_at" FROM `config`;--> statement-breakpoint
DROP TABLE `config`;--> statement-breakpoint
ALTER TABLE `__new_config` RENAME TO `config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `config_user_id_unique` ON `config` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_shifts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`regular_hours` real DEFAULT 0,
	`overtime_hours` real DEFAULT 0,
	`night_hours` real DEFAULT 0,
	`night_overtime_hours` real DEFAULT 0,
	`holiday_hours` real DEFAULT 0,
	`holiday_overtime_hours` real DEFAULT 0,
	`holiday_night_overtime_hours` real DEFAULT 0,
	`sunday_hours` real DEFAULT 0,
	`sunday_overtime_hours` real DEFAULT 0,
	`sunday_night_overtime_hours` real DEFAULT 0,
	`estimated_payment` integer DEFAULT 0,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_shifts`("id", "user_id", "start_time", "end_time", "regular_hours", "overtime_hours", "night_hours", "night_overtime_hours", "holiday_hours", "holiday_overtime_hours", "holiday_night_overtime_hours", "sunday_hours", "sunday_overtime_hours", "sunday_night_overtime_hours", "estimated_payment", "status", "created_at") SELECT "id", "user_id", "start_time", "end_time", "regular_hours", "overtime_hours", "night_hours", "night_overtime_hours", "holiday_hours", "holiday_overtime_hours", "holiday_night_overtime_hours", "sunday_hours", "sunday_overtime_hours", "sunday_night_overtime_hours", "estimated_payment", "status", "created_at" FROM `shifts`;--> statement-breakpoint
DROP TABLE `shifts`;--> statement-breakpoint
ALTER TABLE `__new_shifts` RENAME TO `shifts`;