// Test for CRM functionality

import { initTestDB, createTestUser, createTestOrganization, cleanupTestData } from '../lib/test-utils';
import { createContact, getContactById, getOrganizationContacts, updateContact, deleteContact, createTag, getOrganizationTags, addTagToContact, getContactTags, removeTagFromContact, createSmartList, getOrganizationSmartLists, getSmartListContacts } from '../lib/contacts';

/**
 * Test CRM functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testCRM(env) {
  console.log('Testing CRM functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user and organization
    console.log('Creating test user and organization...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    
    // Test create contact
    console.log('Testing create contact...');
    const contactData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zip: '12345',
      country: 'USA'
    };
    
    const contact = await createContact(db, organization.id, contactData);
    console.log('Contact created successfully:', contact);
    
    if (!contact.id || contact.first_name !== contactData.first_name || contact.email !== contactData.email) {
      throw new Error('Create contact failed: Invalid contact data');
    }
    
    // Create additional contacts for testing
    await createContact(db, organization.id, {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com'
    });
    
    await createContact(db, organization.id, {
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob.johnson@example.com'
    });
    
    // Test get contact by ID
    console.log('Testing get contact by ID...');
    const retrievedContact = await getContactById(db, contact.id, organization.id);
    console.log('Contact retrieved successfully:', retrievedContact);
    
    if (retrievedContact.id !== contact.id || retrievedContact.email !== contactData.email) {
      throw new Error('Get contact by ID failed: Invalid contact data');
    }
    
    // Test get organization contacts
    console.log('Testing get organization contacts...');
    const contacts = await getOrganizationContacts(db, organization.id);
    console.log('Organization contacts retrieved successfully:', contacts);
    
    if (contacts.length !== 3) {
      throw new Error('Get organization contacts failed: Incorrect number of contacts');
    }
    
    // Test update contact
    console.log('Testing update contact...');
    const updatedContactData = {
      first_name: 'Johnny',
      email: 'johnny.doe@example.com'
    };
    
    const updatedContact = await updateContact(db, contact.id, organization.id, updatedContactData);
    console.log('Contact updated successfully:', updatedContact);
    
    if (updatedContact.first_name !== updatedContactData.first_name || updatedContact.email !== updatedContactData.email) {
      throw new Error('Update contact failed: Contact not updated correctly');
    }
    
    // Test create tag
    console.log('Testing create tag...');
    const tagData = {
      name: 'VIP',
      color: '#FF0000'
    };
    
    const tag = await createTag(db, organization.id, tagData.name, tagData.color);
    console.log('Tag created successfully:', tag);
    
    if (!tag.id || tag.name !== tagData.name || tag.color !== tagData.color) {
      throw new Error('Create tag failed: Invalid tag data');
    }
    
    // Create additional tags for testing
    await createTag(db, organization.id, 'Lead', '#00FF00');
    await createTag(db, organization.id, 'Customer', '#0000FF');
    
    // Test get organization tags
    console.log('Testing get organization tags...');
    const tags = await getOrganizationTags(db, organization.id);
    console.log('Organization tags retrieved successfully:', tags);
    
    if (tags.length !== 3) {
      throw new Error('Get organization tags failed: Incorrect number of tags');
    }
    
    // Test add tag to contact
    console.log('Testing add tag to contact...');
    await addTagToContact(db, contact.id, tag.id, organization.id);
    
    // Test get contact tags
    console.log('Testing get contact tags...');
    const contactTags = await getContactTags(db, contact.id, organization.id);
    console.log('Contact tags retrieved successfully:', contactTags);
    
    if (contactTags.length !== 1 || contactTags[0].id !== tag.id) {
      throw new Error('Get contact tags failed: Tag not added correctly');
    }
    
    // Test remove tag from contact
    console.log('Testing remove tag from contact...');
    await removeTagFromContact(db, contact.id, tag.id, organization.id);
    
    // Verify tag was removed
    const contactTagsAfterRemoval = await getContactTags(db, contact.id, organization.id);
    console.log('Contact tags after removal:', contactTagsAfterRemoval);
    
    if (contactTagsAfterRemoval.length !== 0) {
      throw new Error('Remove tag from contact failed: Tag not removed');
    }
    
    // Test create smart list
    console.log('Testing create smart list...');
    const smartListData = {
      name: 'All Contacts',
      filterCriteria: {}
    };
    
    const smartList = await createSmartList(db, organization.id, smartListData.name, smartListData.filterCriteria);
    console.log('Smart list created successfully:', smartList);
    
    if (!smartList.id || smartList.name !== smartListData.name) {
      throw new Error('Create smart list failed: Invalid smart list data');
    }
    
    // Test get organization smart lists
    console.log('Testing get organization smart lists...');
    const smartLists = await getOrganizationSmartLists(db, organization.id);
    console.log('Organization smart lists retrieved successfully:', smartLists);
    
    if (smartLists.length !== 1 || smartLists[0].id !== smartList.id) {
      throw new Error('Get organization smart lists failed: Smart list not found');
    }
    
    // Test get smart list contacts
    console.log('Testing get smart list contacts...');
    const smartListContacts = await getSmartListContacts(db, smartList.id, organization.id);
    console.log('Smart list contacts retrieved successfully:', smartListContacts);
    
    if (smartListContacts.length !== 3) {
      throw new Error('Get smart list contacts failed: Incorrect number of contacts');
    }
    
    // Test delete contact
    console.log('Testing delete contact...');
    await deleteContact(db, contact.id, organization.id);
    
    // Verify contact was deleted
    try {
      await getContactById(db, contact.id, organization.id);
      throw new Error('Delete contact failed: Contact still exists');
    } catch (error) {
      if (error.message !== 'Contact not found') {
        throw error;
      }
      console.log('Contact deleted successfully');
    }
    
    console.log('CRM tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('CRM tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
