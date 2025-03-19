// Test for email campaign functionality

import { initTestDB, createTestUser, createTestOrganization, createTestContact, cleanupTestData } from '../lib/test-utils';
import { createEmailCampaign, getEmailCampaignById, getOrganizationEmailCampaigns, updateEmailCampaign, addCampaignRecipients, getCampaignRecipients, scheduleCampaign, cancelCampaign, markCampaignAsSent } from '../lib/email-campaigns';

/**
 * Test email campaign functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testEmailCampaigns(env) {
  console.log('Testing email campaign functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user, organization, and contacts
    console.log('Creating test user, organization, and contacts...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    const contact1 = await createTestContact(db, organization.id, { email: 'contact1@example.com' });
    const contact2 = await createTestContact(db, organization.id, { email: 'contact2@example.com' });
    
    // Test create email campaign
    console.log('Testing create email campaign...');
    const campaignData = {
      name: 'Welcome Campaign',
      subject: 'Welcome to Our Service',
      content: '<h1>Welcome!</h1><p>Thank you for joining our service.</p>'
    };
    
    const campaign = await createEmailCampaign(
      db, 
      organization.id, 
      campaignData.name, 
      campaignData.subject, 
      campaignData.content
    );
    console.log('Email campaign created successfully:', campaign);
    
    if (!campaign.id || campaign.name !== campaignData.name || campaign.subject !== campaignData.subject) {
      throw new Error('Create email campaign failed: Invalid campaign data');
    }
    
    // Test get email campaign by ID
    console.log('Testing get email campaign by ID...');
    const retrievedCampaign = await getEmailCampaignById(db, campaign.id, organization.id);
    console.log('Email campaign retrieved successfully:', retrievedCampaign);
    
    if (retrievedCampaign.id !== campaign.id || retrievedCampaign.name !== campaignData.name) {
      throw new Error('Get email campaign by ID failed: Invalid campaign data');
    }
    
    // Test get organization email campaigns
    console.log('Testing get organization email campaigns...');
    const campaigns = await getOrganizationEmailCampaigns(db, organization.id);
    console.log('Organization email campaigns retrieved successfully:', campaigns);
    
    if (campaigns.length !== 1 || campaigns[0].id !== campaign.id) {
      throw new Error('Get organization email campaigns failed: Campaign not found');
    }
    
    // Test update email campaign
    console.log('Testing update email campaign...');
    const updatedCampaignData = {
      name: 'Updated Welcome Campaign',
      subject: 'Updated: Welcome to Our Service',
      content: '<h1>Welcome!</h1><p>Thank you for joining our premium service.</p>'
    };
    
    const updatedCampaign = await updateEmailCampaign(
      db, 
      campaign.id, 
      organization.id, 
      updatedCampaignData
    );
    console.log('Email campaign updated successfully:', updatedCampaign);
    
    if (updatedCampaign.name !== updatedCampaignData.name || 
        updatedCampaign.subject !== updatedCampaignData.subject || 
        updatedCampaign.content !== updatedCampaignData.content) {
      throw new Error('Update email campaign failed: Campaign not updated correctly');
    }
    
    // Test add campaign recipients
    console.log('Testing add campaign recipients...');
    const contactIds = [contact1.id, contact2.id];
    await addCampaignRecipients(db, campaign.id, organization.id, contactIds);
    
    // Test get campaign recipients
    console.log('Testing get campaign recipients...');
    const recipients = await getCampaignRecipients(db, campaign.id, organization.id);
    console.log('Campaign recipients retrieved successfully:', recipients);
    
    if (recipients.length !== 2) {
      throw new Error('Get campaign recipients failed: Incorrect number of recipients');
    }
    
    // Test schedule campaign
    console.log('Testing schedule campaign...');
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1); // Schedule for tomorrow
    
    const scheduledCampaign = await scheduleCampaign(
      db, 
      campaign.id, 
      organization.id, 
      scheduledDate.toISOString()
    );
    console.log('Email campaign scheduled successfully:', scheduledCampaign);
    
    if (scheduledCampaign.status !== 'scheduled' || !scheduledCampaign.scheduled_at) {
      throw new Error('Schedule campaign failed: Campaign not scheduled correctly');
    }
    
    // Test cancel campaign
    console.log('Testing cancel campaign...');
    const cancelledCampaign = await cancelCampaign(db, campaign.id, organization.id);
    console.log('Email campaign cancelled successfully:', cancelledCampaign);
    
    if (cancelledCampaign.status !== 'cancelled') {
      throw new Error('Cancel campaign failed: Campaign not cancelled correctly');
    }
    
    // Test mark campaign as sent
    console.log('Testing mark campaign as sent...');
    const sentCampaign = await markCampaignAsSent(db, campaign.id, organization.id);
    console.log('Email campaign marked as sent successfully:', sentCampaign);
    
    if (sentCampaign.status !== 'sent' || !sentCampaign.sent_at) {
      throw new Error('Mark campaign as sent failed: Campaign not marked correctly');
    }
    
    console.log('Email campaign tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Email campaign tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
