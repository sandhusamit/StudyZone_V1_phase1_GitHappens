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
  console.log("Creating quiz with quiz: ", quiz);
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

export const createBulkQuiz = async (quizData) => {

  const res = await fetch('/api/quizzes/bulk-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quizData),
    });

    
  if (res.status !== 201) {
    return { error: true, message: 'A problem occured while adding quiz.' };
  }
  const data = await res.json();
  return { error: false, message: 'Bulk quizzes created successfully.', data };

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
  console.log("VISIBILITY:", updatedQuiz.visibility);

  const res = await fetch(`${END_POINT}/${quizId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedQuiz),
  });

  if (res.status !== 200) {
    return { error: true, message: "A problem occured while updating quiz." };
  }

  const data = await res.json();
  return data;
};

//share quiz
export const shareQuizViaEmail = async (quizId, email) => {
  const res = await fetch(`${END_POINT}/${quizId}/share`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (res.status !== 200) {
    return { hasError: true, message: 'A problem occured while sharing quiz.' };
  }

  const data = await res.json();
  return data;
};  

//get quiz by id
// get quiz by id
export const fetchQuizById = async (quizId, accessToken = null) => {
  let url = `${END_POINT}/${quizId}`;

  if (accessToken) {
    console.log("Using access token for quiz fetch");
    url += `?access=${encodeURIComponent(accessToken)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      hasError: true,
      status: res.status,
      message: data.message || "A problem occurred getting quiz.",
    };
  }

  return data;
};

// generate unlisted share token
export const generateGuestToken = async (quizId) => {
  const res = await fetch("/api/quizzes/guesttoken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ quizId }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      hasError: true,
      message: data.message || "Failed to generate share token.",
    };
  }

  return data.token;
};

export const submitQuizScore = async (quizId, score, userId, guestId) => {
  console.log("Submitting score:", { quizId, score, userId, guestId });
  const res = await fetch("/api/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ quizId, score, userId, guestId }),
  });

  const data = await res.json();

  if (res.status !== 201) {
    console.error("Submit score failed:", data);
    return { hasError: true, message: data.message };
  }

  return data;
};

export const getPublicLeaderboard = async () => {
  const res = await fetch("/api/leaderboard/public", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      hasError: true,
      message: data.message || "A problem occurred loading leaderboard.",
    };
  }

  return data;
};