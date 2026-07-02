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
  organizer:   string;
};

export const events: Event[] = [
  {
    id: 1, tag: "MUSIC FESTIVAL", title: "New Single Urban Music",
    date: "27 August 2025", location: "Colombo", price: "Starting from LKR 4,500",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80&fit=crop", badge: null,
    lat: 6.9271, lon: 79.8612,
    venue: "Colombo Racecourse, Reid Avenue, Colombo 07",
    description: "Experience the best of urban music with top local and international artists coming together for an unforgettable night. Expect high energy performances, stunning light shows, and a crowd of passionate music lovers.",
    lineup: ["DJ Nova", "Randhir Witana", "Maya Perera", "The Beat Crew"],
    genres: ["electronic", "sinhala"], organizer: "Rhythm Nation LK",
  },
  {
    id: 2, tag: "MUSIC PARTY", title: "Urban Music Party",
    date: "27 August 2025", location: "Colombo", price: "Starting from LKR 4,500",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80&fit=crop", badge: "HOT",
    lat: 6.9271, lon: 79.8612,
    venue: "The Grand Ballroom, Hilton Colombo, Lotus Road",
    description: "The hottest music party of the season. Dance the night away to the best urban beats, live DJ sets, and surprise guest performances. Limited tickets available.",
    lineup: ["Ashanthi Dias", "DJ Nova", "Kasun Silva"],
    genres: ["electronic", "sinhala"], organizer: "Colombo Live Events",
  },
  {
    id: 3, tag: "MUSIC CONCERT", title: "Lovers Night 2027",
    date: "12 February 2027", location: "Brisbane", price: "Starting from LKR 4,500",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&fit=crop", badge: null,
    lat: -27.4698, lon: 153.0251,
    venue: "Brisbane Convention & Exhibition Centre, South Bank",
    description: "A romantic evening of soulful music and heartfelt performances. Celebrate love with the most enchanting concert of the year featuring award-winning vocalists and live orchestral accompaniment.",
    lineup: ["Maya Perera", "Nadia Fernando", "Hiruni De Silva"],
    genres: ["sinhala", "hindi"], organizer: "Stage One Entertainment",
  },
  {
    id: 4, tag: "DJ NIGHT", title: "Tharle DJ Night",
    date: "27 August 2026", location: "Colombo", price: "Starting from LKR 4,500",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80&fit=crop", badge: "COMING SOON",
    lat: 6.9271, lon: 79.8612,
    venue: "Skyline Rooftop, Monarch Imperial Hotel, Colombo 03",
    description: "Sri Lanka's biggest DJ night returns with world-class DJs, immersive visuals, and a rooftop atmosphere unlike anything you've experienced. Prepare for a night that goes until dawn.",
    lineup: ["DJ Nova", "The Beat Crew", "Kasun Silva"],
    genres: ["electronic"], organizer: "Bass Nation LK",
  },
  {
    id: 5, tag: "LIVE CONCERT", title: "Neon Beats Live",
    date: "05 March 2027", location: "Galle", price: "Starting from LKR 3,500",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80&fit=crop", badge: "NEW",
    lat: 6.0329, lon: 80.2168,
    venue: "Galle Face Green, Colombo — Galle Road",
    description: "An electrifying live concert set against the backdrop of Sri Lanka's stunning southern coastline. Neon Beats Live brings together indie artists and electronic acts for a truly unique outdoor experience.",
    lineup: ["Nadia Fernando", "Kasun Silva", "DJ Nova"],
    genres: ["electronic", "sinhala"], organizer: "Eventide Productions",
  },
  {
    id: 6, tag: "CULTURAL NIGHT", title: "Rhythm & Soul",
    date: "18 November 2026", location: "Kandy", price: "Starting from LKR 5,000",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80&fit=crop", badge: null,
    lat: 7.2906, lon: 80.6337,
    venue: "Kandy City Centre Open Grounds, Dalada Veediya, Kandy",
    description: "A celebration of Sri Lankan cultural heritage fused with contemporary music. Rhythm & Soul is an evening of traditional and modern performances that honour the island's rich musical legacy.",
    lineup: ["Hiruni De Silva", "Ashanthi Dias", "Randhir Witana"],
    genres: ["sinhala", "tamil"], organizer: "Rhythm Nation LK",
  },

  /* ── June 2026 ── */
  {
    id: 7, tag: "EDM NIGHT", title: "Bass Nation Colombo",
    date: "21 June 2026", location: "Colombo", price: "Starting from LKR 3,000",
    image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&q=80&fit=crop", badge: "HOT",
    lat: 6.9271, lon: 79.8612,
    venue: "Trillium Rooftop, Colombo 03",
    description: "Sri Lanka's premier EDM night returns with thundering bass drops and mesmerising light rigs. Bass Nation brings the international club experience to Colombo.",
    lineup: ["DJ Nova", "The Beat Crew"],
    genres: ["electronic"], organizer: "Bass Nation LK",
  },
  {
    id: 8, tag: "ACOUSTIC SET", title: "Sunset Sessions",
    date: "21 June 2026", location: "Galle", price: "Starting from LKR 2,000",
    image: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=800&q=80&fit=crop", badge: null,
    lat: 6.0329, lon: 80.2168,
    venue: "Galle Fort, Church Street, Galle",
    description: "An intimate acoustic evening inside the historic Galle Fort. Featuring soulful singer-songwriters performing as the sun dips below the Indian Ocean.",
    lineup: ["Maya Perera", "Hiruni De Silva"],
    genres: ["sinhala", "acoustic"], organizer: "Sunset Events",
  },
  {
    id: 9, tag: "LIVE BAND", title: "Rock the Fort",
    date: "21 June 2026", location: "Galle", price: "Starting from LKR 3,500",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80&fit=crop", badge: "NEW",
    lat: 6.0329, lon: 80.2168,
    venue: "Galle Fort Dutch Reformed Church Grounds",
    description: "Live rock and indie performances echoing off centuries-old fort walls. An unforgettable night of raw energy in one of Sri Lanka's most iconic heritage venues.",
    lineup: ["Kasun Silva", "The Beat Crew", "Randhir Witana"],
    genres: ["electronic", "sinhala"], organizer: "Eventide Productions",
  },
  {
    id: 10, tag: "MUSIC FESTIVAL", title: "Island Vibes Fest",
    date: "28 June 2026", location: "Colombo", price: "Starting from LKR 5,500",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80&fit=crop", badge: "HOT",
    lat: 6.9271, lon: 79.8612,
    venue: "Viharamahadevi Open Air Theatre, Colombo 07",
    description: "A full-day outdoor music festival celebrating the diversity of Sri Lankan music — from baila to hip-hop, electronic to classical fusion, all under the open Colombo sky.",
    lineup: ["DJ Nova", "Ashanthi Dias", "Nadia Fernando", "The Beat Crew"],
    genres: ["electronic", "sinhala", "tamil"], organizer: "Colombo Live Events",
  },

  /* ── July 2026 ── */
  {
    id: 11, tag: "POP CONCERT", title: "Neon Pop Night",
    date: "4 July 2026", location: "Colombo", price: "Starting from LKR 2,500",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80&fit=crop", badge: null,
    lat: 6.9271, lon: 79.8612,
    venue: "Nelum Pokuna Theatre, Colombo 07",
    description: "A spectacular pop concert featuring Sri Lanka's hottest chart-topping artists. Expect confetti, high-energy dance numbers, and massive sing-along moments.",
    lineup: ["Ashanthi Dias", "Maya Perera"],
    genres: ["sinhala"], organizer: "Stage One Entertainment",
  },
  {
    id: 12, tag: "DJ NIGHT", title: "Frequency Zero",
    date: "4 July 2026", location: "Colombo", price: "Starting from LKR 3,000",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80&fit=crop", badge: "NEW",
    lat: 6.9271, lon: 79.8612,
    venue: "Sky Bar, Cinnamon Red, Colombo 02",
    description: "Three floors, six DJs, one unforgettable night. Frequency Zero is the underground electronic music event that has taken Colombo's nightlife scene by storm.",
    lineup: ["DJ Nova", "Kasun Silva"],
    genres: ["electronic"], organizer: "Bass Nation LK",
  },
  {
    id: 13, tag: "CULTURAL SHOW", title: "Heritage Live",
    date: "19 July 2026", location: "Kandy", price: "Starting from LKR 4,000",
    image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80&fit=crop", badge: null,
    lat: 7.2906, lon: 80.6337,
    venue: "Kandy Lake Club, Sangaraja Mawatha, Kandy",
    description: "A grand showcase of Sri Lankan cultural performances — Kandyan dance, traditional drumming, and contemporary fusion in the heart of the hill capital.",
    lineup: ["Hiruni De Silva", "Randhir Witana", "Ashanthi Dias"],
    genres: ["sinhala", "tamil"], organizer: "Rhythm Nation LK",
  },
  {
    id: 14, tag: "MUSIC PARTY", title: "Midnight Carnival",
    date: "19 July 2026", location: "Colombo", price: "Starting from LKR 3,500",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&fit=crop", badge: "HOT",
    lat: 6.9271, lon: 79.8612,
    venue: "Colombo City Hotel Rooftop, Colombo 01",
    description: "A carnival-themed midnight party with live music, street food stalls, dazzling costumes, and non-stop dancing until sunrise. Colombo's most talked-about summer party.",
    lineup: ["Nadia Fernando", "The Beat Crew", "DJ Nova"],
    genres: ["electronic", "sinhala"], organizer: "Colombo Live Events",
  },
  {
    id: 15, tag: "LIVE CONCERT", title: "Soul Wave",
    date: "31 July 2026", location: "Negombo", price: "Starting from LKR 2,800",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80&fit=crop", badge: null,
    lat: 7.2092, lon: 79.8382,
    venue: "Browns Beach Hotel, Ethukala, Negombo",
    description: "A beachside soul and R&B concert as the final curtain on July. Feel the ocean breeze as world-class vocalists deliver an evening of smooth, heartfelt performances.",
    lineup: ["Nadia Fernando", "Maya Perera", "Hiruni De Silva"],
    genres: ["sinhala"], organizer: "Sunset Events",
  },
];

export const getEventById = (id: number) => events.find(e => e.id === id) ?? null;
