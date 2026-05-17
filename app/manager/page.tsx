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

      <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

  <table className="w-full">

    <thead className="bg-white/10">

      <tr>

        <th className="text-left p-4">
          Employee
        </th>

        <th className="text-left p-4">
          Department
        </th>

        <th className="text-left p-4">
          Goals Completed
        </th>

        <th className="text-left p-4">
          Performance
        </th>

      </tr>

    </thead>

    <tbody>

      <tr className="border-t border-white/10">

        <td className="p-4">
          John Doe
        </td>

        <td className="p-4">
          Sales
        </td>

        <td className="p-4">
          8 / 10
        </td>

        <td className="p-4 text-green-400">
          Excellent
        </td>

      </tr>

      <tr className="border-t border-white/10">

        <td className="p-4">
          Sarah Lee
        </td>

        <td className="p-4">
          Marketing
        </td>

        <td className="p-4">
          6 / 10
        </td>

        <td className="p-4 text-yellow-400">
          Good
        </td>

      </tr>

      <tr className="border-t border-white/10">

        <td className="p-4">
          Michael Chen
        </td>

        <td className="p-4">
          Engineering
        </td>

        <td className="p-4">
          9 / 10
        </td>

        <td className="p-4 text-green-400">
          Excellent
        </td>

      </tr>

    </tbody>

  </table>

</div>

    </main>

  );
}