import {
    pgTable,
    uuid,
    text,
    timestamp,
    primaryKey,
    pgEnum,
    jsonb,
    bigint,
    real,
  } from "drizzle-orm/pg-core";
  
  //
  // ENUMS
  //
  
  export const workspaceRoleEnum = pgEnum("workspace_role", [
    "owner",
    "admin",
    "member",
    "viewer",
  ]);
  
  export const projectStatusEnum = pgEnum("project_status", [
    "active",
    "archived",
    "done",
  ]);
  
  export const taskStatusEnum = pgEnum("task_status", [
    "todo",
    "in_progress",
    "review",
    "done",
  ]);
  
  export const taskPriorityEnum = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
    "urgent",
  ]);
  
  //
  // USERS
  //
  
  export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    email: text("email").notNull().unique(),
  
    passwordHash: text("password_hash"),
  
    name: text("name").notNull(),
  
    avatarUrl: text("avatar_url"),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // WORKSPACES
  //
  
  export const workspaces = pgTable("workspaces", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    name: text("name").notNull(),
  
    slug: text("slug").notNull().unique(),
  
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
  
    plan: text("plan").default("free"),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // WORKSPACE MEMBERS
  //
  
  export const workspaceMembers = pgTable(
    "workspace_members",
    {
      workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id),
  
      userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
  
      role: workspaceRoleEnum("role").notNull(),
  
      joinedAt: timestamp("joined_at", {
        withTimezone: true,
      }).defaultNow(),
    },
    (table) => [
      primaryKey({
        columns: [table.workspaceId, table.userId],
      }),
    ]
  );
  
  //
  // PROJECTS
  //
  
  export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id),
  
    name: text("name").notNull(),
  
    description: text("description"),
  
    status: projectStatusEnum("status").default("active"),
  
    createdBy: uuid("created_by").references(() => users.id),
  });
  
  //
  // TASKS
  //
  
  export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
  
    title: text("title").notNull(),
  
    description: text("description"),
  
    status: taskStatusEnum("status").default("todo"),
  
    priority: taskPriorityEnum("priority").default("medium"),
  
    assigneeId: uuid("assignee_id").references(() => users.id),
  
    dueDate: timestamp("due_date", {
      withTimezone: true,
    }),
  
    position: real("position"),
  
    createdBy: uuid("created_by").references(() => users.id),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // COMMENTS
  //
  
  export const comments = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id),
  
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
  
    body: text("body").notNull(),
  
    editedAt: timestamp("edited_at", {
      withTimezone: true,
    }),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // ATTACHMENTS
  //
  
  export const attachments = pgTable("attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id),
  
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
  
    filename: text("filename").notNull(),
  
    url: text("url").notNull(),
  
    sizeBytes: bigint("size_bytes", {
      mode: "number",
    }),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // NOTIFICATIONS
  //
  
  export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  
    type: text("type").notNull(),
  
    payload: jsonb("payload"),
  
    readAt: timestamp("read_at", {
      withTimezone: true,
    }),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // REFRESH TOKENS
  //
  
  export const refreshTokens = pgTable("refresh_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  
    tokenHash: text("token_hash").notNull().unique(),
  
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),
  
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });
  
  //
  // AUDIT LOGS
  //
  
  export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    actorId: uuid("actor_id").references(() => users.id),
  
    action: text("action").notNull(),
  
    entityType: text("entity_type").notNull(),
  
    entityId: uuid("entity_id"),
  
    metadata: jsonb("metadata"),
  
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow(),
  });