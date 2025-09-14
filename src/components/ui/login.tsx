"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { cn } from "@/lib/utils"
import { login } from "@/api/login/route"
import { getSchools } from "@/api/schools/route" // New import for fetching schools
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

type School = {
  id: string
  azonosito: string
  nev: string
  telepules: string
  omKod: string
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useRouter()
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [schoolOptions, setSchoolOptions] = useState<School[]>([])
  const [searchText, setSearchText] = useState<string>("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)

    useEffect(() => {
        getSchools().then((res) => {
            setSchoolOptions(res || []);
            console.log(res);
        });
    }, []);

  const handleLogin = async () => {
    if (!selectedSchool) {
      alert("Válassz ki egy iskolát a listából!")
      return
    }

    try {
      const response = await login(username, password, selectedSchool.azonosito)

      console.log(JSON.stringify(response))

      if (response) {
        // Use response directly as data
        const data = response

        console.log("Login response data:", data)

        if (data.bearerToken && data.refreshToken && data.expires_in) {
          Cookies.set("bearer_token", data.bearerToken, { expires: data.expires_in / 86400 })
          Cookies.set("refresh_token", data.refreshToken)
          Cookies.set("institute_code", selectedSchool.azonosito)
          Cookies.set("user_name", username)

          alert("Sikeres bejelentkezés!")

          navigate.push("/main")
        } else {
          console.error("Missing tokens in response:", data)
          alert("Hiba történt a bejelentkezés során.")
        }
      } else {
        console.error("Login failed with status:")
        alert("Hibás bejelentkezési adatok. Próbáld újra.")
      }
    } catch (err) {
      console.error("Hiba történt a bejelentkezés során:", err)
      alert("Hiba történt a bejelentkezés során. Próbáld újra.")
    }
  }

  const handleSelectSchool = (school: School) => {
    setSearchText(school.nev)
    setSelectedSchool(school)
  }

  const filteredSchools =
    searchText.length >= 3
      ? schoolOptions.filter(
          (school) =>
            school.nev.toLowerCase().includes(searchText.toLowerCase()) ||
            school.azonosito.toLowerCase().includes(searchText.toLowerCase()) ||
            school.omKod.toLowerCase().includes(searchText.toLowerCase()),
        )
      : []

  return (
    <div className={cn("min-w-[20rem] flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Üdvözlünk!</CardTitle>
          <CardDescription>Jelentkezz be a KRÉTA fiókoddal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Felhasználónév</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Azonosító"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Jelszó</Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-500 hover:underline ml-auto"
                    >
                      {showPassword ? "Elrejtés" : "Megjelenítés"}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Jelszó"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="relative space-y-2">
                  <Label htmlFor="school">Iskola</Label>
                  <Input
                    id="school"
                    type="text"
                    placeholder="Keresd az iskolád..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value)
                      setSelectedSchool(null)
                    }}
                    required
                  />
                  {searchText && filteredSchools.length > 0 && !selectedSchool && (
                    <ul className="absolute bg-background border border-gray-700 rounded shadow w-full max-h-60 overflow-y-auto mt-2 text-zinc-700 dark:text-gray-200/50">
                      {filteredSchools.map((school) => (
                        <li
                          key={school.id}
                          className="p-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleSelectSchool(school)}
                        >
                          {school.nev} ({school.telepules})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Bejelentkezés
              </Button>
              <a
                href="https://intezmenykereso.e-kreta.hu"
                target="_blank"
                className="mx-auto text-sm underline-offset-4 hover:underline"
                rel="noreferrer"
              >
                Elfelejtetted a jelszavad?
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
