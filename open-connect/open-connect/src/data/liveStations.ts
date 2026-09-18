export type LiveStation = {
  id: string;
  name: string;
  frequency: string;
  tag: string;
  city: string;
  listeners: string;
  image: string;
  accent: string;
  uri?: string;
  progress?: number;
  currentTime?: string;
  duration?: string;
};

export const liveStations: LiveStation[] = [
  {
    id: '1',
    frequency: '91.1',
    name: 'RJ Beats FM',
    tag: 'Hip-Hop',
    city: 'Hyderabad',
    listeners: '14.2k',
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9430d89?w=700&h=500&fit=crop',
    accent: '#8B5CF6',
  },
  {
    id: '2',
    frequency: '92.9',
    name: 'RJ Vibes',
    tag: 'Pop',
    city: 'Hyderabad',
    listeners: '8.9k',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=500&fit=crop',
    accent: '#3B82F6',
  },
  {
    id: '3',
    frequency: '88.1',
    name: 'Smooth RJ',
    tag: 'Jazz',
    city: 'Secunderabad',
    listeners: '3.1k',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&h=500&fit=crop',
    accent: '#EC4899',
  },
  {
    id: '4',
    frequency: '95.5',
    name: 'RJ Rock Nation',
    tag: 'Rock',
    city: 'Cyberabad',
    listeners: '11.4k',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&h=500&fit=crop',
    accent: '#F97316',
  },
  {
    id: '5',
    frequency: '99.3',
    name: 'RJ Bass Drop',
    tag: 'EDM',
    city: 'Hyderabad',
    listeners: '18.1k',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&h=500&fit=crop',
    accent: '#EAB308',
  },
  {
    id: '6',
    frequency: '101.1',
    name: 'News Talk RJ',
    tag: 'News',
    city: 'Hyderabad',
    listeners: '22.3k',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&h=500&fit=crop',
    accent: '#14B8A6',
  },
  {
    id: '7',
    frequency: '103.5',
    name: 'Retro RJ',
    tag: 'Oldies',
    city: 'Secunderabad',
    listeners: '6.7k',
    image: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=700&h=500&fit=crop',
    accent: '#06B6D4',
  },
];