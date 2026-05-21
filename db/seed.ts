import { faker } from "@faker-js/faker";

import { db } from "./index";

import {
  users,
  workspaces,
  workspaceMembers,
  projects,
  tasks,
} from "./schema";

async function seed() {
  console.log("Seeding...");

  //
  // USERS
  //

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        email: "admin@test.com",
        name: "Admin",
        passwordHash: "hashed_password",
      },
      {
        email: "john@test.com",
        name: "John",
        passwordHash: "hashed_password",
      },
    ])
    .returning();

  const adminUser = insertedUsers[0];
  const secondUser = insertedUsers[1];

  //
  // WORKSPACE
  //

  const insertedWorkspace = await db
    .insert(workspaces)
    .values({
      name: "My Workspace",
      slug: "my-workspace",
      ownerId: adminUser.id,
    })
    .returning();

  const workspace = insertedWorkspace[0];

  //
  // MEMBERS
  //

  await db.insert(workspaceMembers).values([
    {
      workspaceId: workspace.id,
      userId: adminUser.id,
      role: "owner",
    },
    {
      workspaceId: workspace.id,
      userId: secondUser.id,
      role: "member",
    },
  ]);

  //
  // PROJECT
  //

  const insertedProject = await db
    .insert(projects)
    .values({
      workspaceId: workspace.id,
      name: "Task Manager",
      description: "Main project",
      createdBy: adminUser.id,
    })
    .returning();

  const project = insertedProject[0];

  //
  // TASKS
  //

  const taskValues = Array.from({ length: 10 }).map((_, index) => ({
    projectId: project.id,

    title: faker.lorem.sentence(),

    description: faker.lorem.paragraph(),

    status: faker.helpers.arrayElement([
      "todo",
      "in_progress",
      "review",
      "done",
    ]),

    priority: faker.helpers.arrayElement([
      "low",
      "medium",
      "high",
      "urgent",
    ]),

    assigneeId: faker.helpers.arrayElement([
      adminUser.id,
      secondUser.id,
    ]),

    createdBy: adminUser.id,

    position: index,
  }));

  await db.insert(tasks).values(taskValues);

  console.log("Seed completed");
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });