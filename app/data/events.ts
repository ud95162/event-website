export type Event = {
  id:          number;
  tag:         string;
  title:       string;
  date:        string;
  location:    string;
  price:       string;
  image:       string;
  badge:       string | null;
  lat:         number;
  lon:         number;
  description: string;
  lineup:      string[];
  venue:       string;
  genres:      string[];   // e.g. ["electronic", "sinhala"]
};

export const events: Event[] = [
  {
    id: 1, tag: "MUSIC FESTIVAL", title: "New Single Urban Music",
    date: "27 August 2025", location: "Colombo", price: "Starting from LKR 4,500",
    image: "/events/event1.png", badge: null,
    lat: 6.9271, lon: 79.8612,
    venue: "Colombo Racecourse, Reid Avenue, Colombo 07",
    description: "Experience the best of urban music with top local and international artists coming together for an unforgettable night. Expect high energy performances, stunning light shows, and a crowd of passionate music lovers.",
    lineup: ["DJ Nova", "Randhir Witana", "Maya Perera", "The Beat Crew"],
    genres: ["electronic", "sinhala"],
  },
  {
    id: 2, tag: "MUSIC PARTY", title: "Urban Music Party",
    date: "27 August 2025", location: "Colombo", price: "Starting from LKR 4,500",
    image: "/events/event2.png", badge: "HOT",
    lat: 6.9271, lon: 79.8612,
    venue: "The Grand Ballroom, Hilton Colombo, Lotus Road",
    description: "The hottest music party of the season. Dance the night away to the best urban beats, live DJ sets, and surprise guest performances. Limited tickets available.",
    lineup: ["Ashanthi Dias", "DJ Nova", "Kasun Silva"],
    genres: ["electronic", "sinhala"],
  },
  {
    id: 3, tag: "MUSIC CONCERT", title: "Lovers Night 2027",
    date: "12 February 2027", location: "Brisbane", price: "Starting from LKR 4,500",
    image: "/events/event3.png", badge: null,
    lat: -27.4698, lon: 153.0251,
    venue: "Brisbane Convention & Exhibition Centre, South Bank",
    description: "A romantic evening of soulful music and heartfelt performances. Celebrate love with the most enchanting concert of the year featuring award-winning vocalists and live orchestral accompaniment.",
    lineup: ["Maya Perera", "Nadia Fernando", "Hiruni De Silva"],
    genres: ["sinhala", "hindi"],
  },
  {
    id: 4, tag: "DJ NIGHT", title: "Tharle DJ Night",
    date: "27 August 2026", location: "Colombo", price: "Starting from LKR 4,500",
    image: "/events/event4.png", badge: "COMING SOON",
    lat: 6.9271, lon: 79.8612,
    venue: "Skyline Rooftop, Monarch Imperial Hotel, Colombo 03",
    description: "Sri Lanka's biggest DJ night returns with world-class DJs, immersive visuals, and a rooftop atmosphere unlike anything you've experienced. Prepare for a night that goes until dawn.",
    lineup: ["DJ Nova", "The Beat Crew", "Kasun Silva"],
    genres: ["electronic"],
  },
  {
    id: 5, tag: "LIVE CONCERT", title: "Neon Beats Live",
    date: "05 March 2027", location: "Galle", price: "Starting from LKR 3,500",
    image: "/events/event1.png", badge: "NEW",
    lat: 6.0329, lon: 80.2168,
    venue: "Galle Face Green, Colombo — Galle Road",
    description: "An electrifying live concert set against the backdrop of Sri Lanka's stunning southern coastline. Neon Beats Live brings together indie artists and electronic acts for a truly unique outdoor experience.",
    lineup: ["Nadia Fernando", "Kasun Silva", "DJ Nova"],
    genres: ["electronic", "sinhala"],
  },
  {
    id: 6, tag: "CULTURAL NIGHT", title: "Rhythm & Soul",
    date: "18 November 2026", location: "Kandy", price: "Starting from LKR 5,000",
    image: "/events/event2.png", badge: null,
    lat: 7.2906, lon: 80.6337,
    venue: "Kandy City Centre Open Grounds, Dalada Veediya, Kandy",
    description: "A celebration of Sri Lankan cultural heritage fused with contemporary music. Rhythm & Soul is an evening of traditional and modern performances that honour the island's rich musical legacy.",
    lineup: ["Hiruni De Silva", "Ashanthi Dias", "Randhir Witana"],
    genres: ["sinhala", "tamil"],
  },
];

export const getEventById = (id: number) => events.find(e => e.id === id) ?? null;
