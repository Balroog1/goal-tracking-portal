"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerPage() {

  const router = useRouter();

  useEffect(() => {

    const role = localStorage.getItem("role");

    if (role !== "manager") {

      router.push("/login");

    }

  }, [router]);

  return (

    <main className="min-h-screen bg-black text-white p-10">
        <div className="flex justify-end mb-10">

          <button
            onClick={() => {

            localStorage.removeItem("role");

            router.push("/login");

            }}
            className="bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-xl font-semibold"
          >
           Logout
          </button>

        </div>

      <h1 className="text-5xl font-bold mb-4">
        Manager Dashboard
      </h1>

      <p className="text-gray-400 text-xl">
        Review employee performance and analytics.
      </p>

    </main>

  );
}