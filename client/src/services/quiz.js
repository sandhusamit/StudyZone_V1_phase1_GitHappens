const END_POINT = '/api/quizzes';

export const getAllQuizzes = async () => {
  const res = await fetch(END_POINT, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
// any status but 200 is error
  if (res.status !== 200) {
    return { hasError: true, message: 'A problem occured getting quizzes' };
  }

  return await res.json();
};

export const createQuiz = async (quiz) => {
  const res = await fetch(END_POINT, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(quiz),
  });

  if (res.status !== 201) {
    return { error: true, message: 'A problem occured while adding quiz.' };
  }

  const data = await res.json();
  return data;
};


export const removeQuiz = async (quizId) => {
  const res = await fetch(`${END_POINT}/${quizId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (res.status !== 200) {
    return { error: true, message: 'A problem occured while deleting quiz.' };
  }

  const data = await res.json();
  return data;
}

//update quiz
export const updateQuiz = async (quizId, updatedQuiz, token) => {
  const res = await fetch(`${END_POINT}/${quizId}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(updatedQuiz),
  });

  if (res.status !== 200) {
    return { error: true, message: 'A problem occured while updating quiz.' };
  }

  const data = await res.json();
  return data;
};