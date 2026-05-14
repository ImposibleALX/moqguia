import { MOQUEGUA_PLACES } from "./moquegua";

export interface TouristRoute {
  id: string;
  name: string;
  color: string;
  difficulty: "Fácil" | "Media" | "Media-Alta" | "Alta";
  duration: string;
  distanceKm: number;
  description: string;
  waypoints: string[]; // IDs from MOQUEGUA_PLACES
  geojson: GeoJSON.Feature<GeoJSON.LineString>;
}

// Helper to generate a straight-line LineString between POIs for the map
function generateLineStringFromWaypoints(waypointIds: string[]): GeoJSON.Feature<GeoJSON.LineString> {
  const coords = waypointIds
    .map(id => MOQUEGUA_PLACES.find(p => p.id === id))
    .filter(p => !!p)
    .map(p => [p!.longitude, p!.latitude]);

  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: coords
    }
  };
}

export const TOURIST_ROUTES: TouristRoute[] = [
  {
    id: "r1_casonas",
    name: "Circuito Monumental de Casonas (Urbano)",
    color: "#C45A3D", // Terracotta
    difficulty: "Fácil",
    duration: "2.5 horas",
    distanceKm: 4,
    description: "Recorrido por el centro histórico que muestra la evolución arquitectónica de Moquegua desde la colonia hasta la república.",
    waypoints: ["poi_plaza_armas", "poi_santo_domingo", "poi_museo_contisuyo", "poi_casona_diez_canseco", "poi_mirador_chen_chen"],
    geojson: generateLineStringFromWaypoints(["poi_plaza_armas", "poi_santo_domingo", "poi_museo_contisuyo", "poi_casona_diez_canseco", "poi_mirador_chen_chen"])
  },
  {
    id: "r2_baul",
    name: "Trekking Arqueológico Cerro Baúl",
    color: "#8B5CF6", // Purple
    difficulty: "Media-Alta",
    duration: "6 horas",
    distanceKm: 9,
    description: "Inmersión en la historia Wari con exigente ascenso y vistas panorámicas del valle.",
    waypoints: ["poi_torata", "poi_molinos_torata", "poi_cerro_baul"],
    geojson: generateLineStringFromWaypoints(["poi_torata", "poi_molinos_torata", "poi_cerro_baul"])
  },
  {
    id: "r3_pisco",
    name: "Ruta del Pisco y Valles Vitivinícolas",
    color: "#F59E0B", // Gold
    difficulty: "Media",
    duration: "1 día (8 horas)",
    distanceKm: 55,
    description: "Experiencia sensorial que une paisaje, historia y tradición pisquera ancestral del sur peruano.",
    waypoints: ["poi_torata", "poi_bodega_biondi", "poi_molinos_torata", "poi_plaza_armas"],
    geojson: generateLineStringFromWaypoints(["poi_torata", "poi_bodega_biondi", "poi_molinos_torata", "poi_plaza_armas"])
  }
];
