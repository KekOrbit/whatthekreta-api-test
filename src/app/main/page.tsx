'use client'
import { useState, useEffect } from "react";
import { getSchools } from "@/api/schools/route";

export default function Main() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        getSchools().then((res) => {
            setData(res || []);
            console.log(res);
        });
    }, []);

    return (
        <div>
            <h1>Main</h1>
            <ul>
                {data.map((school: any, index: number) => (
                    <li key={index}>
                        {school.Nev} {/* change this if API uses a different field */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
