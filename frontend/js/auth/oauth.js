import { reloadPage, createAlert } from "../utils.js";


export function initOAuth()
{
    console.log('initOAuth');
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const refresh = params.get('refresh');
    const access = params.get('access');

    console.log(refresh, access);
    if (refresh && access)
    {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        createAlert('success', 'Successfully logged in with 42');
        const cleanUrl = window.location.origin + window.location.pathname;
        history.replaceState({}, document.title, cleanUrl);
    }
}