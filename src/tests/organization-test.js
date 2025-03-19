// Test for organization functionality

import { initTestDB, createTestUser, cleanupTestData } from '../lib/test-utils';
import { createOrganization, getOrganizationById, getUserOrganizations, updateOrganization, addOrganizationMember, getOrganizationMembers, updateMemberRole, removeOrganizationMember } from '../lib/organizations';

/**
 * Test organization functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testOrganizations(env) {
  console.log('Testing organization functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test users
    console.log('Creating test users...');
    const owner = await createTestUser(db, { name: 'Organization Owner', email: 'owner@example.com' });
    const member1 = await createTestUser(db, { name: 'Organization Member 1', email: 'member1@example.com' });
    const member2 = await createTestUser(db, { name: 'Organization Member 2', email: 'member2@example.com' });
    
    // Test create organization
    console.log('Testing create organization...');
    const orgData = {
      name: 'Test Organization'
    };
    
    const organization = await createOrganization(db, orgData.name, owner.id);
    console.log('Organization created successfully:', organization);
    
    if (!organization.id || organization.name !== orgData.name || organization.owner_id !== owner.id) {
      throw new Error('Create organization failed: Invalid organization data');
    }
    
    // Test get organization by ID
    console.log('Testing get organization by ID...');
    const retrievedOrg = await getOrganizationById(db, organization.id);
    console.log('Organization retrieved successfully:', retrievedOrg);
    
    if (retrievedOrg.id !== organization.id || retrievedOrg.name !== orgData.name) {
      throw new Error('Get organization by ID failed: Invalid organization data');
    }
    
    // Test get user organizations
    console.log('Testing get user organizations...');
    const userOrgs = await getUserOrganizations(db, owner.id);
    console.log('User organizations retrieved successfully:', userOrgs);
    
    if (!userOrgs.length || userOrgs[0].id !== organization.id) {
      throw new Error('Get user organizations failed: Organization not found');
    }
    
    // Test update organization
    console.log('Testing update organization...');
    const updatedOrgData = {
      name: 'Updated Test Organization'
    };
    
    const updatedOrg = await updateOrganization(db, organization.id, updatedOrgData);
    console.log('Organization updated successfully:', updatedOrg);
    
    if (updatedOrg.name !== updatedOrgData.name) {
      throw new Error('Update organization failed: Name not updated');
    }
    
    // Test add organization member
    console.log('Testing add organization member...');
    const memberRole = 'admin';
    const addedMember = await addOrganizationMember(db, organization.id, member1.id, memberRole);
    console.log('Organization member added successfully:', addedMember);
    
    if (addedMember.user_id !== member1.id || addedMember.role !== memberRole) {
      throw new Error('Add organization member failed: Invalid member data');
    }
    
    // Add another member
    await addOrganizationMember(db, organization.id, member2.id, 'member');
    
    // Test get organization members
    console.log('Testing get organization members...');
    const members = await getOrganizationMembers(db, organization.id);
    console.log('Organization members retrieved successfully:', members);
    
    if (members.length !== 3) { // Owner + 2 members
      throw new Error('Get organization members failed: Incorrect number of members');
    }
    
    // Test update member role
    console.log('Testing update member role...');
    const newRole = 'member';
    const updatedMember = await updateMemberRole(db, organization.id, member1.id, newRole);
    console.log('Member role updated successfully:', updatedMember);
    
    if (updatedMember.role !== newRole) {
      throw new Error('Update member role failed: Role not updated');
    }
    
    // Test remove organization member
    console.log('Testing remove organization member...');
    await removeOrganizationMember(db, organization.id, member2.id);
    
    // Verify member was removed
    const membersAfterRemoval = await getOrganizationMembers(db, organization.id);
    console.log('Organization members after removal:', membersAfterRemoval);
    
    if (membersAfterRemoval.length !== 2) { // Owner + 1 member
      throw new Error('Remove organization member failed: Member not removed');
    }
    
    console.log('Organization tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Organization tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
