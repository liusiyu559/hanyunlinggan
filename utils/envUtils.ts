
export const getApiKey = (): string => {
  try {
    // @ts-ignore
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};
