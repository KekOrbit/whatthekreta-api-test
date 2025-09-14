"use server";
import { HaziFeladat } from "@/lib/types";

export async function getHomeworks(auth: { bearer_token: string; institute_code: string }, fromDate: Date, toDate?: Date): Promise<HaziFeladat[]> {
  if (!auth.bearer_token || !auth.institute_code) {
    throw new Error("No valid tokens found");
  }

  if (!fromDate) {
    throw new Error("fromDate is required");
  }

  if (toDate && toDate < fromDate) {
    throw new Error("Invalid date range");
  }

  const query = `?datumTol=${fromDate.toISOString().split("T")[0]}${toDate ? `&datumIg=${toDate.toISOString().split("T")[0]}` : ""}`;
  const response = await fetch(`https://${auth.institute_code}.e-kreta.hu/ellenorzo/v3/sajat/HaziFeladatok${query}`, {
    method: "GET",
    headers: {
      apiKey: "21ff6c25-d1da-4a68-a811-c881a6057463",
      Authorization: `Bearer ${auth.bearer_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch homeworks: ${response.statusText}`);
  }

  const data = await response.json();
  return data as HaziFeladat[];
}

export async function getHomework(auth: { bearer_token: string; institute_code: string }, id: string): Promise<HaziFeladat> {
  if (!auth.bearer_token || !auth.institute_code) {
    throw new Error("No valid tokens found");
  }

  if (!id) {
    throw new Error("No valid homework ID found");
  }

  const response = await fetch(`https://${auth.institute_code}.e-kreta.hu/ellenorzo/v3/sajat/HaziFeladatok/${id}`, {
    method: "GET",
    headers: {
      apiKey: "21ff6c25-d1da-4a68-a811-c881a6057463",
      Authorization: `Bearer ${auth.bearer_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch homework: ${response.statusText}`);
  }

  const data = await response.json();
  return data as HaziFeladat;
}
