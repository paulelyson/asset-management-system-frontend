export const americanDateToISODate = (input: string) => {
  const [month, day, year] = input.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const convertToAmericanFormat = (date: string) => date.toLocaleString().split(',')[0];
