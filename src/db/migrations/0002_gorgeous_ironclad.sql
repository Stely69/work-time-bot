PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`hourly_rate` real DEFAULT 8000,
	`overtime_rate` real DEFAULT 1.25,
	`night_surcharge` real DEFAULT 1.35,
	`night_overtime_rate` real DEFAULT 1.8,
	`holiday_surcharge` real DEFAULT 1.8,
	`sunday_surcharge` real DEFAULT 1.8,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_config`("id", "user_id", "hourly_rate", "overtime_rate", "night_surcharge", "night_overtime_rate", "holiday_surcharge", "sunday_surcharge", "updated_at") SELECT "id", "user_id", "hourly_rate", "overtime_rate", "night_surcharge", "night_overtime_rate", "holiday_surcharge", "sunday_surcharge", "updated_at" FROM `config`;--> statement-breakpoint
DROP TABLE `config`;--> statement-breakpoint
ALTER TABLE `__new_config` RENAME TO `config`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `config_user_id_unique` ON `config` (`user_id`);