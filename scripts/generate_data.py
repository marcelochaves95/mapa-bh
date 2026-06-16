"""Generate docs/data/neighborhoods.json from the PBH WFS service.

Fetches the neighborhoods over HTTP, converts UTM (EPSG:31983) coordinates to
lat/lon (WGS84) and writes the static JSON consumed by the web app.

Usage:
    python scripts/generate_data.py
"""
import json
import os
import sys

from pyproj import Transformer

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.service import fetch_neighborhoods

OUTPUT_PATH = os.path.join("docs", "data", "neighborhoods.json")


def main():
    print("Fetching neighborhoods from PBH…")
    data = fetch_neighborhoods()
    print(f"  {len(data)} neighborhoods received.")

    transformer = Transformer.from_crs("EPSG:31983", "EPSG:4326", always_xy=True)

    def convert_ring(ring):
        lons, lats = transformer.transform([p[0] for p in ring], [p[1] for p in ring])
        return [[round(lon, 6), round(lat, 6)] for lon, lat in zip(lons, lats)]

    converted = {
        name: [[convert_ring(ring) for ring in polygon] for polygon in polygons]
        for name, polygons in data.items()
    }
    converted = dict(sorted(converted.items()))

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(converted, f, ensure_ascii=False, separators=(",", ":"))

    size_mb = os.path.getsize(OUTPUT_PATH) / 1024 / 1024
    print(f"  Saved to {OUTPUT_PATH} ({size_mb:.2f} MB).")


if __name__ == "__main__":
    main()
