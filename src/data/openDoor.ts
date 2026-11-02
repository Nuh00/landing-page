/*
  WHERE EVERY DOOR LANDS ON THE PRE-LAUNCH PAGE (data/openDoor.ts): the terminal is not open yet, so every door that
  used to launch it goes to the sign-up at the foot of the page (#notify). The names are the landing's own imports.
*/
export const DOOR = '/pulse';
export const START = '/start';
export const NOTIFY = '#notify';
export const doorTo = (): string => NOTIFY;
