import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TelemetryState } from '../utils/useSocketTelemetry'

interface SimpangArtosMapProps {
  telemetry: TelemetryState
}

const CENTER: [number, number] = [-7.50365, 110.22375]

type LaneKey = 'utara' | 'selatan' | 'timur' | 'barat'

const ROAD_SEGMENTS: Record<LaneKey, {
  label: string
  coords: [number, number][]
  markerPos: [number, number]
}> = {
  utara: {
    label: 'Magelang (Utara)',
    // Jl. Panglima Besar Sudirman (arah Magelang)
    coords: [
      [-7.502845, 110.223806],
      [-7.502739, 110.223696],
      [-7.502487, 110.223666],
      [-7.501949, 110.223629],
      [-7.501402, 110.223592],
      [-7.500906, 110.223553],
    ],
    markerPos: [-7.50165, 110.22325],
  },
  timur: {
    label: 'Artos (Timur)',
    // Jl. Soekarno Hatta (jalan arteri besar oranye ke arah Timur Laut / Artos)
    coords: [
      [-7.502845, 110.223806],
      [-7.502798, 110.223897],
      [-7.502666, 110.224014],
      [-7.502458, 110.224251],
      [-7.502331, 110.224391],
      [-7.502075, 110.224692],
      [-7.501801, 110.225002],
      [-7.50149, 110.225341],
      [-7.50099, 110.225915],
    ],
    markerPos: [-7.50195, 110.22525],
  },
  selatan: {
    label: 'Yogyakarta (Selatan)',
    // Jl. Magelang - Yogyakarta (jalan arteri besar ke arah Selatan)
    coords: [
      [-7.502845, 110.223806],
      [-7.503252, 110.22382],
      [-7.504179, 110.2239],
      [-7.504815, 110.223995],
      [-7.505195, 110.224072],
      [-7.505727, 110.224174],
      [-7.5063, 110.22428],
    ],
    markerPos: [-7.50565, 110.22465],
  },
  barat: {
    label: 'Purworejo (Barat)',
    // Jalur lurus masuk lampu merah dari arah Purworejo (Jl. Jenderal Sarwo Edhi Wibowo / 215)
    coords: [
      [-7.504183, 110.22382],
      [-7.504208, 110.223698],
      [-7.504414, 110.223167],
      [-7.504606, 110.222732],
      [-7.5048, 110.222348],
      [-7.504903, 110.222113],
      [-7.50506, 110.221702],
      [-7.505257, 110.22121],
      [-7.5053, 110.221105],
      [-7.505558, 110.220503],
    ],
    markerPos: [-7.50472, 110.22205],
  },
}

function getRoadColor(density: number) {
  if (density >= 70) return { color: '#ef4444', status: 'Padat' }
  if (density >= 30) return { color: '#f59e0b', status: 'Sedang' }
  return { color: '#16a34a', status: 'Senggang' }
}

export default function SimpangArtosMap({ telemetry }: SimpangArtosMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  // Inisialisasi peta OpenStreetMap sekali saat komponen dimount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: CENTER,
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    mapRef.current = map
    layerGroupRef.current = layerGroup

    return () => {
      map.remove()
      mapRef.current = null
      layerGroupRef.current = null
    }
  }, [])

  // Perbarui warna ruas jalan & indikator sinyal setiap ada data telemetri baru
  useEffect(() => {
    const group = layerGroupRef.current
    if (!group) return

    group.clearLayers()

    ;(['utara', 'selatan', 'timur', 'barat'] as LaneKey[]).forEach((lane) => {
      const seg = ROAD_SEGMENTS[lane]
      const density = telemetry.lanes[lane]
      const isGreen = telemetry.activeLane === lane
      const { color, status } = getRoadColor(density)

      // Outline putih agar warna jalan terlihat jelas di atas peta
      L.polyline(seg.coords, {
        color: '#ffffff',
        weight: 10,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group)

      // Garis warna kondisi kepadatan lalu lintas (Hijau / Oranye / Merah)
      const roadLine = L.polyline(seg.coords, {
        color,
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group)

      roadLine.bindTooltip(
        `<div style="font-size:12px;">
          <strong>${seg.label}</strong><br/>
          Kepadatan: <b>${density}% (${status})</b><br/>
          Lampu: <b style="color:${isGreen ? '#16a34a' : '#ef4444'}">${isGreen ? 'Hijau' : 'Merah'}</b>
        </div>`,
        { sticky: true }
      )

      // Label info jalur + indikator lampu lalu lintas di peta
      const badgeIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            display:inline-flex;
            align-items:center;
            gap:6px;
            background:#ffffff;
            border:1.5px solid ${color};
            border-radius:8px;
            padding:3px 8px;
            box-shadow:0 2px 6px rgba(0,0,0,0.18);
            white-space:nowrap;
            transform:translate(-50%,-50%);
            font-family:system-ui,sans-serif;
          ">
            <span style="
              width:9px;
              height:9px;
              border-radius:9999px;
              background:${isGreen ? '#22c55e' : '#ef4444'};
              display:inline-block;
            "></span>
            <span style="font-size:11px;font-weight:700;color:#111827;">${seg.label.split(' ')[0]}</span>
            <span style="font-size:11px;font-weight:700;color:${color};">${density}%</span>
          </div>
        `,
        iconSize: [0, 0],
      })

      L.marker(seg.markerPos, { icon: badgeIcon, interactive: false }).addTo(group)
    })
  }, [telemetry])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-gray-200 relative z-0"
      style={{ height: 300 }}
    />
  )
}
