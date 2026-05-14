export interface Place {
  id: string;
  name: string;
  category: "Historia" | "Naturaleza" | "Arqueología" | "Gastronomía" | "Ruta" | "Mirador";
  coordinates: { lat: number; lng: number };
  altitude: number;
  offlineDataSize: string;
  isMustSee: boolean;
  shortDescription: string;
  fullDescription: string;
  audioGuideScript: string;
  culturalSignificance: string;
  practicalInfo: {
    bestTimeToVisit: string;
    entryFee: string;
    difficulty: string;
  };
  image: string;
  latitude: number;
  longitude: number;
  description: string;
}

export const MOQUEGUA_PLACES: Place[] = [
  {
    id: "poi_plaza_armas",
    name: "Plaza de Armas de Moquegua",
    category: "Historia",
    coordinates: { lat: -17.1930, lng: -70.9335 },
    latitude: -17.1930,
    longitude: -70.9335,
    altitude: 1410,
    offlineDataSize: "4.8",
    isMustSee: true,
    shortDescription: "Corazón colonial con pileta Eiffel y casonas republicanas.",
    fullDescription: "La Plaza de Armas, trazada en el siglo XVI, es el centro histórico y social de Moquegua. Destaca la pileta ornamental diseñada por Gustave Eiffel en 1877, rodeada de portales coloniales y casonas republicanas.",
    description: "La Plaza de Armas, trazada en el siglo XVI, es el centro histórico y social de Moquegua...",
    audioGuideScript: "Bienvenido a la Plaza de Armas de Moquegua, trazada en 1541...",
    culturalSignificance: "Patrimonio Monumental de la Nación.",
    practicalInfo: { bestTimeToVisit: "Mañana (7-11 AM) o atardecer", entryFee: "0", difficulty: "Fácil" },
    // IMAGEN REAL: Plaza de Armas de Moquegua [1]
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ciudad_de_Moquegua_-_Plaza_de_armas.jpg?width=1200",
  },
  {
    id: "poi_santo_domingo",
    name: "Iglesia Concatedral Santo Domingo",
    category: "Historia",
    coordinates: { lat: -17.1941, lng: -70.9338 },
    latitude: -17.1941,
    longitude: -70.9338,
    altitude: 1420,
    offlineDataSize: "5.5",
    isMustSee: true,
    shortDescription: "Tesoro barroco con el cuerpo incorrupto de Santa Fortunata.",
    fullDescription: "Construida en el siglo XVIII, esta concatedral destaca por su fachada neoclásica en sillar...",
    description: "Construida en el siglo XVIII, esta concatedral destaca por su fachada neoclásica en sillar...",
    audioGuideScript: "Frente a la Concatedral Santo Domingo. En su interior descansa Santa Fortunata desde 1798...",
    culturalSignificance: "Patrimonio religioso y cultural del departamento.",
    practicalInfo: { bestTimeToVisit: "Mañana (8-12 PM)", entryFee: "0", difficulty: "Fácil" },
    // IMAGEN REAL: Catedral de Moquegua [2]
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Co-Catedral_Santo_Domingo_de_la_Ciudad_de_Moquegua.jpg?width=1200",
  },
  {
    id: "poi_cerro_baul",
    name: "Cerro Baúl",
    category: "Arqueología",
    coordinates: { lat: -17.112115, lng: -70.85881 },
    latitude: -17.112115,
    longitude: -70.85881,
    altitude: 2560,
    offlineDataSize: "9.2",
    isMustSee: true,
    shortDescription: "Ciudadela Wari en la cima con vistas panorámicas del valle.",
    fullDescription: "Impresionante sitio arqueológico Wari (600-1000 d.C.) ubicado en la cima de un cerro truncado...",
    description: "Impresionante sitio arqueológico Wari...",
    audioGuideScript: "Usted se encuentra en el Cerro Baúl, centro de poder Wari...",
    culturalSignificance: "Único sitio documentado de convivencia Wari-Tiwanaku.",
    practicalInfo: { bestTimeToVisit: "Mañana temprano (6-10 AM)", entryFee: "10", difficulty: "Media" },
    // IMAGEN REAL: Cerro Baúl[3]
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cerro_Baul.jpg?width=1200",
  },
  {
    id: "poi_chen_chen",
    name: "Geoglifos de Chen Chen",
    category: "Arqueología",
    coordinates: { lat: -17.2205, lng: -70.9100 },
    latitude: -17.2205,
    longitude: -70.9100,
    altitude: 1500,
    offlineDataSize: "6.8",
    isMustSee: true,
    shortDescription: "Gigantescos geoglifos Tiwanaku visibles en las laderas.",
    fullDescription: "Conjunto de geoglifos (figuras antropomorfas, zoomorfas y geométricas)...",
    description: "Conjunto de geoglifos creados por la cultura Tiwanaku...",
    audioGuideScript: "Estos geoglifos fueron creados por los Tiwanaku hace más de mil años...",
    culturalSignificance: "Evidencia de la expansión Tiwanaku hacia la costa.",
    practicalInfo: { bestTimeToVisit: "Mañana (8-11 AM) o tarde", entryFee: "5", difficulty: "Fácil" },
    // IMAGEN REAL: Geoglifos del sur peruano
    image: "https://i0.wp.com/seturismo.pe/wp-content/uploads/2018/10/geoglifos-de-chen-chen-moquegua.jpg?ssl=1",
  },
  {
    id: "poi_torata",
    name: "Pueblo Colonial de Torata",
    category: "Historia",
    coordinates: { lat: -17.077, lng: -70.843 },
    latitude: -17.077,
    longitude: -70.843,
    altitude: 2220,
    offlineDataSize: "5.1",
    isMustSee: true,
    shortDescription: "Joyita colonial con molinos de piedra y arquitectura vernácula.",
    fullDescription: "Distrito ubicado a 24 km de Moquegua. Destaca por sus casonas con techos de mojinete...",
    description: "Distrito ubicado a 24 km de Moquegua...",
    audioGuideScript: "Bienvenidos a Torata. Sus casas con techos de mojinete...",
    culturalSignificance: "Ejemplo excepcional de arquitectura rural virreinal.",
    practicalInfo: { bestTimeToVisit: "Todo el día", entryFee: "0", difficulty: "Fácil" },
    // IMAGEN REAL: Iglesia/Pueblo de Torata [4]
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Vista_panor%C3%A1mica_de_Torata.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
  },
  {
    id: "poi_museo_contisuyo",
    name: "Museo Contisuyo",
    category: "Arqueología",
    coordinates: { lat: -17.1932, lng: -70.9334 },
    latitude: -17.1932,
    longitude: -70.9334,
    altitude: 1415,
    offlineDataSize: "7.3",
    isMustSee: true,
    shortDescription: "El mejor resumen arqueológico del sur andino.",
    fullDescription: "Ubicado en la Plaza de Armas, exhibe más de 70 mil piezas arqueológicas...",
    description: "Ubicado en la Plaza de Armas, exhibe piezas arqueológicas...",
    audioGuideScript: "En el Museo Contisuyo encontrará la historia milenaria de Moquegua...",
    culturalSignificance: "Principal repositorio de la memoria prehispánica de la región sur.",
    practicalInfo: { bestTimeToVisit: "Mañana (9 AM - 1 PM)", entryFee: "10", difficulty: "Fácil" },
    // IMAGEN REAL: Exposición representativa Museo Contisuyo (cultura Huari/Tiahuanaco)[5]
    image: "https://www.peruenvideos.com/wp-content/uploads/2015/01/informacion-del-museo-contisuyo.jpg.webp",
  },
  {
    id: "poi_casona_diez_canseco",
    name: "Casona Diez Canseco",
    category: "Historia",
    coordinates: { lat: -17.1928, lng: -70.9341 },
    latitude: -17.1928,
    longitude: -70.9341,
    altitude: 1415,
    offlineDataSize: "3.9",
    isMustSee: false,
    shortDescription: "Magnífica casona republicana en el centro histórico.",
    fullDescription: "Hermosa casona del siglo XIX con patio central, balcones y detalles en sillar.",
    description: "Hermosa casona del siglo XIX con patio central...",
    audioGuideScript: "Esta casona es un excelente ejemplo de la arquitectura republicana...",
    culturalSignificance: "Parte del conjunto monumental del centro histórico.",
    practicalInfo: { bestTimeToVisit: "Mañana", entryFee: "0", difficulty: "Fácil" },
    // IMAGEN REAL: Casona típica Moqueguana (Centro histórico)
    image: "https://scontent.ftcq1-1.fna.fbcdn.net/v/t39.30808-6/498207191_4113592382255537_8809627224724140667_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_ohc=N9qDWmqsPiYQ7kNvwGCbCzq&_nc_oc=Adood4g6WzvYwNV0IPcT5yeS8B7DQ7Xdka3WpEfAUzEwLVzxHXCf0aywatxsnbwk3gM5pbGmwMi-u_h2ZkPxytF9&_nc_zt=23&_nc_ht=scontent.ftcq1-1.fna&_nc_gid=a7AssdvNlbU79jWbMyIGdg&_nc_ss=7b289&oh=00_Af7s5oNp3a5hFo9rp6kXP_ta2tOnMWavzvxQDiS4PrKGEw&oe=6A06F824",
  },
  {
    id: "poi_bodega_biondi",
    name: "Bodega Biondi - Ruta del Pisco",
    category: "Gastronomía",
    coordinates: { lat: -17.080, lng: -70.850 },
    latitude: -17.080,
    longitude: -70.850,
    altitude: 1800,
    offlineDataSize: "4.5",
    isMustSee: true,
    shortDescription: "Tradición pisquera familiar con más de 400 años de historia.",
    fullDescription: "Una de las bodegas más emblemáticas del valle. Produce pisco y vinos con técnicas ancestrales.",
    description: "Bodega emblemática del valle que produce pisco y vinos...",
    audioGuideScript: "Bienvenido a Bodega Biondi. Aquí la tradición pisquera de Moquegua...",
    culturalSignificance: "Parte de la denominación de origen del Pisco.",
    practicalInfo: { bestTimeToVisit: "Mañana (9-12 AM)", entryFee: "15", difficulty: "Fácil" },
    // IMAGEN REAL: Producción de Pisco Peruano
    image: "https://scontent.ftcq1-1.fna.fbcdn.net/v/t39.30808-6/468768457_10160859326636687_3036485520158335730_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=f798df&_nc_ohc=r9WeATk4ejAQ7kNvwFduCd4&_nc_oc=AdqCGmfVY22h0RQsHEpEcb-KW3LockNQMuGRufXzO3XBEfmBIryt-nfl5rxe3CURp1y_h7kfclFeh3uIwg38WsXP&_nc_zt=23&_nc_ht=scontent.ftcq1-1.fna&_nc_gid=PaoLiGOqHRI1NADJC1xYpw&_nc_ss=7b289&oh=00_Af7M87NziuwD4GpM8Pc7ItnKYPfoOUbz3e_At-U8TbfIOQ&oe=6A06F75A",
  },
  {
    id: "poi_mirador_chen_chen",
    name: "Mirador de Chen Chen",
    category: "Naturaleza",
    coordinates: { lat: -17.215, lng: -70.915 },
    latitude: -17.215,
    longitude: -70.915,
    altitude: 1550,
    offlineDataSize: "3.2",
    isMustSee: false,
    shortDescription: "Vistas panorámicas del valle y geoglifos.",
    fullDescription: "Punto elevado con vista espectacular de los geoglifos, el valle de Moquegua y la ciudad.",
    description: "Punto elevado con vista espectacular del valle de Moquegua...",
    audioGuideScript: "Desde este mirador puede apreciar la grandiosidad del valle...",
    culturalSignificance: "Paisaje cultural que integra arqueología y geografía.",
    practicalInfo: { bestTimeToVisit: "Atardecer", entryFee: "0", difficulty: "Fácil" },
    // IMAGEN REAL: Vista panorámica de Moquegua desde el Mirador
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEglGTvT9OGOVcaXLpoFjNzQejp-xVAm2nbbVOEUELmAgxsq4RsPlLONp2ifNS1hQBejJ734sVp53j-Kms42IFNK0Crl5cUW7cqy0AGMeKPn-8MK0sS_Ch65hquqJv1IRn1cp6inBgh2G1GU/s640/DSC_0811.JPG",
  },
  {
    id: "poi_molinos_torata",
    name: "Molinos de Piedra de Torata",
    category: "Historia",
    coordinates: { lat: -17.075, lng: -70.840 },
    latitude: -17.075,
    longitude: -70.840,
    altitude: 2210,
    offlineDataSize: "4.1",
    isMustSee: true,
    shortDescription: "Molinos coloniales aún en funcionamiento.",
    fullDescription: "Conjunto de molinos hidráulicos de piedra del siglo XVIII que aún muelen trigo.",
    description: "Conjunto de molinos hidráulicos de piedra del siglo XVIII...",
    audioGuideScript: "Estos molinos coloniales siguen funcionando como hace 300 años...",
    culturalSignificance: "Testimonio vivo de la tecnología virreinal en el sur andino.",
    practicalInfo: { bestTimeToVisit: "Mañana", entryFee: "5", difficulty: "Fácil" },
    // IMAGEN REAL: Antiguo molino colonial peruano
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Molino_de_piedra.jpg?width=1200",
  }
];