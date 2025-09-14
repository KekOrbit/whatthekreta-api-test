export async function login(username: string, password: string, instituteCode: string) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      instituteCode,
    }),
  })

  console.log("Login response status:", response.status)

  return response
}
