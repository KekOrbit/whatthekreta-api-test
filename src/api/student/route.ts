"use server";
import { Diak } from "@/lib/types";

export default async function getStudent(auth: { bearer_token: string; institute_code: string }) : Promise<Diak> {
  if (!auth.bearer_token || !auth.institute_code) {
    throw new Error("No valid tokens found");
  }

  const response = await fetch(`https://${auth.institute_code}.e-kreta.hu/ellenorzo/v3/sajat/TanuloAdatlap`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + auth.bearer_token,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }

  const data = await response.json();
  return data as Diak;
}
