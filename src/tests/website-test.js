// Test for website and page builder functionality

import { initTestDB, createTestUser, createTestOrganization, cleanupTestData } from '../lib/test-utils';
import { createWebsite, getWebsiteById, getOrganizationWebsites, updateWebsite, createPage, getPageById, getWebsitePages, updatePage, publishPage, unpublishPage } from '../lib/websites';

/**
 * Test website and page builder functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testWebsites(env) {
  console.log('Testing website and page builder functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user and organization
    console.log('Creating test user and organization...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    
    // Test create website
    console.log('Testing create website...');
    const websiteData = {
      name: 'Company Website',
      domain: 'example.com'
    };
    
    const website = await createWebsite(db, organization.id, websiteData.name, websiteData.domain);
    console.log('Website created successfully:', website);
    
    if (!website.id || website.name !== websiteData.name || website.domain !== websiteData.domain) {
      throw new Error('Create website failed: Invalid website data');
    }
    
    // Test get website by ID
    console.log('Testing get website by ID...');
    const retrievedWebsite = await getWebsiteById(db, website.id, organization.id);
    console.log('Website retrieved successfully:', retrievedWebsite);
    
    if (retrievedWebsite.id !== website.id || retrievedWebsite.name !== websiteData.name) {
      throw new Error('Get website by ID failed: Invalid website data');
    }
    
    // Test get organization websites
    console.log('Testing get organization websites...');
    const websites = await getOrganizationWebsites(db, organization.id);
    console.log('Organization websites retrieved successfully:', websites);
    
    if (websites.length !== 1 || websites[0].id !== website.id) {
      throw new Error('Get organization websites failed: Website not found');
    }
    
    // Test update website
    console.log('Testing update website...');
    const updatedWebsiteData = {
      name: 'Updated Company Website',
      domain: 'new-example.com'
    };
    
    const updatedWebsite = await updateWebsite(db, website.id, organization.id, updatedWebsiteData);
    console.log('Website updated successfully:', updatedWebsite);
    
    if (updatedWebsite.name !== updatedWebsiteData.name || updatedWebsite.domain !== updatedWebsiteData.domain) {
      throw new Error('Update website failed: Website not updated correctly');
    }
    
    // Test create page
    console.log('Testing create page...');
    const pageData = {
      title: 'Home Page',
      slug: 'home',
      content: JSON.stringify({
        sections: [
          {
            type: 'hero',
            heading: 'Welcome to Our Website',
            subheading: 'Learn more about our services',
            buttonText: 'Get Started',
            buttonUrl: '/contact'
          }
        ]
      })
    };
    
    const page = await createPage(db, website.id, organization.id, pageData.title, pageData.slug, pageData.content);
    console.log('Page created successfully:', page);
    
    if (!page.id || page.title !== pageData.title || page.slug !== pageData.slug) {
      throw new Error('Create page failed: Invalid page data');
    }
    
    // Test get page by ID
    console.log('Testing get page by ID...');
    const retrievedPage = await getPageById(db, page.id, website.id, organization.id);
    console.log('Page retrieved successfully:', retrievedPage);
    
    if (retrievedPage.id !== page.id || retrievedPage.title !== pageData.title) {
      throw new Error('Get page by ID failed: Invalid page data');
    }
    
    // Test get website pages
    console.log('Testing get website pages...');
    const pages = await getWebsitePages(db, website.id, organization.id);
    console.log('Website pages retrieved successfully:', pages);
    
    if (pages.length !== 1 || pages[0].id !== page.id) {
      throw new Error('Get website pages failed: Page not found');
    }
    
    // Test update page
    console.log('Testing update page...');
    const updatedPageData = {
      title: 'Updated Home Page',
      content: JSON.stringify({
        sections: [
          {
            type: 'hero',
            heading: 'Welcome to Our Updated Website',
            subheading: 'Learn more about our premium services',
            buttonText: 'Contact Us',
            buttonUrl: '/contact'
          }
        ]
      })
    };
    
    const updatedPage = await updatePage(db, page.id, website.id, organization.id, updatedPageData);
    console.log('Page updated successfully:', updatedPage);
    
    if (updatedPage.title !== updatedPageData.title) {
      throw new Error('Update page failed: Page not updated correctly');
    }
    
    // Test publish page
    console.log('Testing publish page...');
    const publishedPage = await publishPage(db, page.id, website.id, organization.id);
    console.log('Page published successfully:', publishedPage);
    
    if (!publishedPage.is_published) {
      throw new Error('Publish page failed: Page not published');
    }
    
    // Test unpublish page
    console.log('Testing unpublish page...');
    const unpublishedPage = await unpublishPage(db, page.id, website.id, organization.id);
    console.log('Page unpublished successfully:', unpublishedPage);
    
    if (unpublishedPage.is_published) {
      throw new Error('Unpublish page failed: Page still published');
    }
    
    console.log('Website and page builder tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Website and page builder tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
