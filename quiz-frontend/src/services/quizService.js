const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

/**
 * Creates a new quiz via Spring Boot API.
 * The backend expects parameters via URL query parameters (@RequestParam).
 *
 * @param {Object} params
 * @param {string} params.category - Question category (e.g., 'Java')
 * @param {number} params.numQ - Number of random questions to include
 * @param {string} params.title - Title for the quiz
 * @returns {Promise<string>} Response text from backend ("Success")
 */
export async function createQuiz({ category, numQ, title }) {
  const query = new URLSearchParams({
    category: category.trim(),
    numQ: String(numQ),
    title: title.trim(),
  });

  const response = await fetch(`${BASE_URL}/quiz/create?${query.toString()}`, {
    method: 'POST',
    headers: {
      'Accept': 'text/plain, application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      errorText || `Failed to create quiz (${response.status}: ${response.statusText})`
    );
  }

  return response.text();
}

/**
 * Fetches the questions for a specific quiz by ID.
 * Returns questions wrapped in QuestionWrapper (id, questionTitle, option1-4).
 *
 * @param {number|string} quizId
 * @returns {Promise<Array>} List of question objects
 */
export async function getQuizQuestions(quizId) {
  const response = await fetch(`${BASE_URL}/quiz/get/${quizId}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load quiz #${quizId} (${response.status}: ${response.statusText})`);
  }

  return response.json();
}
