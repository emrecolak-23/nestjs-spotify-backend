import * as bcrypt from 'bcryptjs';

export const hashData = async (data: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(data, salt);
};

export const compareData = async (data: string, hash: string) => {
  return await bcrypt.compare(data, hash);
};
