export const validateNoEmptyResult = async (output: string) => {
  if (!output.trim()) {
    return false;
  }
  return true;
};

export default validateNoEmptyResult;
