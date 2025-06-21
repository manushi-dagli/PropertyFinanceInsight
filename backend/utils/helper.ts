export const validatePayload = <T>(payload: T, schema: any): T => {
  const { error, value } = schema.validate(payload);
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
  return value;
};
