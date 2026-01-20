// Конфигурация созвездий спутников
export const constellations = [
  {
    name: "GPS",
    urls: [
      "./data/gps-ops.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/gps-ops.txt"
    ],
    color: "#00E5FF"
  },
  {
    name: "GLONASS",
    urls: [
      "./data/glo-ops.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=glo-ops&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/glo-ops.txt"
    ],
    color: "#FFB300"
  },
  {
    name: "Galileo",
    urls: [
      "./data/galileo.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=galileo&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/galileo.txt"
    ],
    color: "#8BC34A"
  },
  {
    name: "BeiDou",
    urls: [
      "./data/beidou.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=beidou&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/beidou.txt"
    ],
    color: "#FF7043"
  },
  {
    name: "Starlink",
    urls: [
      "./data/starlink.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/starlink.txt"
    ],
    color: "#B39DDB"
  },
  {
    name: "OneWeb",
    urls: [
      "./data/oneweb.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=oneweb&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/oneweb.txt"
    ],
    color: "#4FC3F7"
  },
  {
    name: "Iridium",
    urls: [
      "./data/iridium.tle",
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium&FORMAT=tle",
      "https://celestrak.org/NORAD/elements/iridium.txt"
    ],
    color: "#FFD54F"
  },
  {
  name: "MyFleet",
  urls: [
    "./data/myfleet.tle",                            // local fallback
    "https://example.com/path/to/myfleet.tle"        // optional remote source
  ],
  color: "#FF6E40"                                   // pick any hex
}
  
];

// Константы для отображения следов
export const TRAIL_LIVE_MS = 60000;
export const TRAIL_FADE_MS = 75000;
export const TRAIL_TOTAL_MS = TRAIL_LIVE_MS + TRAIL_FADE_MS;
