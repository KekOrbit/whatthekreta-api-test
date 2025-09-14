import Cookies from "js-cookie";

export type TokenData = {
  bearer_token: string;
  refresh_token: string;
  institute_code: string;
};

export function getAuthData(): TokenData | null {
  const bearer_token = Cookies.get("bearer_token") || "";
  const refresh_token = Cookies.get("refresh_token") || "";
  const institute_code = Cookies.get("institute_code") || "";

  const isValid =
    bearer_token.trim() !== "" &&
    refresh_token.trim() !== "" &&
    institute_code.trim() !== "";

  if (!isValid) return null;

  return {
    bearer_token,
    refresh_token,
    institute_code,
  };
}
