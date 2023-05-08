//internal helper function to shift char code
const _shiftCharCode = (Δ) => (c) => String.fromCharCode(c.charCodeAt(0) + Δ);

//choose color based on id on a colorwheel designed so that two consecutive ids have a color that is visually very distinct
//use 256 color, web based
//id is a string with alpha characters only from 2 chars or more
export const colorFromId = (id: string): string => {
  const colorwheel: Array<string> = [];
  //generate colorwheel
  for (let i = 0; i < 256; i++) {
    colorwheel.push(`#${i.toString(16).padStart(2, '0')}0000`);
  }
  for (let i = 0; i < 256; i++) {
    colorwheel.push(`#00${i.toString(16).padStart(2, '0')}00`);
  }
  for (let i = 0; i < 256; i++) {
    colorwheel.push(`#0000${i.toString(16).padStart(2, '0')}`);
  }
  //hash id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = colorwheel[Math.abs(hash) % colorwheel.length];
  return color;
};

//add <> to urls to prevent discord from embedding them
export const preventEmbed = (url: string): string => {
  if (!url || url === '') return '';
  return url.replace(/(https?:\/\/[^\s]+)/g, '<$1>');
};

//convert string to full width characters
export const toFullWidthString = (str: string): string =>
  str.replace(/[!-~]/g, _shiftCharCode(0xfee0));

//convert string to half width characters
export const toHalfWidthString = (str: string): string =>
  str.replace(/[！-～]/g, _shiftCharCode(-0xfee0));

//check if string is full width
export const isFullWidthString = (str: string): boolean => {
  return str.split('').some((c) => c.charCodeAt(0) > 0xff00);
};

//parse date string or date object to date object, if not possible return current date
export const parseDate = (date: any): Date => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  if (date instanceof Date) {
    return date;
  }
  return new Date();
};

// 2022-12-28
export const formatDateShort = (date: any): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  } else if (!(date instanceof Date)) {
    date = new Date();
  }
  // adds 0 if month or day is < 10
  const addZero = (n) => (n < 10 ? `0${n}` : n);
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )}`;
};

export const formatEmbedFieldDate = (date): string => {
  return `📅 ${formatDateShort(parseDate(date))}`;
};

export const formatChannelName = (name: string): string => {
  return `#${name}`;
};

export const formatUsername = (name: string): string => {
  return `@${name}`;
};
