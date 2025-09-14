// // import { NextResponse } from "next/server"

// export async function GET() {
//   const response = fetch("https://kretaglobalapi.e-kreta.hu/intezmenyek/kreta/publikus")
//     console.log(response)
//   // try {


//   //   // if (!response.ok) {
//   //   //   throw new Error(`HTTP error! status: ${response.status}`)
//   //   // }


//   //   // const schools = await response.json()

//   //   return []
//   // } catch (error) {
//   //   console.error("Error fetching schools:", error)
//   // }
// }

// export async function OPTIONS() {
//   return new Response(null, {
//     status: 200,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   })
// }


"use server"

export async function getSchools() {
  try {
    const response = await fetch("https://kretaglobalapi.e-kreta.hu/intezmenyek/kreta/publikus", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // parse JSON
    const data = await response.json();

    // print API data
    console.log(data);

    return data; // optional: return the parsed data for use elsewhere
  } catch (error) {
    console.error("Error fetching schools:", error);
  }
}