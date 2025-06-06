'use client'
import React, { useEffect, useRef, useState } from "react";
import "./AssetCard.css"
import { client } from "../../../utils/config";

type AssetCardProps = {
  assetId: string;
  creator: string;
};

export default function AssetCard({ assetId, creator }: AssetCardProps) {
  type AssetDataType = {
    nftMetadata?: {
      imageUrl?: string;
      name?: string;
    };
    [key: string]: any;
  };

  type MetaDataType = {
    image?: string;
    mediaUrl?: string;
    title?: string;
    description?: string;
    creators?: { address?: string }[];
    [key: string]: any;
  };

  const [assetData, setAssetData] = useState<AssetDataType | null>(null);
  const [metaData, setMetaData] = useState<MetaDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      const options = {
        method: "GET",
        headers: {
          "X-Api-Key": "MhBsxkU1z9fG6TofE59KqiiWV-YlYE8Q4awlLQehF3U",
          "X-Chain": "story-aeneid",
        },
      };
      const res = await fetch(
        `https://api.storyapis.com/api/v3/assets/${assetId}`,
        options
      );
      const data = await res.json();
      setAssetData(data.data);

      // Metadata fetch
      const metaRes = await fetch(
        `https://api.storyapis.com/api/v3/assets/${assetId}/metadata`,
        options
      );
      const metaJson = await metaRes.json();
      let meta = null;
      try {
        const metaDetail = await fetch(metaJson.metadataUri);
        meta = await metaDetail.json();
      } catch (err) {
        meta = null;
      }
      setMetaData(meta);
      setLoading(false);
    };
    fetchAsset();
  }, [assetId]);

  const imageUrl = metaData?.image || assetData?.nftMetadata?.imageUrl;
  const mediaUrl = metaData?.mediaUrl;
  const title = metaData?.title || assetData?.nftMetadata?.name || "Untitled";
  const description = metaData?.description || "";
  const creatorAddr = metaData?.creators?.[0]?.address || creator;

  const truncate = (addr: string | undefined) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  // Play/pause logic
  const handlePlayClick = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setAudioPlaying(!audioPlaying);
    }
  };
  // When audio finishes or is paused
  const handleAudioEnded = () => {
    setAudioPlaying(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  if (loading || !assetData || !metaData) {
    return <div className="asset-card loading">Loading asset...</div>;
  }



   const mintLicenseToken = async () => {
    
      const res = await fetch("/api/mint-license", {
        method: "POST",
        body: JSON.stringify({ parentIpId: assetId }),
      });
      const json = await res.json();
      console.log(json);
      alert("License Minted! Token ID " + json.txHash);
    }

      const attachLicenseTerms = async () => {
       const res = await fetch("/api/license-terms", {
        method: "POST",
        body: JSON.stringify({ ipId: assetId }),
      });
      const json = await res.json();
      console.log(json);
      alert("License Terms Added " + json.txHash);
      }
  return (
    <div className="asset-card">
      {/* Left: Image with play button */}
      <div className="asset-card-image-wrapper">
        <img src={imageUrl} alt={title} className="asset-card-image" />
        <button
          className={`asset-card-play-btn ${audioPlaying ? "pause" : ""}`}
          onClick={handlePlayClick}
          aria-label={audioPlaying ? "Pause" : "Play"}
        >
          {audioPlaying ? (
            // Pause Icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="5" width="4" height="14" rx="2" />
              <rect x="14" y="5" width="4" height="14" rx="2" />
            </svg>
          ) : (
            // Play Icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
        <audio
          ref={audioRef}
          src={mediaUrl}
          onEnded={handleAudioEnded}
          onPause={handleAudioEnded}
          style={{ display: "none" }}
        />
      </div>
      {/* Right: Details */}
      <div className="asset-card-details">
        <div className="asset-card-title">{title}</div>
        <div className="asset-card-desc">{description}</div>
        <a
          href={`https://aeneid.explorer.story.foundation/ipa/${assetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="asset-card-tag"
          title={assetId}
        >
          {truncate(assetId)}
        </a>
        <div className="asset-card-creator">
          Creator: <span>{truncate(creatorAddr)}</span>
        </div>
        {/* Always render an audio player below for control */}
        <audio
          ref={audioRef}
          src={mediaUrl}
          controls
          style={{ width: "100%", marginTop: "10px" }}
          onPlay={() => setAudioPlaying(true)}
          onPause={handleAudioEnded}
          onEnded={handleAudioEnded}
        />
        <button onClick={attachLicenseTerms} >
          attach license terms 
        </button>
        <button onClick={mintLicenseToken}>
          mint license token
        </button>

      </div>
    </div>
  );
}
