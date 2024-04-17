import { validateOrReject } from 'class-validator';

export const validateOrRejectModel = async (
  inputPayload: any,
  ctor: { new (): any },
) => {
  if (!(inputPayload instanceof ctor)) {
    throw new Error('Incorrect input data');
  }
  try {
    await validateOrReject(inputPayload);
  } catch (err) {
    throw new Error(err);
  }
};
