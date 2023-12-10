const SET_1 = /[^$_0-9A-Za-z]/g;
const SET_2 = /^([0-9])/;

export default function safeIdentifier(value) {
  return value.replace(SET_1, '').replace(SET_2, '_$1');
}
