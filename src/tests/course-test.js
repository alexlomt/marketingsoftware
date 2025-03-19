// Test for course management functionality

import { initTestDB, createTestUser, createTestOrganization, cleanupTestData } from '../lib/test-utils';
import { createCourse, getCourseById, getOrganizationCourses, updateCourse, deleteCourse, publishCourse, unpublishCourse, createCourseModule, getCourseModules, updateCourseModule, deleteCourseModule, createCourseLesson, getModuleLessons, updateCourseLesson, deleteCourseLesson } from '../lib/courses';

/**
 * Test course management functionality
 * @param {Object} env - Environment variables
 * @returns {Promise<void>}
 */
export async function testCourses(env) {
  console.log('Testing course management functionality...');
  
  const db = await initTestDB(env);
  
  try {
    // Create test user and organization
    console.log('Creating test user and organization...');
    const user = await createTestUser(db);
    const organization = await createTestOrganization(db, user.id);
    
    // Test create course
    console.log('Testing create course...');
    const courseData = {
      title: 'Marketing Fundamentals',
      description: 'Learn the basics of digital marketing'
    };
    
    const course = await createCourse(
      db, 
      organization.id, 
      courseData.title, 
      courseData.description
    );
    console.log('Course created successfully:', course);
    
    if (!course.id || course.title !== courseData.title || course.description !== courseData.description) {
      throw new Error('Create course failed: Invalid course data');
    }
    
    // Test get course by ID
    console.log('Testing get course by ID...');
    const retrievedCourse = await getCourseById(db, course.id, organization.id);
    console.log('Course retrieved successfully:', retrievedCourse);
    
    if (retrievedCourse.id !== course.id || retrievedCourse.title !== courseData.title) {
      throw new Error('Get course by ID failed: Invalid course data');
    }
    
    // Test get organization courses
    console.log('Testing get organization courses...');
    const courses = await getOrganizationCourses(db, organization.id);
    console.log('Organization courses retrieved successfully:', courses);
    
    if (courses.length !== 1 || courses[0].id !== course.id) {
      throw new Error('Get organization courses failed: Course not found');
    }
    
    // Test update course
    console.log('Testing update course...');
    const updatedCourseData = {
      title: 'Advanced Marketing Fundamentals',
      description: 'Learn advanced digital marketing strategies'
    };
    
    const updatedCourse = await updateCourse(
      db, 
      course.id, 
      organization.id, 
      updatedCourseData
    );
    console.log('Course updated successfully:', updatedCourse);
    
    if (updatedCourse.title !== updatedCourseData.title || 
        updatedCourse.description !== updatedCourseData.description) {
      throw new Error('Update course failed: Course not updated correctly');
    }
    
    // Test create course module
    console.log('Testing create course module...');
    const moduleData = {
      title: 'Introduction to Marketing',
      description: 'Basic marketing concepts',
      orderIndex: 0
    };
    
    const module = await createCourseModule(
      db, 
      course.id, 
      organization.id, 
      moduleData.title, 
      moduleData.description, 
      moduleData.orderIndex
    );
    console.log('Course module created successfully:', module);
    
    if (!module.id || module.title !== moduleData.title || module.order_index !== moduleData.orderIndex) {
      throw new Error('Create course module failed: Invalid module data');
    }
    
    // Create additional modules for testing
    await createCourseModule(
      db, 
      course.id, 
      organization.id, 
      'Social Media Marketing', 
      'Learn about social media platforms', 
      1
    );
    
    // Test get course modules
    console.log('Testing get course modules...');
    const modules = await getCourseModules(db, course.id, organization.id);
    console.log('Course modules retrieved successfully:', modules);
    
    if (modules.length !== 2) {
      throw new Error('Get course modules failed: Incorrect number of modules');
    }
    
    // Test update course module
    console.log('Testing update course module...');
    const updatedModuleData = {
      title: 'Updated Introduction to Marketing',
      description: 'Updated basic marketing concepts'
    };
    
    const updatedModule = await updateCourseModule(
      db, 
      module.id, 
      course.id, 
      organization.id, 
      updatedModuleData
    );
    console.log('Course module updated successfully:', updatedModule);
    
    if (updatedModule.title !== updatedModuleData.title || 
        updatedModule.description !== updatedModuleData.description) {
      throw new Error('Update course module failed: Module not updated correctly');
    }
    
    // Test create course lesson
    console.log('Testing create course lesson...');
    const lessonData = {
      title: 'What is Marketing?',
      content: '<h1>What is Marketing?</h1><p>Marketing is the process of exploring, creating, and delivering value to meet the needs of a target market.</p>',
      orderIndex: 0
    };
    
    const lesson = await createCourseLesson(
      db, 
      module.id, 
      course.id, 
      organization.id, 
      lessonData.title, 
      lessonData.content, 
      lessonData.orderIndex
    );
    console.log('Course lesson created successfully:', lesson);
    
    if (!lesson.id || lesson.title !== lessonData.title || lesson.order_index !== lessonData.orderIndex) {
      throw new Error('Create course lesson failed: Invalid lesson data');
    }
    
    // Create additional lessons for testing
    await createCourseLesson(
      db, 
      module.id, 
      course.id, 
      organization.id, 
      'Marketing Strategies', 
      '<h1>Marketing Strategies</h1><p>Learn about different marketing strategies.</p>', 
      1
    );
    
    // Test get module lessons
    console.log('Testing get module lessons...');
    const lessons = await getModuleLessons(db, module.id, course.id, organization.id);
    console.log('Module lessons retrieved successfully:', lessons);
    
    if (lessons.length !== 2) {
      throw new Error('Get module lessons failed: Incorrect number of lessons');
    }
    
    // Test update course lesson
    console.log('Testing update course lesson...');
    const updatedLessonData = {
      title: 'Updated: What is Marketing?',
      content: '<h1>What is Marketing?</h1><p>Marketing is the process of exploring, creating, and delivering value to meet the needs of a target market in the digital age.</p>'
    };
    
    const updatedLesson = await updateCourseLesson(
      db, 
      lesson.id, 
      module.id, 
      course.id, 
      organization.id, 
      updatedLessonData
    );
    console.log('Course lesson updated successfully:', updatedLesson);
    
    if (updatedLesson.title !== updatedLessonData.title || 
        updatedLesson.content !== updatedLessonData.content) {
      throw new Error('Update course lesson failed: Lesson not updated correctly');
    }
    
    // Test publish course
    console.log('Testing publish course...');
    const publishedCourse = await publishCourse(db, course.id, organization.id);
    console.log('Course published successfully:', publishedCourse);
    
    if (!publishedCourse.is_published) {
      throw new Error('Publish course failed: Course not published');
    }
    
    // Test unpublish course
    console.log('Testing unpublish course...');
    const unpublishedCourse = await unpublishCourse(db, course.id, organization.id);
    console.log('Course unpublished successfully:', unpublishedCourse);
    
    if (unpublishedCourse.is_published) {
      throw new Error('Unpublish course failed: Course still published');
    }
    
    // Test delete course lesson
    console.log('Testing delete course lesson...');
    await deleteCourseLesson(db, lesson.id, module.id, course.id, organization.id);
    
    // Verify lesson was deleted
    const lessonsAfterDeletion = await getModuleLessons(db, module.id, course.id, organization.id);
    console.log('Module lessons after deletion:', lessonsAfterDeletion);
    
    if (lessonsAfterDeletion.length !== 1) {
      throw new Error('Delete course lesson failed: Lesson not deleted');
    }
    
    // Test delete course module
    console.log('Testing delete course module...');
    await deleteCourseModule(db, module.id, course.id, organization.id);
    
    // Verify module was deleted
    const modulesAfterDeletion = await getCourseModules(db, course.id, organization.id);
    console.log('Course modules after deletion:', modulesAfterDeletion);
    
    if (modulesAfterDeletion.length !== 1) {
      throw new Error('Delete course module failed: Module not deleted');
    }
    
    // Test delete course
    console.log('Testing delete course...');
    await deleteCourse(db, course.id, organization.id);
    
    // Verify course was deleted
    try {
      await getCourseById(db, course.id, organization.id);
      throw new Error('Delete course failed: Course still exists');
    } catch (error) {
      if (error.message !== 'Course not found') {
        throw error;
      }
      console.log('Course deleted successfully');
    }
    
    console.log('Course management tests passed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Course management tests failed:', error);
    return { success: false, error: error.message };
  } finally {
    await cleanupTestData(db);
  }
}
