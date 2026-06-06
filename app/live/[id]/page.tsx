'use client'

import { useEffect, useState } from 'react'
import { MapPin, AlertTriangle, Clock, Phone } from 'lucide-react'

/**
 * Public live location viewer page.
 * Accessible via share URL: https://safiba.com/live/{sessionId}
 * No authentication required — anyone with the link can view.
 * Polls the API route every 10 seconds for location updates.
 */

type LocationData = {
  status: 'active' | 'stopped' | 'expired'
  lat: number | null
  lng: number | null
  last_updated: string | null
  expires_at: string | null
  message?: string
}

export default function LiveLocationPage({ params }: { params: { id: string } }) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocation = async () => {
    try {
      const res = await fetch(`/api/live-location/${params.id}`)
      if (res.status === 404) {
        setError('This location sharing link is invalid or has expired.')
        return
      }
      const data = await res.json()
      setLocation(data)
    } catch {
      setError('Unable to connect. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocation()
    const interval = setInterval(fetchLocation, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [params.id])

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown'
    const diff = Date.now() - new Date(dateString).getTime()
    const seconds = Math.floor(diff / 1000)
    if (seconds < 10) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m ago`
    return `${Math.floor(mins / 60)}h ago`
  }

  const getGoogleMapsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps?q=${lat},${lng}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="text-neutral-500 mt-4 text-sm">Loading location...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
        <div className="text-center max-w-sm">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">Link Unavailable</h1>
          <p className="text-neutral-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (location?.status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
        <div className="text-center max-w-sm">
          <Clock size={48} className="text-neutral-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">Session Expired</h1>
          <p className="text-neutral-500 text-sm">This location sharing session has ended.</p>
        </div>
      </div>
    )
  }

  if (location?.status === 'stopped') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
        <div className="text-center max-w-sm">
          <MapPin size={48} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-neutral-900 mb-2">Location Sharing Ended</h1>
          <p className="text-neutral-500 text-sm">The person has stopped sharing their location.</p>
        </div>
      </div>
    )
  }

  // Active location
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="bg-rose-600 text-white px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-semibold">LIVE LOCATION</span>
        </div>
        <p className="text-rose-100 text-xs">
          Updated {getTimeAgo(location?.last_updated || null)}
        </p>
      </div>

      {/* Map placeholder / Location display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {location?.lat && location?.lng ? (
          <div className="text-center w-full max-w-sm">
            {/* Map embed */}
            <div className="w-full aspect-square bg-white border border-neutral-200 rounded-xl overflow-hidden mb-6 shadow-sm">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sng!4v1`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            {/* Coordinates */}
            <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-rose-500" />
                <span className="text-sm font-medium text-neutral-700">Current Position</span>
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Last update: {getTimeAgo(location.last_updated)}
              </p>
            </div>

            {/* Actions */}
            <a
              href={getGoogleMapsUrl(location.lat, location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-neutral-900 text-white text-center py-3.5 rounded-xl text-sm font-semibold hover:bg-neutral-700 transition-colors"
            >
              Open in Google Maps
            </a>

            <a
              href="tel:112"
              className="block w-full mt-3 bg-rose-600 text-white text-center py-3.5 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <Phone size={14} />
                Call Emergency (112)
              </span>
            </a>
          </div>
        ) : (
          <div className="text-center">
            <MapPin size={48} className="text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">Waiting for location data...</p>
            <p className="text-neutral-400 text-xs mt-2">The person's location will appear here shortly</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 text-center border-t border-neutral-200 bg-white">
        <p className="text-xs text-neutral-400">
          Powered by Safiba · Emergency safety platform
        </p>
      </div>
    </div>
  )
}
