'use server'
import { Bejelentes } from "@/lib/types";

export async function getTests(auth: {bearer_token:string, institute_code: string}, fromDate?: Date, toDate?: Date): Promise<Bejelentes[]> {

  if (!auth.bearer_token || !auth.institute_code) {
    throw new Error("No valid tokens found");
  }

  if (fromDate && toDate && toDate < fromDate) {
    throw new Error("Invalid date range");
  }

  const response = await fetch(
    `https://${auth.institute_code}.e-kreta.hu/ellenorzo/v3/sajat/BejelentettSzamonkeresek${fromDate && toDate ? `?datumTol=${fromDate.toISOString().split('T')[0]}&datumIg=${toDate.toISOString().split('T')[0]}` : ''}`, {
      method: "GET",
      headers: {
        apiKey: "21ff6c25-d1da-4a68-a811-c881a6057463",
        Authorization: `Bearer ${auth.bearer_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tests: ${response.statusText}`);
  }

  const data = await response.json();
  return data as Bejelentes[];
}
