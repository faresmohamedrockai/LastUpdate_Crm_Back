#!/usr/bin/env ts-node
/**
 * Test script to verify meeting access control implementation
 * This script can be used to test the different access scenarios
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMeetingAccessControl() {
  console.log('🧪 Testing Meeting Access Control Implementation...\n');

  try {
    // Test 1: Check if we have users with different roles
    console.log('1️⃣ Checking user roles distribution...');
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });
    
    console.log('Users by role:');
    usersByRole.forEach(({ role, _count }) => {
      console.log(`   ${role}: ${_count.role} users`);
    });

    // Test 2: Check team hierarchy
    console.log('\n2️⃣ Checking team hierarchy...');
    const teamLeaders = await prisma.user.findMany({
      where: { role: 'team_leader' },
      include: {
        teamMembers: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (teamLeaders.length > 0) {
      console.log('Team leaders and their members:');
      teamLeaders.forEach(leader => {
        console.log(`   ${leader.name} (${leader.email}): ${leader.teamMembers.length} team members`);
        leader.teamMembers.forEach(member => {
          console.log(`     - ${member.name} (${member.email})`);
        });
      });
    } else {
      console.log('   No team leaders found');
    }

    // Test 3: Check meetings distribution
    console.log('\n3️⃣ Checking meetings distribution...');
    const meetingsCount = await prisma.meeting.count();
    console.log(`Total meetings: ${meetingsCount}`);

    if (meetingsCount > 0) {
      const meetingsByCreator = await prisma.meeting.groupBy({
        by: ['createdById'],
        _count: {
          createdById: true,
        }
      });

      console.log('Meetings by creator:');
      for (const group of meetingsByCreator) {
        if (group.createdById) {
          const creator = await prisma.user.findUnique({
            where: { id: group.createdById },
            select: { name: true, email: true, role: true }
          });
          console.log(`   ${creator?.name} (${creator?.role}): ${group._count.createdById} meetings`);
        }
      }
    }

    // Test 4: Test scenario recommendations
    console.log('\n4️⃣ Test Scenario Recommendations:');
    console.log('To test the access control implementation:');
    console.log('1. Create meetings with different users (sales_rep, team_leader, admin)');
    console.log('2. Test GET /meetings with different role tokens');
    console.log('3. Verify that:');
    console.log('   - Sales reps only see their own meetings');
    console.log('   - Team leaders see their own + team members\' meetings');
    console.log('   - Admins/Sales admins see all meetings');
    console.log('4. Test PATCH/DELETE operations to ensure access control');

    // Sample test queries for manual testing
    console.log('\n📝 Sample test queries for different roles:');
    
    const sampleSalesRep = await prisma.user.findFirst({
      where: { role: 'sales_rep' }
    });
    
    const sampleTeamLeader = await prisma.user.findFirst({
      where: { role: 'team_leader' }
    });

    if (sampleSalesRep) {
      console.log(`\nFor sales_rep (${sampleSalesRep.email}):`);
      console.log('Should only see meetings where:');
      console.log(`- createdById = "${sampleSalesRep.id}" OR assignedToId = "${sampleSalesRep.id}"`);
    }

    if (sampleTeamLeader) {
      const teamMembers = await prisma.user.findMany({
        where: { teamLeaderId: sampleTeamLeader.id },
        select: { id: true }
      });
      
      console.log(`\nFor team_leader (${sampleTeamLeader.email}):`);
      console.log('Should see meetings where:');
      console.log(`- createdById = "${sampleTeamLeader.id}" OR assignedToId = "${sampleTeamLeader.id}"`);
      if (teamMembers.length > 0) {
        const memberIds = teamMembers.map(m => m.id);
        console.log(`- OR createdById IN [${memberIds.map(id => `"${id}"`).join(', ')}]`);
        console.log(`- OR assignedToId IN [${memberIds.map(id => `"${id}"`).join(', ')}]`);
      }
    }

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMeetingAccessControl()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });