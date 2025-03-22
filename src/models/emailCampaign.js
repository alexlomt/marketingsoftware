/**
 * Email Campaign model
 * Represents email marketing campaigns in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new email campaign
 * @param {Object} data - Campaign data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created campaign
 */
export async function createEmailCampaign(data, organizationId) {
  const db = await getDB();
  const { 
    name, 
    subject, 
    content, 
    sender_name, 
    sender_email,
    reply_to,
    template_id
  } = data;
  
  // Generate campaign ID
  const id = generateId();
  
  // Insert campaign
  await insertRow(db, 'email_campaigns', {
    id,
    organization_id: organizationId,
    name,
    subject,
    content,
    sender_name: sender_name || null,
    sender_email: sender_email || null,
    reply_to: reply_to || null,
    template_id: template_id || null,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created campaign
  return getEmailCampaignById(id, organizationId);
}

/**
 * Get email campaign by ID
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Campaign object
 */
export async function getEmailCampaignById(id, organizationId) {
  const db = await getDB();
  
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
 * Get email campaigns by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of campaign objects
 */
export async function getEmailCampaignsByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { 
    status, 
    limit = 50, 
    offset = 0,
    sort_by = 'created_at',
    sort_dir = 'desc'
  } = options;
  
  let query = 'SELECT * FROM email_campaigns WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add filters
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  // Add sorting
  query += ` ORDER BY ${sort_by} ${sort_dir === 'asc' ? 'ASC' : 'DESC'}`;
  
  // Add pagination
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return getRows(db, query, params);
}

/**
 * Update email campaign
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Campaign data to update
 * @returns {Promise<Object>} Updated campaign
 */
export async function updateEmailCampaign(id, organizationId, data) {
  const db = await getDB();
  
  // Check if campaign exists
  const campaign = await getEmailCampaignById(id, organizationId);
  
  // Cannot update sent campaigns
  if (campaign.status === 'sent') {
    throw new Error('Cannot update a sent campaign');
  }
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : campaign.name,
    subject: data.subject !== undefined ? data.subject : campaign.subject,
    content: data.content !== undefined ? data.content : campaign.content,
    sender_name: data.sender_name !== undefined ? data.sender_name : campaign.sender_name,
    sender_email: data.sender_email !== undefined ? data.sender_email : campaign.sender_email,
    reply_to: data.reply_to !== undefined ? data.reply_to : campaign.reply_to,
    template_id: data.template_id !== undefined ? data.template_id : campaign.template_id,
    updated_at: new Date().toISOString()
  };
  
  // Update campaign
  await updateRow(db, 'email_campaigns', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated campaign
  return getEmailCampaignById(id, organizationId);
}

/**
 * Delete email campaign
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteEmailCampaign(id, organizationId) {
  const db = await getDB();
  
  // Check if campaign exists
  const campaign = await getEmailCampaignById(id, organizationId);
  
  // Cannot delete sent campaigns
  if (campaign.status === 'sent') {
    throw new Error('Cannot delete a sent campaign');
  }
  
  // Delete campaign
  await deleteRow(db, 'email_campaigns', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Schedule email campaign
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {string} scheduledAt - Scheduled date/time
 * @returns {Promise<Object>} Updated campaign
 */
export async function scheduleEmailCampaign(id, organizationId, scheduledAt) {
  const db = await getDB();
  
  // Check if campaign exists
  const campaign = await getEmailCampaignById(id, organizationId);
  
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
      updated_at: new Date().toISOString()
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated campaign
  return getEmailCampaignById(id, organizationId);
}

/**
 * Cancel scheduled email campaign
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated campaign
 */
export async function cancelScheduledEmailCampaign(id, organizationId) {
  const db = await getDB();
  
  // Check if campaign exists
  const campaign = await getEmailCampaignById(id, organizationId);
  
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
      updated_at: new Date().toISOString()
    },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated campaign
  return getEmailCampaignById(id, organizationId);
}

/**
 * Send email campaign
 * @param {string} id - Campaign ID
 * @param {string} organizationId - Organization ID
 * @param {Array} recipientIds - Contact IDs to send to
 * @returns {Promise<Object>} Updated campaign
 */
export async function sendEmailCampaign(id, organizationId, recipientIds) {
  const db = await getDB();
  
  // Check if campaign exists
  const campaign = await getEmailCampaignById(id, organizationId);
  
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
      updated_at: new Date().toISOString()
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Return updated campaign
  return getEmailCampaignById(id, organizationId);
}

/**
 * Get campaign recipients
 * @param {string} campaignId - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of recipient objects
 */
export async function getCampaignRecipients(campaignId, organizationId) {
  const db = await getDB();
  
  // Check if campaign exists and belongs to organization
  await getEmailCampaignById(campaignId, organizationId);
  
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
 * @param {string} campaignId - Campaign ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Campaign statistics
 */
export async function getCampaignStatistics(campaignId, organizationId) {
  const db = await getDB();
  
  // Check if campaign exists and belongs to organization
  await getEmailCampaignById(campaignId, organizationId);
  
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
    bounced: 0
  };
  
  statusCounts.forEach(({ status, count }) => {
    stats[status] = count;
    stats.total += count;
  });
  
  return stats;
}

/**
 * Update recipient status
 * @param {string} campaignId - Campaign ID
 * @param {string} contactId - Contact ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated recipient
 */
export async function updateRecipientStatus(campaignId, contactId, status) {
  const db = await getDB();
  
  // Check if recipient exists
  const recipient = await getRow(
    db,
    'SELECT * FROM campaign_recipients WHERE campaign_id = ? AND contact_id = ?',
    [campaignId, contactId]
  );
  
  if (!recipient) {
    throw new Error('Recipient not found');
  }
  
  // Prepare update data
  const updateData = {
    status,
    updated_at: new Date().toISOString()
  };
  
  // Add timestamp based on status
  if (status === 'opened' && !recipient.opened_at) {
    updateData.opened_at = new Date().toISOString();
  } else if (status === 'clicked' && !recipient.clicked_at) {
    updateData.clicked_at = new Date().toISOString();
  }
  
  // Update recipient
  await updateRow(
    db,
    'campaign_recipients',
    updateData,
    'campaign_id = ? AND contact_id = ?',
    [campaignId, contactId]
  );
  
  // Return updated recipient
  return getRow(
    db,
    'SELECT * FROM campaign_recipients WHERE campaign_id = ? AND contact_id = ?',
    [campaignId, contactId]
  );
}
