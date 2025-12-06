import { isAxiosError } from "axios";
import toast from "react-hot-toast";

function handleAxiosError(error: Error) {
  console.log(error);
  if (isAxiosError(error)) {
    toast.error(
      error?.response?.data?.message || error?.message || "An error occurred!"
    );
  } else {
    toast.error(error.message || "An error occurred!");
  }
  return;
}

export default handleAxiosError;
