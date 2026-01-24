const END_POINT = '/api/quizzes';
//all quizzes
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

//my quizzes
export const getQuizzesByAuthorID = async (authorId) => {
  const res = await fetch(`/api/quizzes/author/${authorId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    return { hasError: true, message: data.message };
  }

  return data;
};
//public quizzes
export const getPublicQuizzes = async () => {
  const res = await fetch('/api/public/quizzes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    return { hasError: true, message: 'A problem occured getting public quizzes' };
  }

  const data = await res.json();
  return data;
}



export const createQuiz = async (quiz) => {
  const res = await fetch('/api/quizzes', {
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


export const removeQuiz = async (quizId) => {
  const res = await fetch(`${END_POINT}/${quizId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (res.status == 404) {
    return { error: true, message: 'Quiz not found.' };
  }
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

//share quiz
export const shareQuiz = async (quizId, email) => {
  const res = await fetch(`${END_POINT}/share/${quizId}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (res.status !== 200) {
    return { error: true, message: 'A problem occured while sharing quiz.' };
  }

  const data = await res.json();
  return data;
};  