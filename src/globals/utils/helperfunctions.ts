export const PrettyPrintJSON = (obj: unknown) => {
  console.log(JSON.stringify(obj, null, 4));
};
