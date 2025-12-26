const END_POINT = '/api/questions';

export const getAllQuestions = async (jwtToken) => {
    const res = await fetch(END_POINT, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    // any status but 200 is error
    if (res.status !== 200) {
      return { hasError: true, message: 'A problem occured getting questions' };
    }
  
    return await res.json();
  }


export const createQuestion = async (question) => {
    const res = await fetch(END_POINT, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
  
    if (res.status !== 201) {
      return { error: true, message: 'A problem occured while adding quiz.' };
    }
  
    const data = await res.json();
    return data;
  };


export const updateQuestion = async (questionId, updatedQuestion, token) => {
    const res = await fetch(`${END_POINT}/${questionId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedQuestion),
    });
  
    if (res.status !== 200) {
      return { error: true, message: 'A problem occured while updating question.' };
    }
  
    const data = await res.json();
    return data;
  };