import { isAxiosError } from 'axios';

export const handleError = (error) => {
  if (isAxiosError(error)) {
    console.error(error);
  }
};
