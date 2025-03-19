// Website and page builder utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new website
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} name - Website name
 * @param {string} domain - Website domain (optional)
 * @returns {Promise<Object>} Website object
 */
export async function createWebsite(db, organizationId, name, domain = null) {
  // Generate website ID
  const id = generateId();
  
  // Insert website
  await insertRow(db, 'websites', {
    id,
    organization_id: organizationId,
    name,
    domain,
  });
  
  // Return website
  return {
    id,
    organization_id: organizationId,
    name,
    domain,
  };
}

/**
 * Get website by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Website object
 */
export async function getWebsiteById(db, id, organizationId) {
  const website = await getRow(
    db,
    'SELECT * FROM websites WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!website) {
    throw new Error('Website not found');
  }
  
  return website;
}

/**
 * Get websites for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of website objects
 */
export async function getOrganizationWebsites(db, organizationId) {
  return getRows(
    db,
    'SELECT * FROM websites WHERE organization_id = ? ORDER BY name',
    [organizationId]
  );
}

/**
 * Update website
 * @param {D1Database} db - D1 database client
 * @param {string} id - Website ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Website data to update
 * @returns {Promise<Object>} Updated website object
 */
export async function updateWebsite(db, id, organizationId, data) {
  // Check if website exists
  const website = await getWebsiteById(db, id, organizationId);
  
  // Prepare update data
  const updateData = {
    name: data.name !== undefined ? data.name : website.name,
    domain: data.domain !== undefined ? data.domain : website.domain,
    updated_at: new Date().toISOString(),
  };
  
  // Update website
  await updateRow(db, 'websites', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated website
  return {
    ...website,
    ...updateData,
  };
}

/**
 * Delete website
 * @param {D1Database} db - D1 database client
 * @param {string} id - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteWebsite(db, id, organizationId) {
  // Check if website exists
  await getWebsiteById(db, id, organizationId);
  
  // Delete website
  await deleteRow(db, 'websites', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Create a new page
 * @param {D1Database} db - D1 database client
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @param {Object} pageData - Page data
 * @returns {Promise<Object>} Page object
 */
export async function createPage(db, websiteId, organizationId, pageData) {
  const { title, slug, content } = pageData;
  
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Check if slug is already used
  const existingPage = await getRow(
    db,
    'SELECT * FROM pages WHERE website_id = ? AND slug = ?',
    [websiteId, slug]
  );
  
  if (existingPage) {
    throw new Error('Page slug already exists');
  }
  
  // Generate page ID
  const id = generateId();
  
  // Insert page
  await insertRow(db, 'pages', {
    id,
    website_id: websiteId,
    title,
    slug,
    content: JSON.stringify(content),
    is_published: false,
  });
  
  // Return page
  return {
    id,
    website_id: websiteId,
    title,
    slug,
    content,
    is_published: false,
  };
}

/**
 * Get page by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Page ID
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Page object
 */
export async function getPageById(db, id, websiteId, organizationId) {
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Get page
  const page = await getRow(
    db,
    'SELECT * FROM pages WHERE id = ? AND website_id = ?',
    [id, websiteId]
  );
  
  if (!page) {
    throw new Error('Page not found');
  }
  
  // Parse content
  return {
    ...page,
    content: JSON.parse(page.content),
  };
}

/**
 * Get pages for a website
 * @param {D1Database} db - D1 database client
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of page objects
 */
export async function getWebsitePages(db, websiteId, organizationId) {
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Get pages
  const pages = await getRows(
    db,
    'SELECT * FROM pages WHERE website_id = ? ORDER BY title',
    [websiteId]
  );
  
  // Parse content
  return pages.map(page => ({
    ...page,
    content: JSON.parse(page.content),
  }));
}

/**
 * Update page
 * @param {D1Database} db - D1 database client
 * @param {string} id - Page ID
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @param {Object} pageData - Page data to update
 * @returns {Promise<Object>} Updated page object
 */
export async function updatePage(db, id, websiteId, organizationId, pageData) {
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Get page
  const page = await getPageById(db, id, websiteId, organizationId);
  
  // If changing slug, check if new slug is already used
  if (pageData.slug && pageData.slug !== page.slug) {
    const existingPage = await getRow(
      db,
      'SELECT * FROM pages WHERE website_id = ? AND slug = ? AND id != ?',
      [websiteId, pageData.slug, id]
    );
    
    if (existingPage) {
      throw new Error('Page slug already exists');
    }
  }
  
  // Prepare update data
  const updateData = {
    title: pageData.title !== undefined ? pageData.title : page.title,
    slug: pageData.slug !== undefined ? pageData.slug : page.slug,
    content: pageData.content !== undefined ? JSON.stringify(pageData.content) : page.content,
    is_published: pageData.is_published !== undefined ? pageData.is_published : page.is_published,
    updated_at: new Date().toISOString(),
  };
  
  // Update page
  await updateRow(db, 'pages', updateData, 'id = ? AND website_id = ?', [id, websiteId]);
  
  // Return updated page
  return {
    ...page,
    title: updateData.title,
    slug: updateData.slug,
    content: pageData.content !== undefined ? pageData.content : page.content,
    is_published: updateData.is_published,
  };
}

/**
 * Delete page
 * @param {D1Database} db - D1 database client
 * @param {string} id - Page ID
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deletePage(db, id, websiteId, organizationId) {
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Check if page exists
  const page = await getRow(
    db,
    'SELECT * FROM pages WHERE id = ? AND website_id = ?',
    [id, websiteId]
  );
  
  if (!page) {
    throw new Error('Page not found');
  }
  
  // Delete page
  await deleteRow(db, 'pages', 'id = ?', [id]);
}

/**
 * Publish page
 * @param {D1Database} db - D1 database client
 * @param {string} id - Page ID
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated page object
 */
export async function publishPage(db, id, websiteId, organizationId) {
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Get page
  const page = await getPageById(db, id, websiteId, organizationId);
  
  // Update page
  await updateRow(
    db,
    'pages',
    { is_published: true, updated_at: new Date().toISOString() },
    'id = ? AND website_id = ?',
    [id, websiteId]
  );
  
  // Return updated page
  return {
    ...page,
    is_published: true,
  };
}

/**
 * Unpublish page
 * @param {D1Database} db - D1 database client
 * @param {string} id - Page ID
 * @param {string} websiteId - Website ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated page object
 */
export async function unpublishPage(db, id, websiteId, organizationId) {
  // Check if website exists and belongs to organization
  await getWebsiteById(db, websiteId, organizationId);
  
  // Get page
  const page = await getPageById(db, id, websiteId, organizationId);
  
  // Update page
  await updateRow(
    db,
    'pages',
    { is_published: false, updated_at: new Date().toISOString() },
    'id = ? AND website_id = ?',
    [id, websiteId]
  );
  
  // Return updated page
  return {
    ...page,
    is_published: false,
  };
}
