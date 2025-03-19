// Course management utilities

import { getRow, getRows, insertRow, updateRow, deleteRow, generateId } from './db';

/**
 * Create a new course
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @param {string} title - Course title
 * @param {string} description - Course description
 * @returns {Promise<Object>} Course object
 */
export async function createCourse(db, organizationId, title, description = null) {
  // Generate course ID
  const id = generateId();
  
  // Insert course
  await insertRow(db, 'courses', {
    id,
    organization_id: organizationId,
    title,
    description,
    is_published: false,
  });
  
  // Return course
  return {
    id,
    organization_id: organizationId,
    title,
    description,
    is_published: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get course by ID
 * @param {D1Database} db - D1 database client
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Course object
 */
export async function getCourseById(db, id, organizationId) {
  const course = await getRow(
    db,
    'SELECT * FROM courses WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  return course;
}

/**
 * Get courses for an organization
 * @param {D1Database} db - D1 database client
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of course objects
 */
export async function getOrganizationCourses(db, organizationId) {
  return getRows(
    db,
    'SELECT * FROM courses WHERE organization_id = ? ORDER BY title',
    [organizationId]
  );
}

/**
 * Update course
 * @param {D1Database} db - D1 database client
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} courseData - Course data to update
 * @returns {Promise<Object>} Updated course object
 */
export async function updateCourse(db, id, organizationId, courseData) {
  // Check if course exists
  const course = await getCourseById(db, id, organizationId);
  
  // Prepare update data
  const updateData = {
    title: courseData.title !== undefined ? courseData.title : course.title,
    description: courseData.description !== undefined ? courseData.description : course.description,
    updated_at: new Date().toISOString(),
  };
  
  // Update course
  await updateRow(db, 'courses', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated course
  return {
    ...course,
    ...updateData,
  };
}

/**
 * Delete course
 * @param {D1Database} db - D1 database client
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(db, id, organizationId) {
  // Check if course exists
  await getCourseById(db, id, organizationId);
  
  // Delete course
  await deleteRow(db, 'courses', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Publish course
 * @param {D1Database} db - D1 database client
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated course object
 */
export async function publishCourse(db, id, organizationId) {
  // Check if course exists
  const course = await getCourseById(db, id, organizationId);
  
  // Update course
  await updateRow(
    db,
    'courses',
    { is_published: true, updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated course
  return {
    ...course,
    is_published: true,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Unpublish course
 * @param {D1Database} db - D1 database client
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Updated course object
 */
export async function unpublishCourse(db, id, organizationId) {
  // Check if course exists
  const course = await getCourseById(db, id, organizationId);
  
  // Update course
  await updateRow(
    db,
    'courses',
    { is_published: false, updated_at: new Date().toISOString() },
    'id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  // Return updated course
  return {
    ...course,
    is_published: false,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create a course module
 * @param {D1Database} db - D1 database client
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {string} title - Module title
 * @param {string} description - Module description
 * @param {number} orderIndex - Module order index
 * @returns {Promise<Object>} Course module object
 */
export async function createCourseModule(db, courseId, organizationId, title, description = null, orderIndex) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Generate module ID
  const id = generateId();
  
  // Insert module
  await insertRow(db, 'course_modules', {
    id,
    course_id: courseId,
    title,
    description,
    order_index: orderIndex,
  });
  
  // Return module
  return {
    id,
    course_id: courseId,
    title,
    description,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get course modules
 * @param {D1Database} db - D1 database client
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of course module objects
 */
export async function getCourseModules(db, courseId, organizationId) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Get modules
  return getRows(
    db,
    'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index',
    [courseId]
  );
}

/**
 * Update course module
 * @param {D1Database} db - D1 database client
 * @param {string} id - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} moduleData - Module data to update
 * @returns {Promise<Object>} Updated course module object
 */
export async function updateCourseModule(db, id, courseId, organizationId, moduleData) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Check if module exists
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [id, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Prepare update data
  const updateData = {
    title: moduleData.title !== undefined ? moduleData.title : module.title,
    description: moduleData.description !== undefined ? moduleData.description : module.description,
    order_index: moduleData.order_index !== undefined ? moduleData.order_index : module.order_index,
    updated_at: new Date().toISOString(),
  };
  
  // Update module
  await updateRow(db, 'course_modules', updateData, 'id = ?', [id]);
  
  // Return updated module
  return {
    ...module,
    ...updateData,
  };
}

/**
 * Delete course module
 * @param {D1Database} db - D1 database client
 * @param {string} id - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteCourseModule(db, id, courseId, organizationId) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Check if module exists
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [id, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Delete module
  await deleteRow(db, 'course_modules', 'id = ?', [id]);
}

/**
 * Create a course lesson
 * @param {D1Database} db - D1 database client
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {string} title - Lesson title
 * @param {string} content - Lesson content
 * @param {number} orderIndex - Lesson order index
 * @returns {Promise<Object>} Course lesson object
 */
export async function createCourseLesson(db, moduleId, courseId, organizationId, title, content, orderIndex) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Generate lesson ID
  const id = generateId();
  
  // Insert lesson
  await insertRow(db, 'course_lessons', {
    id,
    module_id: moduleId,
    title,
    content,
    order_index: orderIndex,
  });
  
  // Return lesson
  return {
    id,
    module_id: moduleId,
    title,
    content,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Get module lessons
 * @param {D1Database} db - D1 database client
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of course lesson objects
 */
export async function getModuleLessons(db, moduleId, courseId, organizationId) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Get lessons
  return getRows(
    db,
    'SELECT * FROM course_lessons WHERE module_id = ? ORDER BY order_index',
    [moduleId]
  );
}

/**
 * Update course lesson
 * @param {D1Database} db - D1 database client
 * @param {string} id - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} lessonData - Lesson data to update
 * @returns {Promise<Object>} Updated course lesson object
 */
export async function updateCourseLesson(db, id, moduleId, courseId, organizationId, lessonData) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Check if lesson exists
  const lesson = await getRow(
    db,
    'SELECT * FROM course_lessons WHERE id = ? AND module_id = ?',
    [id, moduleId]
  );
  
  if (!lesson) {
    throw new Error('Course lesson not found');
  }
  
  // Prepare update data
  const updateData = {
    title: lessonData.title !== undefined ? lessonData.title : lesson.title,
    content: lessonData.content !== undefined ? lessonData.content : lesson.content,
    order_index: lessonData.order_index !== undefined ? lessonData.order_index : lesson.order_index,
    updated_at: new Date().toISOString(),
  };
  
  // Update lesson
  await updateRow(db, 'course_lessons', updateData, 'id = ?', [id]);
  
  // Return updated lesson
  return {
    ...lesson,
    ...updateData,
  };
}

/**
 * Delete course lesson
 * @param {D1Database} db - D1 database client
 * @param {string} id - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteCourseLesson(db, id, moduleId, courseId, organizationId) {
  // Check if course exists and belongs to organization
  await getCourseById(db, courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Check if lesson exists
  const lesson = await getRow(
    db,
    'SELECT * FROM course_lessons WHERE id = ? AND module_id = ?',
    [id, moduleId]
  );
  
  if (!lesson) {
    throw new Error('Course lesson not found');
  }
  
  // Delete lesson
  await deleteRow(db, 'course_lessons', 'id = ?', [id]);
}
