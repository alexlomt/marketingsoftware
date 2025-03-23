/**
 * Analytics model for tracking user interactions and providing insights
 */

import { db } from "@/lib/db";

/**
 * Track a user event
 * @param {string} userId - The ID of the user
 * @param {string} eventType - Type of event (e.g., 'page_view', 'click', 'form_submit')
 * @param {Object} eventData - Additional event data
 * @returns {Promise<Object>} Created event object
 */
export async function trackEvent(userId, eventType, eventData = {}) {
  const event = {
    user_id: userId,
    event_type: eventType,
    event_data: eventData,
    timestamp: new Date().toISOString(),
  };

  const result = await db.query(
    "INSERT INTO analytics_events (user_id, event_type, event_data, timestamp) VALUES ($1, $2, $3, $4) RETURNING *",
    [event.user_id, event.event_type, event.event_data, event.timestamp]
  );

  return result.rows[0];
}

/**
 * Get user activity summary
 * @param {string} userId - The ID of the user
 * @param {Object} options - Query options (e.g., timeframe)
 * @returns {Promise<Object>} Activity summary
 */
export async function getUserActivity(userId, options = {}) {
  const { startDate, endDate } = options;

  const query = {
    text: "SELECT event_type, COUNT(*) as count FROM analytics_events WHERE user_id = $1",
    values: [userId],
  };

  if (startDate && endDate) {
    query.text += " AND timestamp BETWEEN $2 AND $3";
    query.values.push(startDate, endDate);
  }

  query.text += " GROUP BY event_type";

  const result = await db.query(query.text, query.values);
  return result.rows;
}

/**
 * Get organization-wide analytics
 * @param {string} organizationId - The ID of the organization
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Organization analytics
 */
export async function getOrganizationAnalytics(organizationId, options = {}) {
  const { startDate, endDate, eventTypes = [] } = options;

  let query = `
    SELECT 
      e.event_type,
      COUNT(*) as event_count,
      COUNT(DISTINCT e.user_id) as unique_users
    FROM analytics_events e
    JOIN users u ON e.user_id = u.id
    WHERE u.organization_id = $1
  `;

  const values = [organizationId];
  let paramCount = 1;

  if (startDate && endDate) {
    query += ` AND e.timestamp BETWEEN $${++paramCount} AND $${++paramCount}`;
    values.push(startDate, endDate);
  }

  if (eventTypes.length > 0) {
    query += ` AND e.event_type = ANY($${++paramCount})`;
    values.push(eventTypes);
  }

  query += " GROUP BY e.event_type";

  const result = await db.query(query, values);
  return result.rows;
}

/**
 * Delete old analytics data
 * @param {number} daysToKeep - Number of days of data to retain
 * @returns {Promise<void>}
 */
export async function cleanupOldAnalytics(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  await db.query("DELETE FROM analytics_events WHERE timestamp < $1", [
    cutoffDate.toISOString(),
  ]);
}
