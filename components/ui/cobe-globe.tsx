"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import createGlobe, { type COBEOptions, type Marker } from "cobe"
import { useSpring } from "react-spring"

import { cn } from "@/lib/utils"

type CobeVariant =
  | "default"
  | "draggable"
  | "auto-draggable"
  | "auto-rotation"
  | "rotate-to-location"
  | "scaled"

interface Location {
  name: string
  lat?: number
  long?: number
  emoji?: string
}

interface GeocodeResult {
  lat: number
  lng: number
  display_name: string
}

interface CobeProps {
  variant?: CobeVariant
  className?: string
  style?: CSSProperties
  locations?: Location[]
  // Globe configuration settings
  phi?: number
  theta?: number
  mapSamples?: number
  mapBrightness?: number
  mapBaseBrightness?: number
  diffuse?: number
  dark?: number
  baseColor?: string
  markerColor?: string
  markerSize?: number
  glowColor?: string
  scale?: number
  offsetX?: number
  offsetY?: number
  opacity?: number
}

const REGION_MARKERS = [
  { id: "us", label: "US", location: [39.5, -98.35] },
  { id: "eu", label: "EU", location: [50.1, 8.68] },
  { id: "asia", label: "ASIA", location: [22.3, 114.17] },
  { id: "africa", label: "AFR", location: [-1.29, 36.82] },
  { id: "oceania", label: "OCE", location: [-33.86, 151.2] },
  { id: "south-america", label: "SA", location: [-23.55, -46.63] },
] satisfies Array<{
  id: string
  label: string
  location: [number, number]
}>

const makeRegionMarkers = (size: number): Marker[] =>
  REGION_MARKERS.map(({ id, location }) => ({
    id,
    location,
    size,
  }))

export function Cobe({
  variant = "default",
  className,
  style,
  locations = [
    { name: "San Francisco", emoji: "📍" },
    { name: "Berlin", emoji: "📍" },
    { name: "Tokyo", emoji: "📍" },
    { name: "Buenos Aires", emoji: "📍" },
  ],
  phi: initialPhi = 0,
  theta = 0.2,
  mapSamples = 10000,
  mapBrightness = 1.8,
  mapBaseBrightness = 0.025,
  diffuse = 3,
  dark = 1.0,
  baseColor = "#ffffff",
  markerColor = "#fb6415",
  markerSize = 0.05,
  glowColor = "#ffffff",
  scale = 1.0,
  offsetX = 0.0,
  offsetY = 0.0,
  opacity = 0.7,
}: CobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef<number>(0)
  const focusRef = useRef<[number, number]>([0, 0])
  const [customLocations, setCustomLocations] = useState<Location[]>([])
  const [isInitializing, setIsInitializing] = useState(true)

  const [{ r }, api] = useSpring(() => ({
    r: 0,
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001,
    },
  }))

  const defaultMarkers = useMemo(
    () => makeRegionMarkers(markerSize),
    [markerSize]
  )

  const useDefaultMarkers =
    variant === "default" ||
    variant === "draggable" ||
    variant === "auto-draggable" ||
    variant === "auto-rotation" ||
    variant === "scaled"

  const locationToAngles = (lat: number, long: number): [number, number] => {
    return [
      Math.PI - ((long * Math.PI) / 180 - Math.PI / 2),
      (lat * Math.PI) / 180,
    ]
  }

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [0, 0, 0]
  }

  const geocodeLocation = async (
    query: string
  ): Promise<GeocodeResult | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        }
      }
      return null
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  const geocodeLocationList = useCallback(async (locationList: Location[]) => {
    const geocodedLocations: Location[] = []

    for (const location of locationList) {
      if (location.lat != null && location.long != null) {
        geocodedLocations.push(location)
      } else {
        const result = await geocodeLocation(location.name)
        if (result) {
          geocodedLocations.push({
            ...location,
            lat: result.lat,
            long: result.lng,
          })
        }
      }
    }

    return geocodedLocations
  }, [])

  // Initialize locations on component mount
  useEffect(() => {
    const initializeLocations = async () => {
      if (variant === "rotate-to-location" && locations.length > 0) {
        setIsInitializing(true)
        const geocoded = await geocodeLocationList(locations)
        setCustomLocations(geocoded)
        setIsInitializing(false)
      }
    }

    initializeLocations()
  }, [variant, locations, geocodeLocationList])

  useEffect(() => {
    let phi = initialPhi
    let width = 0
    let currentPhi = 0
    let currentTheta = 0
    let frameId: number | null = null
    let isVisible = true
    let isTabVisible = !document.hidden
    const doublePi = Math.PI * 2

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize, { passive: true })
    onResize()

    if (!canvasRef.current) return

    const rotateMarkers: Marker[] = customLocations
      .filter((loc): loc is Location & { lat: number; long: number } =>
        loc.lat != null && loc.long != null
      )
      .map((loc) => ({
        location: [loc.lat, loc.long] as [number, number],
        size: markerSize,
      }))

    const markers: Marker[] = useDefaultMarkers
      ? defaultMarkers
      : variant === "rotate-to-location"
        ? rotateMarkers
        : []

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.65)
    const getHeight = () => (variant === "scaled" ? width * 0.4 : width)
    const globeOpts: COBEOptions = {
      devicePixelRatio: pixelRatio,
      width,
      height: getHeight(),
      phi,
      theta,
      dark,
      diffuse,
      mapSamples,
      mapBrightness,
      mapBaseBrightness,
      baseColor: hexToRgb(baseColor),
      markerColor: hexToRgb(markerColor),
      glowColor: hexToRgb(glowColor),
      markers,
      markerElevation: 0.018,
      scale: variant === "scaled" ? 2.5 : scale,
      offset: variant === "scaled" ? [0, getHeight() * 0.6] : [offsetX, offsetY],
      opacity,
    }

    const globe = createGlobe(canvasRef.current, globeOpts)

    // Skip WebGL work when the hero is offscreen or the tab is hidden.
    function tick() {
      if (!isVisible || !isTabVisible) {
        frameId = null
        return
      }

      const update: Partial<COBEOptions> = {
        width,
        height: getHeight(),
      }

      switch (variant) {
        case "default":
          phi += 0.005
          update.phi = phi + r.get()
          break
        case "draggable":
          update.phi = r.get()
          break
        case "auto-draggable":
          if (!pointerInteracting.current) {
            phi += 0.005
          }
          update.phi = phi + r.get()
          break
        case "auto-rotation":
          phi += 0.005
          update.phi = phi
          break
        case "rotate-to-location": {
          const [focusPhi, focusTheta] = focusRef.current
          const distPositive = (focusPhi - currentPhi + doublePi) % doublePi
          const distNegative = (currentPhi - focusPhi + doublePi) % doublePi
          if (distPositive < distNegative) {
            currentPhi += distPositive * 0.08
          } else {
            currentPhi -= distNegative * 0.08
          }
          currentTheta = currentTheta * 0.92 + focusTheta * 0.08
          update.phi = currentPhi
          update.theta = currentTheta
          break
        }
        case "scaled":
          // No rotation
          break
      }

      globe.update(update)
      frameId = requestAnimationFrame(tick)
    }

    const start = () => {
      if (frameId == null) {
        frameId = requestAnimationFrame(tick)
      }
    }

    const stop = () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId)
        frameId = null
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible && isTabVisible) start()
        else stop()
      },
      { rootMargin: "160px" }
    )

    observer.observe(canvasRef.current)

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden
      if (isVisible && isTabVisible) start()
      else stop()
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    start()

    // Fade in
    if (canvasRef.current) {
      const canvas = canvasRef.current
      setTimeout(() => {
        canvas.style.opacity = opacity.toString()
      })
    }

    return () => {
      stop()
      globe.destroy()
      observer.disconnect()
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [
    variant,
    r,
    customLocations,
    initialPhi,
    theta,
    mapSamples,
    mapBrightness,
    mapBaseBrightness,
    diffuse,
    dark,
    baseColor,
    markerColor,
    markerSize,
    glowColor,
    scale,
    offsetX,
    offsetY,
    opacity,
    defaultMarkers,
    useDefaultMarkers,
  ])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (
      variant === "draggable" ||
      variant === "auto-draggable" ||
      variant === "default"
    ) {
      pointerInteracting.current =
        e.clientX - pointerInteractionMovement.current
      if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    }
  }

  const handlePointerUp = () => {
    if (
      variant === "draggable" ||
      variant === "auto-draggable" ||
      variant === "default"
    ) {
      pointerInteracting.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    }
  }

  const handlePointerOut = () => {
    if (
      variant === "draggable" ||
      variant === "auto-draggable" ||
      variant === "default"
    ) {
      pointerInteracting.current = null
      if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (
      (variant === "draggable" ||
        variant === "auto-draggable" ||
        variant === "default") &&
      pointerInteracting.current !== null
    ) {
      const delta = e.clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      api.start({ r: delta / 200 })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      (variant === "draggable" ||
        variant === "auto-draggable" ||
        variant === "default") &&
      pointerInteracting.current !== null &&
      e.touches[0]
    ) {
      const delta = e.touches[0].clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      api.start({ r: delta / 100 })
    }
  }

  const handleLocationClick = (lat: number, long: number) => {
    if (variant === "rotate-to-location") {
      focusRef.current = locationToAngles(lat, long)
    }
  }

  const containerStyle: CSSProperties = {
    width: "100%",
    maxWidth: variant === "scaled" ? 800 : 600,
    aspectRatio: variant === "scaled" ? 2.5 : 1,
    margin: "auto",
    position: "relative",
    ...style,
  }

  const canvasStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    opacity: 0,
    transition: "opacity 1s ease",
    cursor:
      variant === "draggable" ||
      variant === "auto-draggable" ||
      variant === "default"
        ? "grab"
        : undefined,
    borderRadius:
      variant === "default" ||
      variant === "draggable" ||
      variant === "auto-draggable" ||
      variant === "auto-rotation"
        ? "50%"
        : variant === "scaled"
          ? "8px"
          : undefined,
  }

  return (
    <div className={cn("", className)} style={containerStyle}>
      <canvas
        ref={canvasRef}
        aria-label="Interactive network globe"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerOut}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={canvasStyle}
      />
      {variant === "rotate-to-location" && (
        <div
          className="flex flex-col items-center justify-center gap-2 md:flex-row"
        >
          {isInitializing ? "Loading locations..." : ""}
          {customLocations
            .filter((loc): loc is Location & { lat: number; long: number } =>
              loc.lat != null && loc.long != null
            )
            .map((location, index) => (
              <button
                key={index}
                onClick={() =>
                  handleLocationClick(location.lat, location.long)
                }
                className="bg-background/80 text-foreground hover:bg-background/90 border-border transition-all duration-200 hover:scale-105"
              >
                {location.emoji || "📍"} {location.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
