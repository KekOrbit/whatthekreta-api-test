"use client";
import { useState, useEffect } from "react";
import { getGrades } from "@/api/grades/route";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ertekeles } from "@/lib/types";
import { userData } from "@/lib/types";
import { getAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function GradesPage() {
  const navigate = useRouter();
  const [grades, setGrades] = useState<Ertekeles[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
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

  async function fetchGrades(fromDate?: Date | null, toDate?: Date | null) {
    try {
      const data = await getGrades(
        { bearer_token: userData.bearer_token, institute_code: userData.institute_code },
        fromDate ?? undefined,
        toDate ?? undefined
      );
      setGrades(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  }

  return (
    <div>
      <div className="w-screen flex justify-between px-5 py-2">
        <Button onClick={() => {
            navigate.push("/main");
        }}>{'<'} Vissza</Button>
          <h1 className="text-3xl font-bold text-center">Grades Page</h1>
      </div>

      <div className="flex flex-col w-screen items-center justify-center h-[30vh]">
        <label>From Date:</label>
        <Input type="date" onChange={(e) => setFromDate(new Date(e.target.value))} className="w-[20%] mb-5" />

        <label>To Date:</label>
        <Input type="date" onChange={(e) => setToDate(new Date(e.target.value))} className="w-[20%] mb-5" />

        <Button
          onClick={() => {
            fetchGrades(fromDate, toDate);
          }}
        >
          Get grades
        </Button>
      </div>

      <div className="flex flex-col items-center">
        {grades.map((g) => (
          <div key={g.Uid} className="text-center mt-10 border w-[50%] p-3">
            <span className="font-semibold text-lg">&gt; {g.Tantargy.Nev} — {g.SzamErtek}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
