// export function getCSRFToken() {
//   let csrfToken = null;
//   const cookies = document.cookie.split(';');
//   for (let cookie of cookies) {
//     const [name, value] = cookie.trim().split('=');
//     if (name === 'csrftoken') {
//       csrfToken = value;
//       break;
//     }
//   }
//   return csrfToken;
// }
// src/csrf.js

export const getCSRFToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
};
