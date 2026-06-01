export type Artist = {
  id:    number;
  name:  string;
  role:  string;
  image: string;
  bio:   string;
};

export const artists: Artist[] = [
  { id: 1, name: "DJ Nova",         role: "EDM / HOUSE MUSIC",          image: "/artists/1.png", bio: "Known for electrifying performances and festival energy across Asia." },
  { id: 2, name: "Randhir Witana",  role: "SRI LANKAN MUSICAL ARTIST",  image: "/artists/2.png", bio: "Award-winning vocalist with soulful live performances." },
  { id: 3, name: "Maya Perera",     role: "POP & ACOUSTIC ARTIST",      image: "/artists/3.png", bio: "Enchanting voice and heartfelt songwriting loved by millions." },
  { id: 4, name: "Ashanthi Dias",   role: "SRI LANKAN MUSICAL ARTIST",  image: "/artists/4.png", bio: "An energetic fusion artist bringing modern and classic hits together." },
  { id: 5, name: "Kasun Silva",     role: "ROCK & INDIE ARTIST",        image: "/artists/1.png", bio: "Raw guitar energy meets indie soul in every unforgettable set." },
  { id: 6, name: "Nadia Fernando",  role: "R&B / SOUL ARTIST",          image: "/artists/2.png", bio: "Smooth R&B grooves and powerful vocals that move any crowd." },
  { id: 7, name: "The Beat Crew",   role: "LIVE BAND",                  image: "/artists/3.png", bio: "A high-energy live band delivering non-stop rhythm and soul." },
  { id: 8, name: "Hiruni De Silva", role: "CLASSICAL FUSION ARTIST",    image: "/artists/4.png", bio: "Bridging classical heritage with contemporary sounds beautifully." },
];

export const getArtistsByNames = (names: string[]): Artist[] =>
  names.map(name => artists.find(a => a.name === name)).filter(Boolean) as Artist[];

export const getArtistById = (id: number) => artists.find(a => a.id === id) ?? null;
