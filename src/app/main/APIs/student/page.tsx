"use client";
import { useState, useEffect } from "react";
import getStudent from "@/api/student/route";
import { Diak } from "@/lib/types";
import { userData } from "@/lib/types";
import { getAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StudentPage() {
  const navigate = useRouter();
  const [student, setStudent] = useState<Diak>({} as Diak);
  const [userData, setUserData] = useState<userData>({
    bearer_token: "",
    refresh_token: "",
    institute_code: "",
  });

  useEffect(() => {
    const authData = getAuthData();

    if (!authData) {
      navigate.push("/");
      return;
    }

    setUserData(authData);
  }, []);

  async function fetchStudent() {
    try {
      const data = await getStudent({
        bearer_token: userData.bearer_token,
        institute_code: userData.institute_code,
      });
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  }

  return (
    <div>
      <div className="w-screen flex justify-between px-5 py-2">
        <Button onClick={() => navigate.push("/main")}>{"<"} Vissza</Button>
        <h1 className="text-3xl font-bold text-center">Student Page</h1>
      </div>

      <div className="flex flex-col w-screen items-center justify-center h-[30vh]">
        <Button onClick={fetchStudent}>Fetch Student Data</Button>
      </div>

      <div className="flex flex-col items-center mt-10">
        {student.Nev && (
          <div className="text-center border w-[50%] p-3">
            <span className="font-semibold text-lg">
              &gt; {student.Nev} - {student.IntezmenyAzonosito}<br />{student.Intezmeny.RovidNev}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
