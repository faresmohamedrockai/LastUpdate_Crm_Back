import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugTaskDates() {
  try {
    console.log('🔍 Debugging Task Dates...\n');

    // Test 1: Check existing tasks
    console.log('📋 Existing Tasks:');
    const existingTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    existingTasks.forEach((task, index) => {
      console.log(`\nTask ${index + 1}:`);
      console.log(`  ID: ${task.id}`);
      console.log(`  Title: ${task.title}`);
      console.log(`  Due Date: ${task.dueDate} (Type: ${typeof task.dueDate})`);
      console.log(`  Created At: ${task.createdAt} (Type: ${typeof task.createdAt})`);
      console.log(`  Updated At: ${task.updatedAt} (Type: ${typeof task.updatedAt})`);
      console.log(`  Created By ID: ${task.createdById}`);
      console.log(`  Assigned To ID: ${task.assignedToId}`);
    });

    // Test 2: Create a new task with proper dates
    console.log('\n\n🧪 Creating New Task...');
    const newTask = await prisma.task.create({
      data: {
        title: 'Debug Test Task',
        description: 'Testing date handling',
        dueDate: new Date('2024-02-15T10:00:00Z'),
        type: 'general',
        priority: 'medium',
        status: 'pending',
        reminder: true,
        createdById: existingTasks[0]?.createdById || null,
        assignedToId: existingTasks[0]?.assignedToId || null,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      }
    });

    console.log('\n✅ New Task Created:');
    console.log(`  ID: ${newTask.id}`);
    console.log(`  Title: ${newTask.title}`);
    console.log(`  Due Date: ${newTask.dueDate} (Type: ${typeof newTask.dueDate})`);
    console.log(`  Created At: ${newTask.createdAt} (Type: ${typeof newTask.createdAt})`);
    console.log(`  Updated At: ${newTask.updatedAt} (Type: ${typeof newTask.updatedAt})`);
    console.log(`  Created By: ${newTask.createdBy?.name || 'Unknown'}`);
    console.log(`  Assigned To: ${newTask.assignedTo?.name || 'Unassigned'}`);

    // Test 3: Update the task
    console.log('\n\n🔄 Updating Task...');
    const updatedTask = await prisma.task.update({
      where: { id: newTask.id },
      data: {
        title: 'Updated Debug Test Task',
        dueDate: new Date('2024-03-15T10:00:00Z'),
      },
      include: {
        createdBy: true,
        assignedTo: true,
      }
    });

    console.log('\n✅ Task Updated:');
    console.log(`  ID: ${updatedTask.id}`);
    console.log(`  Title: ${updatedTask.title}`);
    console.log(`  Due Date: ${updatedTask.dueDate} (Type: ${typeof updatedTask.dueDate})`);
    console.log(`  Created At: ${updatedTask.createdAt} (Type: ${typeof updatedTask.createdAt})`);
    console.log(`  Updated At: ${updatedTask.updatedAt} (Type: ${typeof updatedTask.updatedAt})`);

    // Test 4: Clean up - delete the test task
    console.log('\n\n🗑️ Cleaning up test task...');
    await prisma.task.delete({
      where: { id: newTask.id }
    });
    console.log('✅ Test task deleted');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTaskDates(); 