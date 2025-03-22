/**
 * Course model
 * Represents online courses in the CRM system
 */
import { getDB, getRow, getRows, insertRow, updateRow, deleteRow, generateId } from '../lib/db';

/**
 * Create a new course
 * @param {Object} data - Course data
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Created course
 */
export async function createCourse(data, organizationId) {
  const db = await getDB();
  const { title, description, is_published } = data;
  
  // Generate course ID
  const id = generateId();
  
  // Insert course
  await insertRow(db, 'courses', {
    id,
    organization_id: organizationId,
    title,
    description: description || null,
    is_published: is_published || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created course
  return getCourseById(id, organizationId);
}

/**
 * Get course by ID
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Course object with modules and lessons
 */
export async function getCourseById(id, organizationId) {
  const db = await getDB();
  
  // Get course
  const course = await getRow(
    db,
    'SELECT * FROM courses WHERE id = ? AND organization_id = ?',
    [id, organizationId]
  );
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Get modules
  course.modules = await getRows(
    db,
    'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index',
    [id]
  );
  
  // Get lessons for each module
  for (const module of course.modules) {
    module.lessons = await getRows(
      db,
      'SELECT * FROM course_lessons WHERE module_id = ? ORDER BY order_index',
      [module.id]
    );
  }
  
  return course;
}

/**
 * Get courses by organization
 * @param {string} organizationId - Organization ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of course objects
 */
export async function getCoursesByOrganization(organizationId, options = {}) {
  const db = await getDB();
  const { 
    is_published, 
    limit = 50, 
    offset = 0,
    include_modules = false,
    include_lessons = false
  } = options;
  
  // Build query
  let query = 'SELECT * FROM courses WHERE organization_id = ?';
  const params = [organizationId];
  
  // Add filters
  if (is_published !== undefined) {
    query += ' AND is_published = ?';
    params.push(is_published ? 1 : 0);
  }
  
  // Add sorting and pagination
  query += ' ORDER BY title LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  // Get courses
  const courses = await getRows(db, query, params);
  
  // Get modules and lessons if requested
  if (include_modules) {
    for (const course of courses) {
      course.modules = await getRows(
        db,
        'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index',
        [course.id]
      );
      
      if (include_lessons) {
        for (const module of course.modules) {
          module.lessons = await getRows(
            db,
            'SELECT * FROM course_lessons WHERE module_id = ? ORDER BY order_index',
            [module.id]
          );
        }
      }
    }
  }
  
  return courses;
}

/**
 * Update course
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Course data to update
 * @returns {Promise<Object>} Updated course
 */
export async function updateCourse(id, organizationId, data) {
  const db = await getDB();
  
  // Check if course exists
  const course = await getCourseById(id, organizationId);
  
  // Prepare update data
  const updateData = {
    title: data.title !== undefined ? data.title : course.title,
    description: data.description !== undefined ? data.description : course.description,
    is_published: data.is_published !== undefined ? data.is_published : course.is_published,
    updated_at: new Date().toISOString()
  };
  
  // Update course
  await updateRow(db, 'courses', updateData, 'id = ? AND organization_id = ?', [id, organizationId]);
  
  // Return updated course
  return getCourseById(id, organizationId);
}

/**
 * Delete course
 * @param {string} id - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(id, organizationId) {
  const db = await getDB();
  
  // Check if course exists
  await getCourseById(id, organizationId);
  
  // Delete lessons and modules first (cascade)
  const modules = await getRows(db, 'SELECT id FROM course_modules WHERE course_id = ?', [id]);
  
  for (const module of modules) {
    await deleteRow(db, 'course_lessons', 'module_id = ?', [module.id]);
  }
  
  await deleteRow(db, 'course_modules', 'course_id = ?', [id]);
  
  // Delete course
  await deleteRow(db, 'courses', 'id = ? AND organization_id = ?', [id, organizationId]);
}

/**
 * Create course module
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Module data
 * @returns {Promise<Object>} Created module
 */
export async function createCourseModule(courseId, organizationId, data) {
  const db = await getDB();
  
  // Check if course exists and belongs to organization
  await getCourseById(courseId, organizationId);
  
  // Get highest order index
  const maxOrderResult = await getRow(
    db,
    'SELECT MAX(order_index) as max_order FROM course_modules WHERE course_id = ?',
    [courseId]
  );
  
  const orderIndex = maxOrderResult && maxOrderResult.max_order !== null 
    ? maxOrderResult.max_order + 1 
    : 0;
  
  // Generate module ID
  const id = generateId();
  
  // Insert module
  await insertRow(db, 'course_modules', {
    id,
    course_id: courseId,
    title: data.title,
    description: data.description || null,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created module
  return getRow(db, 'SELECT * FROM course_modules WHERE id = ?', [id]);
}

/**
 * Update course module
 * @param {string} id - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Module data to update
 * @returns {Promise<Object>} Updated module
 */
export async function updateCourseModule(id, courseId, organizationId, data) {
  const db = await getDB();
  
  // Check if course exists and belongs to organization
  await getCourseById(courseId, organizationId);
  
  // Check if module exists and belongs to course
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
    title: data.title !== undefined ? data.title : module.title,
    description: data.description !== undefined ? data.description : module.description,
    updated_at: new Date().toISOString()
  };
  
  // Update module
  await updateRow(db, 'course_modules', updateData, 'id = ?', [id]);
  
  // Return updated module
  return getRow(db, 'SELECT * FROM course_modules WHERE id = ?', [id]);
}

/**
 * Delete course module
 * @param {string} id - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteCourseModule(id, courseId, organizationId) {
  const db = await getDB();
  
  // Check if course exists and belongs to organization
  await getCourseById(courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [id, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Delete lessons first (cascade)
  await deleteRow(db, 'course_lessons', 'module_id = ?', [id]);
  
  // Delete module
  await deleteRow(db, 'course_modules', 'id = ?', [id]);
  
  // Reorder remaining modules
  const remainingModules = await getRows(
    db,
    'SELECT * FROM course_modules WHERE course_id = ? ORDER BY order_index',
    [courseId]
  );
  
  for (let i = 0; i < remainingModules.length; i++) {
    await updateRow(
      db, 
      'course_modules', 
      { order_index: i }, 
      'id = ?', 
      [remainingModules[i].id]
    );
  }
}

/**
 * Create course lesson
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Lesson data
 * @returns {Promise<Object>} Created lesson
 */
export async function createCourseLesson(moduleId, courseId, organizationId, data) {
  const db = await getDB();
  
  // Check if course exists and belongs to organization
  await getCourseById(courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Get highest order index
  const maxOrderResult = await getRow(
    db,
    'SELECT MAX(order_index) as max_order FROM course_lessons WHERE module_id = ?',
    [moduleId]
  );
  
  const orderIndex = maxOrderResult && maxOrderResult.max_order !== null 
    ? maxOrderResult.max_order + 1 
    : 0;
  
  // Generate lesson ID
  const id = generateId();
  
  // Insert lesson
  await insertRow(db, 'course_lessons', {
    id,
    module_id: moduleId,
    title: data.title,
    content: data.content,
    order_index: orderIndex,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Return created lesson
  return getRow(db, 'SELECT * FROM course_lessons WHERE id = ?', [id]);
}

/**
 * Update course lesson
 * @param {string} id - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Lesson data to update
 * @returns {Promise<Object>} Updated lesson
 */
export async function updateCourseLesson(id, moduleId, courseId, organizationId, data) {
  const db = await getDB();
  
  // Check if course exists and belongs to organization
  await getCourseById(courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Check if lesson exists and belongs to module
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
    title: data.title !== undefined ? data.title : lesson.title,
    content: data.content !== undefined ? data.content : lesson.content,
    updated_at: new Date().toISOString()
  };
  
  // Update lesson
  await updateRow(db, 'course_lessons', updateData, 'id = ?', [id]);
  
  // Return updated lesson
  return getRow(db, 'SELECT * FROM course_lessons WHERE id = ?', [id]);
}

/**
 * Delete course lesson
 * @param {string} id - Lesson ID
 * @param {string} moduleId - Module ID
 * @param {string} courseId - Course ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<void>}
 */
export async function deleteCourseLesson(id, moduleId, courseId, organizationId) {
  const db = await getDB();
  
  // Check if course exists and belongs to organization
  await getCourseById(courseId, organizationId);
  
  // Check if module exists and belongs to course
  const module = await getRow(
    db,
    'SELECT * FROM course_modules WHERE id = ? AND course_id = ?',
    [moduleId, courseId]
  );
  
  if (!module) {
    throw new Error('Course module not found');
  }
  
  // Check if lesson exists and belongs to module
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
  
  // Reorder remaining lessons
  const remainingLessons = await getRows(
    db,
    'SELECT * FROM course_lessons WHERE module_id = ? ORDER BY order_index',
    [moduleId]
  );
  
  for (let i = 0; i < remainingLessons.length; i++) {
    await updateRow(
      db, 
      'course_lessons', 
      { order_index: i }, 
      'id = ?', 
      [remainingLessons[i].id]
    );
  }
}
