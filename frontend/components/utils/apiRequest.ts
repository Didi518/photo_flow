import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
}

export const handleAuthRequest = async <T>(
  requestCallback: () => Promise<T>,
  setLoading?: (loading: boolean) => void
): Promise<T | null> => {
  if (setLoading) setLoading(true);

  try {
    const response = await requestCallback();
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    console.error('API erreur: ', error);

    if (axiosError.response?.data.message) {
      console.error('Message d’erreur: ', axiosError.response.data.message);
      toast.error(axiosError.response.data.message);
    } else {
      toast.error('Une erreur inattendue est survenue.');
    }

    return null;
  } finally {
    if (setLoading) setLoading(false);
  }
};
