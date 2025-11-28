const END_POINT = '/api/quizzes';

export const getAllQuizzes = async (jwtToken) => {
  const res = await fetch(END_POINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${jwtToken}`,
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quiz),
  });

  if (res.status !== 201) {
    return { error: true, message: 'A problem occured while adding quiz.' };
  }

  const data = await res.json();
  return data;
};


export const removeQuiz = async (quizId, token) => {
  const res = await fetch(`${END_POINT}/${quizId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`,
    },
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
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(updatedQuiz),
  });

  if (res.status !== 200) {
    return { error: true, message: 'A problem occured while updating quiz.' };
  }

  const data = await res.json();
  return data;
};