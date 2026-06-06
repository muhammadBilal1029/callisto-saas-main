"use client";

import { useEffect, useRef } from "react";
import type * as LeafletNS from "leaflet";
import "leaflet/dist/leaflet.css";
import { getOwnerColor } from "../lib/analytics";

export type MapPoint = {
  license: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  owner: string | null;
  dist: number;
  cases12m: number;
};

type Props = {
  selLat: number;
  selLng: number;
  selectedLicense: string;
  radiusMin: number;
  radiusMax: number;
  points: MapPoint[];
};

export function MarketAreaMap({
  selLat,
  selLng,
  selectedLicense,
  radiusMin,
  radiusMax,
  points,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const leafletRef = useRef<typeof LeafletNS | null>(null);
  const overlayRef = useRef<LeafletNS.Layer[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const L = leafletRef.current ?? (await import("leaflet"));
      if (cancelled) return;
      leafletRef.current = L;

      if (!mapRef.current && containerRef.current) {
        const map = L.map(containerRef.current).setView([selLat, selLng], 10);
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution: "© OpenStreetMap © CARTO",
            subdomains: "abcd",
            maxZoom: 20,
          },
        ).addTo(map);
        mapRef.current = map;
      }

      const map = mapRef.current;
      if (!map) return;

      // Clear previous markers/circles
      overlayRef.current.forEach((layer) => map.removeLayer(layer));
      overlayRef.current = [];

      if (radiusMax > 0) {
        overlayRef.current.push(
          L.circle([selLat, selLng], {
            radius: radiusMax * 1609.34,
            color: "#999",
            weight: 2,
            fill: false,
            dashArray: "5,5",
          }).addTo(map),
        );
      }
      if (radiusMin > 0) {
        overlayRef.current.push(
          L.circle([selLat, selLng], {
            radius: radiusMin * 1609.34,
            color: "#999",
            weight: 1,
            fill: false,
            dashArray: "5,5",
          }).addTo(map),
        );
      }

      points.forEach((fh) => {
        const isSel = fh.license === selectedLicense;
        const color = isSel ? "#C0392B" : getOwnerColor(fh.owner ?? "unknown");
        const marker = L.circleMarker([fh.lat, fh.lng], {
          radius: isSel ? 10 : 6,
          color: "#fff",
          fillColor: color,
          fillOpacity: 0.75,
          weight: isSel ? 3 : 1.5,
        })
          .bindTooltip(
            `<strong>${fh.name || fh.license}</strong><br>Cases: ${fh.cases12m.toLocaleString()}`,
            { direction: "top", offset: [0, -8] },
          )
          .bindPopup(
            `<strong>${fh.name || fh.license}</strong><br>City: ${fh.city || ""}<br>Cases: ${fh.cases12m.toLocaleString()}<br>Dist: ${fh.dist.toFixed(1)} mi`,
          )
          .addTo(map);
        overlayRef.current.push(marker);
      });

      if (radiusMax > 0) {
        const degLat = radiusMax / 69;
        const degLng = radiusMax / (69 * Math.cos((selLat * Math.PI) / 180));
        map.fitBounds(
          [
            [selLat - degLat, selLng - degLng],
            [selLat + degLat, selLng + degLng],
          ],
          { padding: [30, 30] },
        );
      } else {
        map.setView([selLat, selLng], 12);
      }

      // Leaflet needs a resize nudge once its container is laid out.
      setTimeout(() => map.invalidateSize(), 100);
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [selLat, selLng, selectedLicense, radiusMin, radiusMax, points]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-[400px] w-full border border-[#DDDDDD]" />;
}
