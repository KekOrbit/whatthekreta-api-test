"use server"

export async function getSchools() {
  try {
    const response = await fetch("https://kretaglobalapi.e-kreta.hu/intezmenyek/kreta/publikus", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching schools:", error);
  }
}