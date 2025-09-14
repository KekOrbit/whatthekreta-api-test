"use client";
import { useState, useEffect } from "react";
import { getHomeworks, getHomework } from "@/api/homeworks/route";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HaziFeladat, userData as UserDataType } from "@/lib/types";
import { getAuthData } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function HomeworksPage() {
  const navigate = useRouter();
  const [homeworks, setHomeworks] = useState<HaziFeladat[]>([]);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [authData, setAuthData] = useState<UserDataType>({
    bearer_token: "",
    refresh_token: "",
    institute_code: "",
  });

  useEffect(() => {
    const data = getAuthData();

    if (!data) {
      console.log("No valid tokens found, redirecting to login...");
      navigate.push("/");
      return;
    }

    setAuthData(data);
  }, []);

  async function fetchHomeworks() {
    if (!fromDate) {
      console.error("fromDate is required");
      return;
    }

    try {
      const data = await getHomeworks(
        { bearer_token: authData.bearer_token, institute_code: authData.institute_code },
        fromDate,
        toDate ?? undefined
      );
      setHomeworks(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
    }
  }

  async function fetchHomework() {
    if (!id) {
      console.error("ID is required");
      return;
    }

    try {
      const data = await getHomework(
        { bearer_token: authData.bearer_token, institute_code: authData.institute_code },
        id
      );
      setHomeworks([data]);
      console.log(data);
    } catch (error) {
      console.error("Error fetching homework:", error);
    }
  }

  return (
    <div>
      <div className="w-screen flex justify-between px-5 py-2">
        <Button onClick={() => navigate.push("/main")}>{"<"} Vissza</Button>
        <h1 className="text-3xl font-bold text-center">Homeworks Page</h1>
      </div>

      <div className="flex flex-col w-screen items-center justify-center h-[30vh]">
        <label>From Date:</label>
        <Input
          type="date"
          onChange={(e) => setFromDate(new Date(e.target.value))}
          className="w-[20%] mb-5"
        />

        <label>To Date:</label>
        <Input
          type="date"
          onChange={(e) => setToDate(new Date(e.target.value))}
          className="w-[20%] mb-5"
        />

        <Button onClick={fetchHomeworks}>Get homeworks</Button>

        <label>ID</label>
        <Input onChange={(e) => setId(e.target.value)} className="w-[20%] mb-5" />
        <Button onClick={fetchHomework}>Get given homework</Button>
      </div>

      <div className="flex flex-col items-center">
        {homeworks.map((g) => (
          <div key={g.Uid} className="text-center mt-10 border w-[50%] p-3">
            <span className="font-semibold text-lg">
              &gt; [{g.Uid}] {g.Tantargy.Nev} — {g.Szoveg} ({g.HataridoDatuma.split("T")[0]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
