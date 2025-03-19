-- Migration number: 0001        2025-03-19
-- GoHighLevel Clone Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS course_lessons;
DROP TABLE IF EXISTS course_modules;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS workflow_steps;
DROP TABLE IF EXISTS workflows;
DROP TABLE IF EXISTS campaign_recipients;
DROP TABLE IF EXISTS email_campaigns;
DROP TABLE IF EXISTS form_submissions;
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS websites;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS pipeline_stages;
DROP TABLE IF EXISTS pipelines;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS smart_lists;
DROP TABLE IF EXISTS contact_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table (for multi-tenant support)
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organization members
CREATE TABLE organization_members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL, -- 'owner', 'admin', 'member'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, user_id)
);

-- Contacts table (CRM)
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact tags
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, name)
);

-- Contact-tag relationship
CREATE TABLE contact_tags (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contact_id, tag_id)
);

-- Smart lists (saved contact filters)
CREATE TABLE smart_lists (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  filter_criteria TEXT NOT NULL, -- JSON string of filter criteria
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  contact_id TEXT REFERENCES contacts(id),
  assigned_to TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  status TEXT NOT NULL, -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  contact_id TEXT REFERENCES contacts(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipelines
CREATE TABLE pipelines (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline stages
CREATE TABLE pipeline_stages (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES pipelines(id),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline deals
CREATE TABLE deals (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  pipeline_id TEXT NOT NULL REFERENCES pipelines(id),
  stage_id TEXT NOT NULL REFERENCES pipeline_stages(id),
  contact_id TEXT REFERENCES contacts(id),
  title TEXT NOT NULL,
  value REAL,
  currency TEXT DEFAULT 'USD',
  expected_close_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Websites
CREATE TABLE websites (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  domain TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pages (for websites and funnels)
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  website_id TEXT NOT NULL REFERENCES websites(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL, -- JSON string of page content
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(website_id, slug)
);

-- Forms
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  fields TEXT NOT NULL, -- JSON string of form fields
  settings TEXT, -- JSON string of form settings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form submissions
CREATE TABLE form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id),
  data TEXT NOT NULL, -- JSON string of submission data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL, -- 'draft', 'scheduled', 'sent', 'cancelled'
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign recipients
CREATE TABLE campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES email_campaigns(id),
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  status TEXT NOT NULL, -- 'pending', 'sent', 'opened', 'clicked', 'bounced'
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflows (automation)
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'form_submission', 'tag_added', 'manual', etc.
  trigger_config TEXT, -- JSON string of trigger configuration
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps
CREATE TABLE workflow_steps (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflows(id),
  step_type TEXT NOT NULL, -- 'send_email', 'add_tag', 'wait', etc.
  step_config TEXT NOT NULL, -- JSON string of step configuration
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  contact_id TEXT REFERENCES contacts(id),
  user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT NOT NULL, -- 'scheduled', 'confirmed', 'cancelled', 'completed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course modules
CREATE TABLE course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course lessons
CREATE TABLE course_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES course_modules(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_tags_organization_id ON tags(organization_id);
CREATE INDEX idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag_id ON contact_tags(tag_id);
CREATE INDEX idx_smart_lists_organization_id ON smart_lists(organization_id);
CREATE INDEX idx_tasks_organization_id ON tasks(organization_id);
CREATE INDEX idx_tasks_contact_id ON tasks(contact_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_notes_organization_id ON notes(organization_id);
CREATE INDEX idx_notes_contact_id ON notes(contact_id);
CREATE INDEX idx_pipelines_organization_id ON pipelines(organization_id);
CREATE INDEX idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_pipeline_id ON deals(pipeline_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_websites_organization_id ON websites(organization_id);
CREATE INDEX idx_pages_website_id ON pages(website_id);
CREATE INDEX idx_forms_organization_id ON forms(organization_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_email_campaigns_organization_id ON email_campaigns(organization_id);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_contact_id ON campaign_recipients(contact_id);
CREATE INDEX idx_workflows_organization_id ON workflows(organization_id);
CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX idx_appointments_contact_id ON appointments(contact_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_courses_organization_id ON courses(organization_id);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
