export const americanDateToISODate = (input: string) => {
  const [month, day, year] = input.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};


export const convertToAmericanFormat = (date: Date) => date.toLocaleString().split(',')[0];

export const get24HourTime = (
  isodate: string = new Date().toISOString(),
  roundToHour: boolean = true,
  addHours: number = 0
) => {
  const date = new Date(isodate);

  if (roundToHour) {
    date.setUTCMinutes(0, 0, 0); // 18:25 → 18:00
  }

  if (addHours) {
    date.setUTCHours(date.getUTCHours() + addHours);
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const concatDateAndTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const combinedDate = new Date(date);
  combinedDate.setHours(hours, minutes, 0, 0);
  return combinedDate.toISOString();
}
