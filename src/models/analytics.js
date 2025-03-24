/**
 * Analytics model for data analysis and reporting
 */

import { db } from '../lib/db';

/**
 * Get contacts statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Contact statistics
 */
export async function getContactsStats(options = {}) {
  const { userId, period = 'month', startDate, endDate } = options;
  
  // Define date range
  const dateFilter = getDateFilter(period, startDate, endDate);
  
  // Base query with date filter
  let query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
      COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new
  `;
  
  const params = [dateFilter.startDate];
  
  // Add FROM clause
  query += ` FROM contacts`;
  
  // Add WHERE clause if userId is provided
  if (userId) {
    query += ` WHERE user_id = $2`;
    params.push(userId);
  }
  
  const result = await db.query(query, params);
  return result.rows[0] || { total: 0, active: 0, inactive: 0, new: 0 };
}

/**
 * Get deals statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Deal statistics
 */
export async function getDealsStats(options = {}) {
  const { userId, period = 'month', startDate, endDate } = options;
  
  // Define date range
  const dateFilter = getDateFilter(period, startDate, endDate);
  
  // Base query with date filter
  let query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'won' THEN 1 END) as won,
      COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost,
      COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
      SUM(CASE WHEN status = 'won' THEN value ELSE 0 END) as revenue,
      AVG(CASE WHEN status = 'won' THEN value ELSE NULL END) as avg_deal_size
  `;
  
  const params = [dateFilter.startDate];
  
  // Add FROM clause
  query += ` FROM deals`;
  
  // Add WHERE clause if userId is provided
  if (userId) {
    query += ` WHERE user_id = $2`;
    params.push(userId);
  }
  
  const result = await db.query(query, params);
  return result.rows[0] || { 
    total: 0, 
    won: 0, 
    lost: 0, 
    open: 0, 
    revenue: 0, 
    avg_deal_size: 0 
  };
}

/**
 * Get email campaign statistics
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Email campaign statistics
 */
export async function getEmailCampaignStats(options = {}) {
  const { userId, period = 'month', startDate, endDate } = options;
  
  // Define date range
  const dateFilter = getDateFilter(period, startDate, endDate);
  
  // Base query with date filter
  let query = `
    SELECT 
      COUNT(*) as total,
      SUM(sent) as sent,
      SUM(opened) as opened,
      SUM(clicked) as clicked,
      CASE WHEN SUM(sent) > 0 THEN ROUND((SUM(opened)::numeric / SUM(sent)) * 100, 2) ELSE 0 END as open_rate,
      CASE WHEN SUM(opened) > 0 THEN ROUND((SUM(clicked)::numeric / SUM(opened)) * 100, 2) ELSE 0 END as click_rate
  `;
  
  const params = [dateFilter.startDate];
  
  // Add FROM clause
  query += ` FROM email_campaigns`;
  
  // Add WHERE clause if userId is provided
  if (userId) {
    query += ` WHERE user_id = $2`;
    params.push(userId);
  }
  
  const result = await db.query(query, params);
  return result.rows[0] || { 
    total: 0, 
    sent: 0, 
    opened: 0, 
    clicked: 0, 
    open_rate: 0, 
    click_rate: 0 
  };
}

/**
 * Get date filter based on period
 * @param {string} period - Time period (day, week, month, year)
 * @param {string} startDate - Custom start date
 * @param {string} endDate - Custom end date
 * @returns {Object} Date filter object
 */
function getDateFilter(period, startDate, endDate) {
  const now = new Date();
  let start = new Date();
  
  if (startDate && endDate) {
    // Custom date range
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };
  }
  
  // Predefined periods
  switch (period) {
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1); // Default to month
  }
  
  return {
    startDate: start,
    endDate: now
  };
}

// Export all functions
export default {
  getContactsStats,
  getDealsStats,
  getEmailCampaignStats
};
