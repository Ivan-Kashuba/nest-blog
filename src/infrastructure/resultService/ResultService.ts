export const ResultService = {
  createError(field: string, message: string) {
    return [{ field, message }];
  },
};
