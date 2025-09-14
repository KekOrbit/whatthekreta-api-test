"use client";
import { useState, useEffect, use } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { userData } from "@/lib/types";
import { getAuthData } from "@/lib/auth";

export default function Main() {
  const navigate = useRouter();
  const [grades, setGrades] = useState<any[]>([]);
  const [userData, setUserData] = useState<userData>({
    bearer_token: "",
    refresh_token: "",
    institute_code: "",
  });

  useEffect(() => {
    const authData = getAuthData();

    console.log(authData);

    if (!authData) {
      console.log("No valid tokens found, redirecting to login...");
      navigate.push("/");
      return;
    }

    setUserData(authData);
  }, []);


  return (
    <div>
      <ul className="text-center flex flex-col gap-5 text-sm absolute top-2 left-2">
        {Object.entries(userData).map(([key, value]) => (
          <li key={key}>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(String(value));
                alert(`${key} copied to clipboard!`);
              }}
            >
              {key}
            </Button>
          </li>
        ))}
      </ul>
      <h1 className="text-3xl font-bold text-center">API TESZT</h1>

      <div className="flex gap-5 justify-center mt-10">
        <Button variant={"outline"} onClick={() => {
            navigate.push("/main/APIs/grades");
        }}>Jegyek</Button>
        <Button variant={"outline"} onClick={() => {
            navigate.push("/main/APIs/student");
        }}>Tanuló</Button>
        <Button variant={"outline"} onClick={() => {
            navigate.push("/main/APIs/tests");
        }}>Bejelentett számonkérések</Button>
        <Button variant={"outline"} onClick={() => {
            navigate.push("/main/APIs/homeworks");
        }}>Házi feladatok</Button>
      </div>
    </div>
  );
}
