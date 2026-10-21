export interface RJSStation {
  id: string;
  name: string;
  frequency: string;
  tagline: string;
  thumbnail: string;
  streamUrl: string;
  listeners: number;
  currentShow: string;
  rjName: string;
  genre: string;
  accentColor: string;
  gradientColors: [string, string, string];
}

export const RJS_LIVE_STATIONS: RJSStation[] = [
  {
    id: '1',
    name: 'Radio City 91.1',
    frequency: '91.1 FM',
    tagline: "India's No.1 Music Station",
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    streamUrl: 'https://stream.radiocity.in/radiocity',
    listeners: 124300,
    currentShow: 'Morning Blast',
    rjName: 'RJ Malishka',
    genre: 'Bollywood Hits',
    accentColor: '#FF3B5C',
    gradientColors: ['#1a0010', '#3d0020', '#000000'],
  },
  {
    id: '2',
    name: 'Red FM 93.5',
    frequency: '93.5 FM',
    tagline: 'Bajate Raho!',
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
    streamUrl: 'https://stream.redfm.in/redfm',
    listeners: 98750,
    currentShow: 'The RJ Show',
    rjName: 'RJ Raunac',
    genre: 'Retro & Hits',
    accentColor: '#FF2D2D',
    gradientColors: ['#1a0000', '#3d0000', '#000000'],
  },
  {
    id: '3',
    name: 'Mirchi 98.3',
    frequency: '98.3 FM',
    tagline: "It's Hot!",
    thumbnail: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80',
    streamUrl: 'https://stream.mirchi.in/mirchi983',
    listeners: 156800,
    currentShow: 'Mirchi Murga',
    rjName: 'RJ Naved',
    genre: 'Desi Pop',
    accentColor: '#FF6B00',
    gradientColors: ['#1a0800', '#3d1500', '#000000'],
  },
  {
    id: '4',
    name: 'Big FM 92.7',
    frequency: '92.7 FM',
    tagline: 'Suno Sunaao, Life Banao',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    streamUrl: 'https://stream.bigfm.in/bigfm',
    listeners: 87200,
    currentShow: 'The Big Drive',
    rjName: 'RJ Mania',
    genre: 'Punjabi & Hindi',
    accentColor: '#00C6FF',
    gradientColors: ['#00061a', '#001033', '#000000'],
  },
  {
    id: '5',
    name: 'Fever 104',
    frequency: '104 FM',
    tagline: 'Feel the Fever',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    streamUrl: 'https://stream.fever104.in/fever',
    listeners: 72400,
    currentShow: 'Late Night Drive',
    rjName: 'RJ Ginnie',
    genre: 'EDM & Party',
    accentColor: '#A855F7',
    gradientColors: ['#0d0017', '#1e0033', '#000000'],
  },
  {
    id: '6',
    name: 'AIR Rainbow',
    frequency: '100.1 FM',
    tagline: 'Colours of Life',
    thumbnail: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=800&q=80',
    streamUrl: 'https://stream.air.gov.in/rainbow',
    listeners: 45100,
    currentShow: 'Evening Raga',
    rjName: 'RJ Priya',
    genre: 'Classical & Folk',
    accentColor: '#34D399',
    gradientColors: ['#001a0d', '#003320', '#000000'],
  },
];
