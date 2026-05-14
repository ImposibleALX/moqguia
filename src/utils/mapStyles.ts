import maplibregl from "maplibre-gl";

export type MapLayerType = "earthy" | "satellite";

/** Earthy Topography — OSM tiles optimized for mobile, no 3D terrain */
export function buildEarthyStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    sources: {
      "osm": {
        type: "raster",
        tiles: [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
        maxzoom: 19,
      },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#EBE6D9" } },
      {
        id: "osm-tiles",
        type: "raster",
        source: "osm",
        paint: {
          "raster-opacity": 0.88,
          "raster-saturation": -0.45,
          "raster-brightness-min": 0.15,
          "raster-brightness-max": 0.95,
          "raster-hue-rotate": 15,
        },
      },
    ],
  };
}

/** ESRI World Imagery — Satellite view, no key required */
export function buildSatelliteStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
    sources: {
      "esri-sat": {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "© Esri, Maxar, Earthstar Geographics",
        maxzoom: 18,
      },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0a0a0a" } },
      {
        id: "sat-tiles",
        type: "raster",
        source: "esri-sat",
        paint: { "raster-opacity": 1 },
      },
    ],
  };
}
