'use server'
import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import qs from "qs";
import bcrypt from "bcryptjs";

const TOKEN_URL = "https://idp.e-kreta.hu/connect/token";

interface LoginResult {
  bearerToken: string;
  refreshToken: string;
  expires_in: number;
}

interface RefreshResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

async function login(
  UserName: string,
  Password: string,
  klik: string
): Promise<LoginResult> {
  console.log("Starting login process", { UserName, Password, klik });

  const instance: AxiosInstance = axios.create({
      withCredentials: true,
      maxRedirects: 0,
    })

  const loginPageUrl =
    "https://idp.e-kreta.hu/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fprompt%3Dlogin%26nonce%3DwylCrqT4oN6PPgQn2yQB0euKei9nJeZ6_ffJ-VpSKZU%26response_type%3Dcode%26code_challenge_method%3DS256%26scope%3Dopenid%2520email%2520offline_access%2520kreta-ellenorzo-webapi.public%2520kreta-eugyintezes-webapi.public%2520kreta-fileservice-webapi.public%2520kreta-mobile-global-webapi.public%2520kreta-dkt-webapi.public%2520kreta-ier-webapi.public%26code_challenge%3DHByZRRnPGb-Ko_wTI7ibIba1HQ6lor0ws4bcgReuYSQ%26redirect_uri%3Dhttps%253A%252F%252Fmobil.e-kreta.hu%252Fellenorzo-student%252Fprod%252Foauthredirect%26client_id%3Dkreta-ellenorzo-student-mobile-ios%26state%3Dkreten_student_mobile%26suppressed_prompt%3Dlogin";

  const loginPageResp = await instance.get(loginPageUrl);
  const $ = cheerio.load(loginPageResp.data);
  const rvt = $('input[name="__RequestVerificationToken"]').attr("value");

  if (!rvt) throw new Error("RequestVerificationToken not found");

  const payload = {
    ReturnUrl:
      "/connect/authorize/callback?prompt=login&nonce=wylCrqT4oN6PPgQn2yQB0euKei9nJeZ6_ffJ-VpSKZU&response_type=code&code_challenge_method=S256&scope=openid%20email%20offline_access%20kreta-ellenorzo-webapi.public%20kreta-eugyintezes-webapi.public%20kreta-fileservice-webapi.public%20kreta-mobile-global-webapi.public%20kreta-dkt-webapi.public%20kreta-ier-webapi.public&code_challenge=HByZRRnPGb-Ko_wTI7ibIba1HQ6lor0ws4bcgReuYSQ&redirect_uri=https%3A%2F%2Fmobil.e-kreta.hu%2Fellenorzo-student%2Fprod%2Foauthredirect&client_id=kreta-ellenorzo-student-mobile-ios&state=kreten_student_mobile&suppressed_prompt=login",
    IsTemporaryLogin: false,
    UserName,
    Password,
    InstituteCode: klik,
    loginType: "InstituteLogin",
    __RequestVerificationToken: rvt,
  };

  const loginResp = await instance.post(
    "https://idp.e-kreta.hu/account/login",
    qs.stringify(payload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
      maxRedirects: 0,
      validateStatus: () => true,
    }
  );

  if (loginResp.status !== 200) {
    throw new Error("Login failed, check your credentials");
  }

  const redirectResp = await instance.get(
    "https://idp.e-kreta.hu/connect/authorize/callback?prompt=login&nonce=wylCrqT4oN6PPgQn2yQB0euKei9nJeZ6_ffJ-VpSKZU&response_type=code&code_challenge_method=S256&scope=openid%20email%20offline_access%20kreta-ellenorzo-webapi.public%20kreta-eugyintezes-webapi.public%20kreta-fileservice-webapi.public%20kreta-mobile-global-webapi.public%20kreta-dkt-webapi.public%20kreta-ier-webapi.public&code_challenge=HByZRRnPGb-Ko_wTI7ibIba1HQ6lor0ws4bcgReuYSQ&redirect_uri=https%3A%2F%2Fmobil.e-kreta.hu%2Fellenorzo-student%2Fprod%2Foauthredirect&client_id=kreta-ellenorzo-student-mobile-ios&state=kreten_student_mobile&suppressed_prompt=login",
    {
      maxRedirects: 0,
      validateStatus: () => true,
    }
  );

  const loc = redirectResp.headers.location;
  if (!loc) throw new Error("No redirect location found");

  const redirectUrl = new URL(loc);
  const code = redirectUrl.searchParams.get("code");

  if (!code) throw new Error("No authorization code found");

  const tokenPayload = {
    code,
    code_verifier: "DSpuqj_HhDX4wzQIbtn8lr8NLE5wEi1iVLMtMK0jY6c",
    redirect_uri:
      "https://mobil.e-kreta.hu/ellenorzo-student/prod/oauthredirect",
    client_id: "kreta-ellenorzo-student-mobile-ios",
    grant_type: "authorization_code",
  };

  const tokenResp = await instance.post(
    TOKEN_URL,
    qs.stringify(tokenPayload),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (tokenResp.status !== 200) {
    throw new Error(`Token retrieval failed. Status code: ${tokenResp.status}`);
  }

  const bearerToken = tokenResp.data.access_token as string;
  const refreshToken = tokenResp.data.refresh_token as string;

  console.log("Bearer token:", bearerToken);

  const hashedPassword = await bcrypt.hash(Password, 10);

  const query =
    "INSERT INTO users (username, password, access_token, institute_code) VALUES (?, ?, ?, ?)";
  const values = [UserName, hashedPassword, bearerToken, klik];

  // Example DB save (commented out)
  // db.query(query, values, (err, result) => {
  //   if (err) {
  //     console.error("Error saving to database:", err);
  //   } else {
  //     console.log("User data saved to database");
  //   }
  // });

  return {
    bearerToken,
    refreshToken,
    expires_in: tokenResp.data.expires_in as number,
  };
}

async function refreshToken(
  refreshToken: string,
  instituteCode: string
): Promise<RefreshResult> {
  const payload = {
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    client_id: "kreta-ellenorzo-student-mobile-ios",
    institute_code: instituteCode,
  };

  const headers = { "Content-Type": "application/x-www-form-urlencoded" };

  const response = await axios.post(TOKEN_URL, qs.stringify(payload), {
    headers,
  });

  if (response.status !== 200) {
    throw new Error(
      `Token refresh failed with status code: ${response.status}`
    );
  }

  return {
    access_token: response.data.access_token as string,
    refresh_token: response.data.refresh_token as string,
    expires_in: response.data.expires_in as number,
  };
}

export { login, refreshToken };
