'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function RegistrationPage() {
  const router = useRouter()

  const handleIndividual = () => {
    console.log('Individual')
  }

  const handleCompany = () => {
    console.log('Company')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6">Company Registration</h1>
      <div className="flex space-x-4">
        <button
          onClick={handleIndividual}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Individual
        </button>
        <button
          onClick={handleCompany}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Company
        </button>
      </div>
    </div>
  )
}