'use server'
import { parse } from 'url';
import { parse as parseQuery } from 'querystring';
import * as cheerio from 'cheerio';

interface LoginCredentials {
  userName: string;
  password: string;
  instituteCode: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export async function loginToKreta(credentials: LoginCredentials): Promise<TokenResponse> {
  const { userName, password, instituteCode } = credentials;
  
  try {
    const cookieJar = new Map<string, string>();
    
    const makeRequest = async (url: string, options: RequestInit = {}) => {
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ...(options.headers as Record<string, string> | undefined)
      };
      
      if (cookieJar.size > 0) {
        const cookieString = Array.from(cookieJar.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join('; ');
        headers['Cookie'] = cookieString;
      }
      
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const cookies = setCookie.split(',').map(cookie => cookie.trim());
        cookies.forEach(cookie => {
          const [nameValue] = cookie.split(';');
          const [name, value] = nameValue.split('=');
          if (name && value) {
            cookieJar.set(name.trim(), value.trim());
          }
        });
      }
      
      return response;
    };

    const initialUrl = "https://idp.e-kreta.hu/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fprompt%3Dlogin%26nonce%3DwylCrqT4oN6PPgQn2yQB0euKei9nJeZ6_ffJ-VpSKZU%26response_type%3Dcode%26code_challenge_method%3DS256%26scope%3Dopenid%2520email%2520offline_access%2520kreta-ellenorzo-webapi.public%2520kreta-eugyintezes-webapi.public%2520kreta-fileservice-webapi.public%2520kreta-mobile-global-webapi.public%2520kreta-dkt-webapi.public%2520kreta-ier-webapi.public%26code_challenge%3DHByZRRnPGb-Ko_wTI7ibIba1HQ6lor0ws4bcgReuYSQ%26redirect_uri%3Dhttps%253A%252F%252Fmobil.e-kreta.hu%252Fellenorzo-student%252Fprod%252Foauthredirect%26client_id%3Dkreta-ellenorzo-student-mobile-ios%26state%3Dkreten_student_mobile%26suppressed_prompt%3Dlogin";
    
    const initialResponse = await makeRequest(initialUrl, {
      method: 'GET'
    });

    if (!initialResponse.ok) {
      throw new Error(`Failed to fetch login page: ${initialResponse.status}`);
    }

    const html = await initialResponse.text();
    
    const $ = cheerio.load(html);
    const rvt = $('input[name="__RequestVerificationToken"]').attr('value');
    
    if (!rvt) {
      throw new Error('Could not find RequestVerificationToken');
    }

    const loginPayload = new URLSearchParams({
      'ReturnUrl': '/connect/authorize/callback?prompt=login&nonce=wylCrqT4oN6PPgQn2yQB0euKei9nJeZ6_ffJ-VpSKZU&response_type=code&code_challenge_method=S256&scope=openid%20email%20offline_access%20kreta-ellenorzo-webapi.public%20kreta-eugyintezes-webapi.public%20kreta-fileservice-webapi.public%20kreta-mobile-global-webapi.public%20kreta-dkt-webapi.public%20kreta-ier-webapi.public&code_challenge=HByZRRnPGb-Ko_wTI7ibIba1HQ6lor0ws4bcgReuYSQ&redirect_uri=https%3A%2F%2Fmobil.e-kreta.hu%2Fellenorzo-student%2Fprod%2Foauthredirect&client_id=kreta-ellenorzo-student-mobile-ios&state=kreten_student_mobile&suppressed_prompt=login',
      'IsTemporaryLogin': 'false',
      'UserName': userName,
      'Password': password,
      'InstituteCode': instituteCode,
      'loginType': 'InstituteLogin',
      '__RequestVerificationToken': rvt
    });

    // Add a small delay to mimic the original Python code
    await new Promise(resolve => setTimeout(resolve, 500));

    const loginResponse = await makeRequest('https://idp.e-kreta.hu/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': initialUrl
      },
      body: loginPayload,
      redirect: 'manual'
    });

    if (loginResponse.status === 200) {
      const responseText = await loginResponse.text();
      if (responseText.includes('input[name="__RequestVerificationToken"]') || 
          responseText.includes('error')) {
          throw new Error('Login failed - invalid credentials or institute code');
      }
    } else if (loginResponse.status !== 302) {
      throw new Error(`Login failed with status ${loginResponse.status} - check your credentials`);
    }

    const authUrl = "https://idp.e-kreta.hu/connect/authorize/callback?prompt=login&nonce=wylCrqT4oN6PPgQn2yQB0euKei9nJeZ6_ffJ-VpSKZU&response_type=code&code_challenge_method=S256&scope=openid%20email%20offline_access%20kreta-ellenorzo-webapi.public%20kreta-eugyintezes-webapi.public%20kreta-fileservice-webapi.public%20kreta-mobile-global-webapi.public%20kreta-dkt-webapi.public%20kreta-ier-webapi.public&code_challenge=HByZRRnPGb-Ko_wTI7ibIba1HQ6lor0ws4bcgReuYSQ&redirect_uri=https%3A%2F%2Fmobil.e-kreta.hu%2Fellenorzo-student%2Fprod%2Foauthredirect&client_id=kreta-ellenorzo-student-mobile-ios&state=kreten_student_mobile&suppressed_prompt=login";
    
    const authResponse = await makeRequest(authUrl, {
      method: 'GET',
      redirect: 'manual'
    });

    const location = authResponse.headers.get('location');
    if (!location) {
      throw new Error('No redirect location found in authorization response - authentication may have failed');
    }

    const parsedUrl = parse(location);
    const queryParams = parseQuery(parsedUrl.query || '');
    const code = Array.isArray(queryParams.code) ? queryParams.code[0] : queryParams.code;

    if (!code) {
      throw new Error('No authorization code found in redirect URL - authentication failed');
    }

    console.log('Authorization code obtained:', code);

    const tokenPayload = new URLSearchParams({
      'code': code,
      'code_verifier': 'DSpuqj_HhDX4wzQIbtn8lr8NLE5wEi1iVLMtMK0jY6c',
      'redirect_uri': 'https://mobil.e-kreta.hu/ellenorzo-student/prod/oauthredirect',
      'client_id': 'kreta-ellenorzo-student-mobile-ios',
      'userName': userName,
      'password': password,
      'institute_code': instituteCode,
      'grant_type': 'authorization_code'
    });

    const tokenResponse = await fetch('https://idp.e-kreta.hu/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenPayload
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();
    return tokens;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Login failed: ${error.message}. Make sure to use the correct credentials and institute code.`);
    }
    throw new Error('Login failed - check your credentials and try again. Make sure to use the longer institute code.');
  }
}