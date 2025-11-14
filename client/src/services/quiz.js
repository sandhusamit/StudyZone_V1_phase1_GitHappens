// import { getToken } from '../utils/token';

const END_POINT = '/api/quizzes';

export const getAllQuizzes = async () => {
  const res = await fetch(END_POINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status !== 200) {
    return { error: true, message: 'A problem occured getting quizzes' };
  }

  return await res.json();
};

// export const createQuiz = async (quiz) => {
//   const res = await fetch(END_POINT, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${getToken()}`,
//     },
//     body: JSON.stringify(quiz),
//   });

//   if (res.status !== 201) {
//     console.log(await res.json());
//     return { error: true, message: 'A problem occured while adding quiz.' };
//   }

//   return await res.json();
// };
