// Email campaign utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new email campaign
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} campaignData - Campaign data
 * @returns {Promise<Object>} Email campaign object
 */
export async function createEmailCampaign(db, organizationId, campaignData) {
  const { name, subject, content } = campaignData;
  
  // Generate campaign ID
  const id = generateId();
  
  // Insert campaign
  await insertRow(db, 'email_campaigns', {
    id,
    organization_id: organizationId,
    name,
    subject,
    content,
    status: 'draft',
  });
  
  // Return campaign
  return {
    id,
    organization_id: organizationId,
    name,
    subject,
    content,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get email campaign by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Email campaign object
 */
export async function getEmailCampaignById(db, id, organizationId) {
  const campaign = await getRow(
    db,
    'SELECT * FROM email_campaigns WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!campaign) {
    throw new Error('Email campaign not found');
  }
  
  return campaign;
}

/**
 * Get email campaigns for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of email campaign objects
 */
export async function getOrganizationEmailCampaigns(db, organizationId, options = {}) {
  const { status, limit = 50, offset = 0 } = options;
  
  let query = 'SELECT * FROM email_campaigns WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add status filter if provided
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  // Add pagination
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return getRows(db, query, params);
}

/**
 * Update email campaign
 * @param {D1Database} db - D1 database client
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {Object} campaignData - Campaign data to update
 * @returns {Promise<Object>} Updated email campaign object
 */
export async function updateEmailCampaign(db, id, organizationId, campaignData) {
  // Check if campaign exists
  const campaign = await getEmailCampaignById(db, id, organizationId);
  
  // Cannot update sent campaigns
  if (campaign.status === 'sent') {
    throw new Error('Cannot update a sent campaign');
  }
  
  // Prepare update data
  const updateData = {
    name: campaignData.name !== undefined ? campaignData.name : campaign.name,
    subject: campaignData.subject !== undefined ? campaignData.subject : campaign.subject,
    content: campaignData.content !== undefined ? campaignData.content : campaign.content,
    updated_at: new Date().toISOString(),
  };
  
  // Update campaign
  await updateRow(db, 'email_campaigns', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated campaign
  return {
    ...campaign,
    ...updateData,
  };
}

/**
 * Delete email campaign
 * @param {D1Database} db - D1 database client
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteEmailCampaign(db, id, organizationId) {
  // Check if campaign exists
  const campaign = await getEmailCampaignById(db, id, organizationId);
  
  // Cannot delete sent campaigns
  if (campaign.status === 'sent') {
    throw new Error('Cannot delete a sent campaign');
  }
  
  // Delete campaign
  await deleteRow(db, 'email_campaigns', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Schedule email campaign
 * @param {D1Database} db - D1 database client
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {string} scheduledAt - Scheduled date/time
 * @returns {Promise<Object>} Updated email campaign object
 */
export async function scheduleEmailCampaign(db, id, organizationId, scheduledAt) {
  // Check if campaign exists
  const campaign = await getEmailCampaignById(db, id, organizationId);
  
  // Cannot schedule sent campaigns
  if (campaign.status === 'sent') {
    throw new Error('Cannot schedule a sent campaign');
  }
  
  // Update campaign
  await updateRow(
    db,
    'email_campaigns',
    {
      status: 'scheduled',
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString(),
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated campaign
  return {
    ...campaign,
    status: 'scheduled',
    scheduled_at: scheduledAt,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Cancel scheduled email campaign
 * @param {D1Database} db - D1 database client
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated email campaign object
 */
export async function cancelScheduledEmailCampaign(db, id, organizationId) {
  // Check if campaign exists
  const campaign = await getEmailCampaignById(db, id, organizationId);
  
  // Can only cancel scheduled campaigns
  if (campaign.status !== 'scheduled') {
    throw new Error('Can only cancel scheduled campaigns');
  }
  
  // Update campaign
  await updateRow(
    db,
    'email_campaigns',
    {
      status: 'draft',
      scheduled_at: null,
      updated_at: new Date().toISOString(),
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated campaign
  return {
    ...campaign,
    status: 'draft',
    scheduled_at: null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Send email campaign
 * @param {D1Database} db - D1 database client
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {Array} recipientIds - Contact IDs to send to
 * @returns {Promise<Object>} Updated email campaign object
 */
export async function sendEmailCampaign(db, id, organizationId, recipientIds) {
  // Check if campaign exists
  const campaign = await getEmailCampaignById(db, id, organizationId);
  
  // Cannot send already sent campaigns
  if (campaign.status === 'sent') {
    throw new Error('Campaign has already been sent');
  }
  
  // Update campaign
  await updateRow(
    db,
    'email_campaigns',
    {
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Add recipients
  for (const contactId of recipientIds) {
    await insertRow(db, 'campaign_recipients', {
      id: generateId(),
      campaign_id: id,
      contact_id: contactId,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  }
  
  // Return updated campaign
  return {
    ...campaign,
    status: 'sent',
    sent_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get campaign recipients
 * @param {D1Database} db - D1 database client
 * @param {string} campaignId - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of recipient objects
 */
export async function getCampaignRecipients(db, campaignId, organizationId) {
  // Check if campaign exists and belongs to organization
  await getEmailCampaignById(db, campaignId, organizationId);
  
  // Get recipients with contact info
  const query = `
    SELECT cr.*, c.first_name, c.last_name, c.email
    FROM campaign_recipients cr
    JOIN contacts c ON cr.contact_id = c.id
    WHERE cr.campaign_id = ?
    ORDER BY cr.created_at DESC
  `;
  
  return getRows(db, query, [campaignId]);
}

/**
 * Get campaign statistics
 * @param {D1Database} db - D1 database client
 * @param {string} campaignId - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Campaign statistics
 */
export async function getCampaignStatistics(db, campaignId, organizationId) {
  // Check if campaign exists and belongs to organization
  await getEmailCampaignById(db, campaignId, organizationId);
  
  // Get recipient counts by status
  const query = `
    SELECT status, COUNT(*) as count
    FROM campaign_recipients
    WHERE campaign_id = ?
    GROUP BY status
  `;
  
  const statusCounts = await getRows(db, query, [campaignId]);
  
  // Convert to statistics object
  const stats = {
    total: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
  };
  
  statusCounts.forEach(({ status, count }) => {
    stats[status] = count;
    stats.total += count;
  });
  
  return stats;
}
