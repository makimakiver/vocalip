'use client'
import { useState } from "react"
import { ethers } from "ethers"
import storyContractAbi from '../../../StoryContractABI.json'
import AssetCard from "../components/AssetCard."

export default function AllVoicesPage() {
  const contractAddress = "0x57A220322E44B7b42125d02385CC04816eDB5ec7"
  const STORY_RPC_URL = 'https://aeneid.storyrpc.io'
  const readProvider = new ethers.JsonRpcProvider(STORY_RPC_URL)
  const storyContract = new ethers.Contract(contractAddress, storyContractAbi, readProvider)
  const [voices, setVoices] = useState<String[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllVoices = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get length of dynamic array 'assets' from storage slot 0
      const rawLen = await readProvider.getStorage(contractAddress, 0)
      const assetCount = Number(rawLen)
      if (!assetCount) {
        setVoices([])
        setLoading(false)
        return
      }
      const promises = []
      for (let i = 0; i < assetCount; i++) {
        promises.push(storyContract.assets(i))
      }
      const results = await Promise.all(promises)
      setVoices(results)
      
    } catch (error) {
      let errorMsg = "Error fetching voices: ";
      if (error && typeof error === "object" && "message" in error) {
        errorMsg += (error as { message: string }).message;
      } else {
        errorMsg += String(error);
      }
      setError(errorMsg);
      setVoices([])
    }
    setLoading(false)
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-6">All Voices</h1>
      <button
        onClick={fetchAllVoices}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Loading..." : "Fetch All Voices"}
      </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}

      <div className="w-full max-w-xl mt-8">
        {voices.length > 0 ? (
          <ul className="space-y-4">
            {voices.map((voice, i) => (
              <li key={i} className="p-4 bg-white rounded-lg shadow flex flex-col">
                <AssetCard assetId={voice[1]} creator={voice[0]} />
              </li>
            ))}
          </ul>
        ) : (
          !loading && <div className="text-gray-500">No voices yet. Click "Fetch All Voices".</div>
        )}
      </div>
    </div>
  )
}