import { reloadPage } from "../utils.js";

export async function initOAuth()
{
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const refresh = params.get('refresh');
    const access = params.get('access');

    if (refresh && access)
    {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        createAlert('success', 'Successfully logged in with 42');
        reloadPage();
    }
    else
    {
        reateAlert('danger', 'Failed to logged in with 42');
        console.log('No tokens found');
    }
}