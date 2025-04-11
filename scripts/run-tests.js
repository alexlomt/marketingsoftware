// scripts/run-tests.js
const path = require('path');

// Helper to try importing either JS or JSX if needed (adjust based on actual file extensions)
async function dynamicImport(modulePath) {
  try {
    // Assume ESM (.js) is used in src/tests
    return await import(modulePath);
  } catch (error) {
    // Handle potential errors like module not found or syntax errors
    console.error(`Error importing ${modulePath}:`, error);
    throw error; // Re-throw to indicate failure
  }
}

async function main() {
  console.log('Starting test execution...');
  try {
    // Construct the absolute path to the test entry point
    // Adjust if your compiled output or source structure differs
    const testsIndexPath = path.resolve(__dirname, '../src/tests/index.js');

    // Dynamically import the test runner function
    const { runAllTests } = await dynamicImport(testsIndexPath);

    // Pass process.env as the environment context for tests
    // Tests might require specific env vars like API_URL, TEST_USER, etc.
    console.log('Running tests with current environment variables...');
    const results = await runAllTests(process.env);

    if (results.success) {
      console.log('
Test execution completed successfully.');
      process.exit(0); // Exit with success code
    } else {
      console.error('
Test execution failed.');
      process.exit(1); // Exit with failure code
    }
  } catch (error) {
    console.error('
Critical error during test execution:', error);
    process.exit(1); // Exit with failure code
  }
}

main();
