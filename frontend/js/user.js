import { jwtDecode } from 'jwt-decode';
import { reloadPage } from './utils.js';

export function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export function getCurrentUserId() {
  try {
    const decoded = jwtDecode(localStorage.getItem('access_token'));
    return decoded.user_id;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

async function fetchData(url, key = 'undefined') {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
      Authorization: 'Bearer ' + localStorage.getItem('access_token')
    }
  });
  const data = await response.json();
  if (!response.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    reloadPage();
  }
  if (key === 'undefined') return data;
  return data[key];
}

export async function getUsername(userid = getCurrentUserId()) {
  return fetchData(`/api/users/${userid}`, 'username');
}

export async function getEmail(userid) {
  return fetchData(`/api/users/${userid}`, 'email');
}

export async function getAvatar(userid) {
  return fetchData(`/api/profiles/${userid}`, 'avatar');
}

export async function getFriendList(userid = getCurrentUserId()) {
  return fetchData(`/api/profiles/${userid}`, 'friends');
}

export async function getReceivedFriendRequestList(
  userid = getCurrentUserId()
) {
  return fetchData(`/api/profiles/${userid}`, 'friend_requests_received');
}

export async function getSentFriendRequestList(userid = getCurrentUserId()) {
  return fetchData(`/api/profiles/${userid}`, 'friend_requests_sent');
}

export async function getIs2Fa(userid) {
  return fetchData(`/api/users/${userid}`, 'is_2fa_enabled');
}

export async function getStatus(userid = getCurrentUserId()) {
  return fetchData(`/api/profiles/${userid}`, 'status');
}

export async function getStats(userid = getCurrentUserId()) {
  return fetchData(`/api/metrics/statistics/${userid}/`);
}

export async function getAlias(userid = getCurrentUserId()) {
  return fetchData(`/api/profiles/${userid}`, 'alias');
}

export async function setAlias(alias, userid = getCurrentUserId()) {
  const response = await fetch(`/api/profiles/${userid}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
      Authorization: 'Bearer ' + localStorage.getItem('access_token')
    },
    body: JSON.stringify({ alias: alias })
  });
  if (response.ok) {
    const responseData = await response.json();
    console.log(responseData);
    return responseData;
  } else {
    const errorData = await response.json();
    console.error('Error:', errorData);
    return errorData;
  }
}
