import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { usePlayer } from '../../src/context/PlayerContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { styles } from '../../src/styles/player.styles';

// Constants
const DEFAULT_DURATION_SECONDS = 1800; // 30 minutes in seconds
const DEFAULT_DURATION_MINUTES = 30; // Default 30 minutes

const generateWaveform = () => {
  const bars = [];
  for (let i = 0; i < 35; i++) bars.push(Math.floor(Math.random() * 24) + 8);
  return bars;
};
const waveform = generateWaveform();

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  plays: string;
  date: string;
  image: string;
}

interface MoreLike {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

interface Podcast {
  title: string;
  creator: string;
  studio: string;
  image: string;
  duration: string;
  durationSecs: number;
  rating: string;
  ratingCount: string;
  category: string;
  about: string;
  episodes: Episode[];
  moreLike: MoreLike[];
}

// ── Episode & podcast data ────────────────────────────────────────────────────
const episodeData: Record<string, Podcast> = {
  us1: {
    title: 'The Daily', creator: 'Michael Barbaro', studio: 'The New York Times',
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=400&fit=crop',
    duration: '42:29', durationSecs: 2549, rating: '4.6', ratingCount: '2.1K', category: 'News',
    about: `The Daily is the flagship podcast of The New York Times, hosted by Michael Barbaro. Every weekday morning, The Daily brings you the biggest stories of our time, told by the best journalists in the world.

From politics and business to culture and science, each episode runs about 20 minutes and gives listeners the full context behind the news. The podcast launched in 2017 and quickly became one of the most downloaded podcasts in the world, winning multiple Peabody Awards along the way.

Whether you're commuting, working out, or just starting your day, The Daily makes the news feel personal, urgent, and human. It consistently ranks as the #1 news podcast in the United States.`,
    episodes: [
      { id: 'ep_us1_1', title: '#112 - The Future of American Democracy', description: 'An in-depth look at what the next election cycle means for the country', duration: '38 min', plays: '14M+', date: '14 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us1_2', title: '#111 - Climate Crisis: The Point of No Return', description: 'Scientists warn the window for action is closing faster than expected', duration: '32 min', plays: '11M+', date: '13 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us1_3', title: '#110 - Inside the Tech Layoffs', description: 'Why Silicon Valley\'s biggest companies are cutting thousands of jobs', duration: '29 min', plays: '9M+', date: '12 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ep_us1_4', title: '#109 - The Housing Affordability Crisis', description: 'How millions of Americans are being priced out of homeownership', duration: '41 min', plays: '8M+', date: '11 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us1_5', title: '#108 - Breaking News Deep Dive', description: 'A thorough look at today\'s most important developing story', duration: '38 min', plays: '12M+', date: '10 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us1_6', title: '#107 - Political Landscape Shift', description: 'How recent events are reshaping the balance of power in Washington', duration: '44 min', plays: '8M+', date: '8 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ep_us1_7', title: '#106 - The Border Debate Explained', description: 'Both sides of the immigration argument in plain language', duration: '35 min', plays: '7M+', date: '7 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us1_8', title: '#105 - Healthcare After the ACA', description: 'What millions of Americans stand to lose or gain from policy changes', duration: '27 min', plays: '6M+', date: '6 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us1_9', title: '#104 - Wall Street vs Main Street', description: 'The growing disconnect between markets and everyday financial reality', duration: '33 min', plays: '5M+', date: '5 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ep_us1_10', title: '#103 - Education in Crisis', description: 'America\'s schools are struggling — here\'s why and what can be done', duration: '40 min', plays: '5M+', date: '4 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us1_11', title: '#102 - The War on Drugs Revisited', description: 'Fifty years later, has America\'s drug policy done more harm than good?', duration: '36 min', plays: '4M+', date: '3 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us1_12', title: '#101 - Special 100th Episode Retrospective', description: 'Looking back at the stories that defined a turbulent year in America', duration: '55 min', plays: '18M+', date: '1 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
    ],
    moreLike: [
      { id: 'ml_us1_1', title: 'Up First', category: 'News • Politics', description: "NPR's morning news briefing — 3 big stories in 10 minutes", image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ml_us1_2', title: 'The Ezra Klein Show', category: 'News • Opinion', description: 'Deep-dive conversations on the ideas shaping our world', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ml_us1_3', title: 'Axios Today', category: 'News', description: 'Smart, efficient news briefing for busy people', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ml_us1_4', title: 'The NPR Politics Podcast', category: 'News • Politics', description: 'Coverage and analysis of politics in America and around the world', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
    ],
  },

  us2: {
    title: 'Up First', creator: 'NPR', studio: 'NPR',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=400&fit=crop',
    duration: '15:00', durationSecs: 900, rating: '4.4', ratingCount: '1.8K', category: 'News',
    about: "Up First is NPR's daily news podcast, delivering the biggest stories of the morning in about 10 minutes. Three stories. Ten minutes. Delivered fresh every weekday morning.\n\nHosted by a rotating cast of NPR's most trusted journalists, Up First cuts through the noise to give you the context and facts you need before the day begins. It's the podcast equivalent of a trusted friend who reads every newspaper so you don't have to.\n\nSince its launch in 2017, Up First has become an essential part of millions of morning routines. The show is known for its calm, authoritative tone and its ability to make complex issues immediately understandable. It consistently ranks among the top 5 most-downloaded podcasts in America.",
    episodes: [
      { id: 'ep_us2_1', title: 'Morning Briefing — Monday March 14', description: 'Everything you need to start your week right', duration: '12 min', plays: '5M+', date: '14 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us2_2', title: 'Weekend Edition Highlights', description: 'The most important stories from Saturday and Sunday', duration: '15 min', plays: '4M+', date: '13 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us2_3', title: 'Friday Roundup — Top 3 Stories', description: 'Closing out the week with the stories that mattered most', duration: '11 min', plays: '4M+', date: '12 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ep_us2_4', title: 'Congress Debates New Budget Bill', description: 'What the proposed changes mean for everyday Americans', duration: '13 min', plays: '3M+', date: '11 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us2_5', title: 'Global Markets React to Fed Decision', description: 'Interest rate news sent ripples across world economies', duration: '10 min', plays: '3M+', date: '10 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us2_6', title: 'Supreme Court Takes Up Major Case', description: 'The landmark ruling that could reshape American law', duration: '14 min', plays: '6M+', date: '9 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ep_us2_7', title: 'Ukraine War: Year Three Update', description: 'Where things stand and what the next phase might look like', duration: '12 min', plays: '5M+', date: '8 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ep_us2_8', title: 'AI Regulation: Washington Weighs In', description: 'New legislation aims to put guardrails on artificial intelligence', duration: '11 min', plays: '4M+', date: '7 Mar', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ep_us2_9', title: 'Inflation Eases — What It Means for You', description: 'Consumer prices drop for the second month in a row', duration: '10 min', plays: '3M+', date: '6 Mar', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ep_us2_10', title: 'Election 2026: Early Projections', description: 'Analysts weigh in on which seats are most at risk', duration: '13 min', plays: '4M+', date: '5 Mar', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
    ],
    moreLike: [
      { id: 'ml_us2_1', title: 'The Daily', category: 'News', description: 'The New York Times flagship news podcast', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
      { id: 'ml_us2_2', title: 'Axios Today', category: 'News', description: 'Smart, efficient news briefing for busy people', image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=200&h=200&fit=crop' },
      { id: 'ml_us2_3', title: 'Consider This from NPR', category: 'News • Analysis', description: 'Deeper context on one important story each day', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { id: 'ml_us2_4', title: 'Global News Podcast', category: 'News • World', description: 'BBC World Service news briefings twice a day', image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200&h=200&fit=crop' },
    ],
  },

  us4: {
    title: 'Serial', creator: 'Sarah Koenig', studio: 'This American Life',
    image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=400&h=400&fit=crop',
    duration: '52:18', durationSecs: 3138, rating: '4.8', ratingCount: '5.2K', category: 'True Crime',
    about: "Serial is a podcast from the creators of This American Life, hosted by Sarah Koenig. Serial unfolds one nonfiction story — a true story — over the course of a whole season, with a new chapter each week.\n\nSince its debut in 2014, Serial has become one of the most influential podcasts ever made. Its first season — investigating the 1999 murder of Hae Min Lee and the conviction of her ex-boyfriend Adnan Syed — became a cultural phenomenon, downloaded over 340 million times and credited with sparking a true-crime podcast revolution.\n\nEach season examines a different case through deep, meticulous reporting. Sarah Koenig's distinctive narrative style keeps listeners hooked episode after episode, questioning assumptions and re-examining evidence. Serial won a Peabody Award — the first podcast ever to do so.\n\nThe show is a masterclass in narrative journalism and remains the gold standard for long-form investigative audio storytelling.",
    episodes: [
      { id: 'ep_us4_1', title: 'S4 E1 — The Night Everything Changed', description: 'A quiet town is shattered by a crime nobody saw coming', duration: '52 min', plays: '22M+', date: '1 Mar', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop' },
      { id: 'ep_us4_2', title: 'S4 E2 — The Suspect Nobody Expected', description: 'Investigators zero in on a person of interest — but is the evidence solid?', duration: '48 min', plays: '18M+', date: '8 Mar', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop' },
      { id: 'ep_us4_3', title: 'S4 E3 — What the Witnesses Saw', description: 'Conflicting accounts from three eyewitnesses change everything', duration: '55 min', plays: '15M+', date: '15 Mar', image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop' },
      { id: 'ep_us4_4', title: 'S4 E4 — The Evidence Room', description: 'Forensic details that prosecutors highlighted — and what they missed', duration: '44 min', plays: '13M+', date: '22 Mar', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop' },
      { id: 'ep_us4_5', title: 'S4 E5 — A Confession That Raises Questions', description: 'Someone comes forward — but are they telling the whole truth?', duration: '50 min', plays: '12M+', date: '29 Mar', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop' },
      { id: 'ep_us4_6', title: 'S4 E6 — The Defense\'s Case', description: 'Sarah examines the arguments the defense made — and what jury heard', duration: '47 min', plays: '11M+', date: '5 Apr', image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop' },
      { id: 'ep_us4_7', title: 'S4 E7 — New Evidence, Old Case', description: 'A key piece of evidence resurfaces that could change the verdict', duration: '53 min', plays: '10M+', date: '12 Apr', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop' },
      { id: 'ep_us4_8', title: 'S4 E8 — The Other Side of the Story', description: 'Hearing from the people who believe in the convicted person\'s innocence', duration: '46 min', plays: '9M+', date: '19 Apr', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop' },
      { id: 'ep_us4_9', title: 'S4 E9 — The System on Trial', description: 'How the justice system handled — and possibly mishandled — this case', duration: '58 min', plays: '8M+', date: '26 Apr', image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop' },
      { id: 'ep_us4_10', title: 'S4 E10 — Where Things Stand', description: 'Sarah wraps the season with everything we now know — and don\'t', duration: '62 min', plays: '20M+', date: '3 May', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop' },
    ],
    moreLike: [
      { id: 'ml_us4_1', title: 'Crime Junkie', category: 'True Crime', description: 'A weekly true crime podcast told in a straightforward style', image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop' },
      { id: 'ml_us4_2', title: 'My Favorite Murder', category: 'True Crime • Comedy', description: 'Karen Kilgariff and Georgia Hardstark discuss true crime with humor', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200&h=200&fit=crop' },
      { id: 'ml_us4_3', title: 'Casefile', category: 'True Crime', description: 'Meticulously researched true crime stories told anonymously', image: 'https://images.unsplash.com/photo-1589828511416-35c4b5e7b5e0?w=200&h=200&fit=crop' },
      { id: 'ml_us4_4', title: 'Criminal', category: 'True Crime • Stories', description: 'Stories of people who\'ve done wrong and been wronged', image: 'https://images.unsplash.com/photo-1589396575653-c09c794ff104?w=200&h=200&fit=crop' },
    ],
  },

  us12: {
    title: 'Lex Fridman Podcast', creator: 'Lex Fridman', studio: 'MIT',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    duration: '3:24:15', durationSecs: 12255, rating: '4.7', ratingCount: '3.4K', category: 'Technology',
    about: "The Lex Fridman Podcast features long-form conversations about the nature of intelligence, consciousness, love, and power — and how technology intersects with all of it.\n\nLex Fridman is a research scientist at MIT, working on deep learning, autonomous vehicles, and human-robot interaction. His podcast has become one of the most respected intellectual conversations on the internet, attracting guests from Elon Musk and Jeff Bezos to Noam Chomsky and Niels Ferguson.\n\nWhat makes the Lex Fridman Podcast distinctive is its patience. Conversations routinely run 3–5 hours, allowing ideas to breathe and develop in ways that shorter formats never permit. Lex's calm, curious, and deeply prepared interview style draws out insights that guests rarely share elsewhere.\n\nTopics span AI, physics, mathematics, philosophy, history, politics, and everything in between. If you want to understand where humanity is heading and what it means to be alive in this moment, this podcast is essential listening.",
    episodes: [
      { id: 'ep_us12_1', title: '#420 - Sam Altman: The Future of OpenAI', description: 'What GPT-5 means for the world and where AI goes from here', duration: '3:45 hr', plays: '28M+', date: '12 Mar', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
      { id: 'ep_us12_2', title: '#419 - Elon Musk: Mars, AI, and Humanity', description: 'The most wide-ranging conversation Lex has had with the world\'s richest man', duration: '4:10 hr', plays: '35M+', date: '5 Mar', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop' },
      { id: 'ep_us12_3', title: '#418 - Yuval Noah Harari: The AI Revolution', description: 'The Sapiens author on what artificial intelligence means for civilization', duration: '2:55 hr', plays: '20M+', date: '26 Feb', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop' },
      { id: 'ep_us12_4', title: '#417 - Roger Penrose: Consciousness & Physics', description: 'Nobel laureate on the mind, quantum mechanics, and the nature of reality', duration: '3:20 hr', plays: '15M+', date: '19 Feb', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
      { id: 'ep_us12_5', title: '#416 - Mark Zuckerberg: Meta\'s AI Bet', description: 'Inside Meta\'s strategy to build artificial general intelligence', duration: '2:40 hr', plays: '22M+', date: '12 Feb', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop' },
      { id: 'ep_us12_6', title: '#415 - Andrej Karpathy: Deep Learning', description: 'Tesla\'s former AI director on neural networks and the path to AGI', duration: '3:05 hr', plays: '18M+', date: '5 Feb', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop' },
      { id: 'ep_us12_7', title: '#414 - Joe Rogan: Life, Comedy & Truth', description: 'Two podcast legends in an unfiltered conversation', duration: '3:50 hr', plays: '40M+', date: '29 Jan', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
      { id: 'ep_us12_8', title: '#413 - Naval Ravikant: Wealth & Happiness', description: 'The philosopher-investor on building wealth without sacrificing freedom', duration: '2:30 hr', plays: '16M+', date: '22 Jan', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop' },
      { id: 'ep_us12_9', title: '#412 - Vladimir Putin Interview', description: 'One of the most controversial and discussed interviews of the year', duration: '2:10 hr', plays: '50M+', date: '15 Jan', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop' },
      { id: 'ep_us12_10', title: '#411 - Demis Hassabis: Google DeepMind', description: 'The AlphaFold creator on solving biology with AI', duration: '3:15 hr', plays: '14M+', date: '8 Jan', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
      { id: 'ep_us12_11', title: '#410 - Jeff Bezos: Amazon, Space & Life', description: 'The Amazon founder reflects on building the everything store and Blue Origin', duration: '2:50 hr', plays: '25M+', date: '1 Jan', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop' },
    ],
    moreLike: [
      { id: 'ml_us12_1', title: 'The Tim Ferriss Show', category: 'Technology • Business', description: 'World-class performers share tactics, routines, and habits', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
      { id: 'ml_us12_2', title: 'Waveform with MKBHD', category: 'Technology', description: 'The latest in consumer tech with Marques Brownlee', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&h=200&fit=crop' },
      { id: 'ml_us12_3', title: 'How I Built This', category: 'Technology • Business', description: 'Guy Raz digs into the stories behind the world\'s best-known companies', image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop' },
      { id: 'ml_us12_4', title: 'The Knowledge Project', category: 'Technology • Mental Models', description: 'Shane Parrish on better thinking and decision making', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=200&h=200&fit=crop' },
    ],
  },

  us15: {
    title: 'Huberman Lab', creator: 'Dr. Andrew Huberman', studio: 'Sciocomm Media',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop',
    duration: '1:52:40', durationSecs: 6760, rating: '4.9', ratingCount: '6.1K', category: 'Health & Wellness',
    about: "Huberman Lab is a science podcast hosted by Dr. Andrew Huberman, a Professor of Neurobiology and Ophthalmology at Stanford School of Medicine. The show discusses neuroscience and provides science-based tools for everyday life.\n\nDr. Huberman is one of the most trusted voices in science communication today. His ability to take complex neuroscience research and translate it into actionable protocols — on sleep, exercise, nutrition, stress, focus, and more — has made Huberman Lab one of the fastest-growing podcasts in history.\n\nEach episode is typically 2–3 hours long and covers a single topic in extraordinary depth. Episodes on sleep optimization, dopamine regulation, and morning sunlight exposure have each been downloaded tens of millions of times and genuinely changed the daily routines of listeners worldwide.\n\nThe podcast is entirely free and evidence-based. Dr. Huberman cites peer-reviewed research and regularly brings on world-class scientists as guests to deep dive on specific topics. If you want to optimize your biology, this is the most valuable free resource on the internet.",
    episodes: [
      { id: 'ep_us15_1', title: 'How to Optimize Your Sleep', description: 'Science-backed protocols for falling asleep faster and sleeping deeper', duration: '1:55 hr', plays: '30M+', date: '10 Mar', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
      { id: 'ep_us15_2', title: 'The Science of Dopamine', description: 'How to harness your brain\'s reward system for motivation and focus', duration: '2:10 hr', plays: '25M+', date: '3 Mar', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ep_us15_3', title: 'Cold Exposure & Mental Health', description: 'Why cold water immersion is one of the most powerful tools for your brain', duration: '1:40 hr', plays: '18M+', date: '24 Feb', image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300&h=300&fit=crop' },
      { id: 'ep_us15_4', title: 'How to Build Muscle Effectively', description: 'The science of hypertrophy, recovery, and progressive overload', duration: '2:05 hr', plays: '20M+', date: '17 Feb', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ep_us15_5', title: 'Controlling Stress and Anxiety', description: 'Physiological tools to calm your nervous system in real time', duration: '1:50 hr', plays: '22M+', date: '10 Feb', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
      { id: 'ep_us15_6', title: 'The Science of Focus and Deep Work', description: 'How to train your brain to concentrate for hours without distraction', duration: '2:15 hr', plays: '19M+', date: '3 Feb', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ep_us15_7', title: 'Gut-Brain Axis: Your Second Brain', description: 'How the gut microbiome controls mood, cognition, and disease resistance', duration: '1:45 hr', plays: '16M+', date: '27 Jan', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
      { id: 'ep_us15_8', title: 'Dr. Peter Attia on Longevity', description: 'The leading longevity doctor shares his protocol for living to 100', duration: '3:00 hr', plays: '24M+', date: '20 Jan', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ep_us15_9', title: 'Optimizing Testosterone Naturally', description: 'Evidence-based ways to raise testosterone without medication', duration: '1:55 hr', plays: '28M+', date: '13 Jan', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
      { id: 'ep_us15_10', title: 'The Science of Stretching & Flexibility', description: 'How to actually improve flexibility using neuroscience-backed protocols', duration: '1:30 hr', plays: '14M+', date: '6 Jan', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ep_us15_11', title: 'Alcohol & the Brain: The Real Science', description: 'What alcohol actually does to your neurons, sleep, and long-term health', duration: '2:00 hr', plays: '32M+', date: '30 Dec', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
      { id: 'ep_us15_12', title: 'Master Your Morning Routine', description: 'The first 2 hours of your day determine everything — here\'s how to win them', duration: '1:25 hr', plays: '38M+', date: '23 Dec', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
    ],
    moreLike: [
      { id: 'ml_us15_1', title: 'The Model Health Show', category: 'Health & Wellness', description: 'Shawn Stevenson on evidence-based health and fitness science', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ml_us15_2', title: 'Found My Fitness', category: 'Health • Science', description: 'Dr. Rhonda Patrick on nutrition, genetics, and longevity', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
      { id: 'ml_us15_3', title: 'Feel Better, Live More', category: 'Health & Wellness', description: 'Dr. Rangan Chatterjee on simple changes for a healthier life', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop' },
      { id: 'ml_us15_4', title: 'Outlive with Peter Attia', category: 'Health • Longevity', description: 'The science and art of living longer and better', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200&h=200&fit=crop' },
    ],
  },
};

const getFallbackData = (
  title: string,
  creator: string,
  image: string
): Podcast => ({
  title: title || 'Unknown Podcast', creator: creator || 'Unknown Creator', studio: '',
  image: image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=400&fit=crop',
  duration: '30:00', durationSecs: DEFAULT_DURATION_SECONDS, rating: '4.5', ratingCount: '1K', category: 'Podcast',
  about: 'A great podcast with insightful episodes covering topics you love. This show delivers quality content on a consistent basis, keeping listeners informed, entertained, and inspired.',
  episodes: Array.from({ length: 5 }, (_, i) => ({
    id: `ep_fallback_${i + 1}`, title: `Episode ${i + 1} — Coming Soon`,
    description: 'A brand new episode is on its way', duration: '28 min',
    plays: `${(5 - i)}M+`, date: `${14 - i * 2} Mar`,
    image: image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&h=200&fit=crop',
  })),
  moreLike: [],
});

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const parseDuration = (duration: string): number => {
  if (!duration) return DEFAULT_DURATION_MINUTES; // Default 30 minutes
  
  // Handle format like "3:45 hr" or "3:45"
  if (duration.includes('hr')) {
    const match = duration.match(/(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      return hours * 60 + minutes;
    }
    return DEFAULT_DURATION_MINUTES;
  }
  // Handle format like "38 min"
  if (duration.includes('min')) {
    const match = duration.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return DEFAULT_DURATION_MINUTES;
  }
  
  // Handle format like "42:29" (minutes:seconds)
  if (duration.includes(':')) {
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      return minutes;
    }
  }
  
  // Handle numeric string
  const num = parseFloat(duration);
  return isNaN(num) ? DEFAULT_DURATION_MINUTES : num;
};

type TabType    = 'episodes' | 'about' | 'moreLike';
type SortType   = 'newest' | 'oldest' | 'popular' | 'shortest' | 'longest';

const SORT_OPTIONS: { key: SortType; label: string }[] = [
  { key: 'newest',   label: 'Newest first' },
  { key: 'oldest',   label: 'Oldest first' },
  { key: 'popular',  label: 'Most popular' },
  
];

export default function PlayerScreen() {
  const { podcastId, podcastTitle, podcastCreator, podcastImage, fromCountryId, fromCategoryId } =
    useLocalSearchParams<{ podcastId: string; podcastTitle: string; podcastCreator: string; podcastImage: string; fromCountryId: string; fromCategoryId: string }>();

  // Get player context
  const { playPodcast, pausePodcast, isPlaying: globalIsPlaying, currentPodcast } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  const data = episodeData[podcastId as string] ||
    getFallbackData(podcastTitle as string, podcastCreator as string, podcastImage as string);

  const [isPlaying,    setIsPlaying]    = useState(false);
  const [currentSecs,  setCurrentSecs]  = useState(0);
  const [activeTab,    setActiveTab]    = useState<TabType>('episodes');
  const [isFollowing,  setIsFollowing]  = useState(false);
  const [isNotified,   setIsNotified]   = useState(false);
  const [sortBy,       setSortBy]       = useState<SortType>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [addedEpisodes, setAddedEpisodes] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPodcastMenu, setShowPodcastMenu] = useState(false);
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const contentMaxWidth = 800;
  const totalSecs = data?.durationSecs || DEFAULT_DURATION_SECONDS;
  const TAB_WIDTH = (Math.min(windowWidth, contentMaxWidth) - 40) / 3;

  const topBg = isDarkMode ? '#1A0505' : '#F5F0F0';
  const topIcon = isDarkMode ? '#FFFFFF' : '#1A0505';
  const topBtnBg = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const topTitle = isDarkMode ? '#FFFFFF' : '#1A0505';
  const topSub = isDarkMode ? 'rgba(255,255,255,0.65)' : '#8B3A3A';
  const cardBg = isDarkMode ? '#130404' : '#FFFFFF';
  const timeColor = isDarkMode ? 'rgba(255,255,255,0.55)' : '#999';
  const inactiveWave = isDarkMode ? 'rgba(255,255,255,0.18)' : '#E0D0D0';
  const controlAccent = isDarkMode ? 'rgba(255,255,255,0.65)' : '#8B3A3A';

  const returnHref = useMemo(() => {
    const id = encodeURIComponent(String(podcastId ?? ''));
    const title = encodeURIComponent(String(data?.title ?? podcastTitle ?? ''));
    const creator = encodeURIComponent(String(data?.creator ?? podcastCreator ?? ''));
    const image = encodeURIComponent(String(data?.image ?? podcastImage ?? ''));
    const country = encodeURIComponent(String(fromCountryId ?? ''));
    const category = encodeURIComponent(String(fromCategoryId ?? ''));
    return `/podcasts/player?podcastId=${id}&podcastTitle=${title}&podcastCreator=${creator}&podcastImage=${image}&fromCountryId=${country}&fromCategoryId=${category}`;
  }, [data?.creator, data?.image, data?.title, fromCategoryId, fromCountryId, podcastCreator, podcastId, podcastImage, podcastTitle]);

  // ── Animations ────────────────────────────────────────────────────────────
  const contentFade      = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(20)).current;
  const artworkScale     = useRef(new Animated.Value(0.88)).current;
  const artworkOpacity   = useRef(new Animated.Value(0)).current;
  const playButtonScale  = useRef(new Animated.Value(1)).current;
  const followScale      = useRef(new Animated.Value(1)).current;
  const notifyScale      = useRef(new Animated.Value(1)).current;
  const tabIndicator     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(artworkScale,     { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(artworkOpacity,   { toValue: 1, duration: 300, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(contentFade,      { toValue: 1, duration: 380, delay: 200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(contentTranslate, { toValue: 0, duration: 380, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentSecs(prev => {
        if (prev >= totalSecs) { setIsPlaying(false); return totalSecs; }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalSecs]);

  // Sync with global player state
  useEffect(() => {
    if (currentPodcast?.id === podcastId) {
      setIsPlaying(globalIsPlaying);
    }
  }, [globalIsPlaying, currentPodcast, podcastId]);

  // ── Sorting logic ─────────────────────────────────────────────────────────
  const parsePlays = (p: string): number => parseFloat(p.replace(/[^0-9.]/g, ''));

  const sortedEpisodes = [...data.episodes].sort((a: Episode, b: Episode) => {
    switch (sortBy) {
      case 'oldest':   return data.episodes.indexOf(a) - data.episodes.indexOf(b);
      case 'newest':   return data.episodes.indexOf(b) - data.episodes.indexOf(a);
      case 'popular':  return parsePlays(b.plays) - parsePlays(a.plays);
      case 'shortest': return parseDuration(a.duration) - parseDuration(b.duration);
      case 'longest':  return parseDuration(b.duration) - parseDuration(a.duration);
      default:         return 0;
    }
  });

  const handleTabPress = (tab: TabType, index: number) => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, { toValue: index * TAB_WIDTH, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/podcasts/discover', params: { restoredCountryId: fromCountryId || '', restoredCategoryId: fromCategoryId || '' } });
  };

  const handlePlayPause = () => {
    Animated.sequence([
      Animated.timing(playButtonScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(playButtonScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }),
    ]).start();
    
    if (isPlaying) {
      pausePodcast();
      setIsPlaying(false);
    } else {
      // Create podcast object for mini player
      const podcastData = {
        id: podcastId as string,
        title: data.title,
        creator: data.creator,
        image: data.image,
        duration: data.duration,
      };
      
      playPodcast(podcastData, totalSecs);
      setIsPlaying(true);
    }
  };
  
  const handleFollow = () => {
    Animated.sequence([
      Animated.timing(followScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(followScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
    ]).start();
    setIsFollowing(f => !f);
  };
  const handleAddEpisode = (episodeId: string) => {
  setAddedEpisodes(prev => {
    const next = new Set(prev);
    next.has(episodeId) ? next.delete(episodeId) : next.add(episodeId);
    return next;
  });
};

  const handleNotify = () => {
    Animated.sequence([
      Animated.timing(notifyScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(notifyScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }),
    ]).start();
    setIsNotified(n => !n);
  };
  
  const handleForward  = () => setCurrentSecs(s => Math.min(s + 30, totalSecs));
  const handleBackward = () => setCurrentSecs(s => Math.max(s - 15, 0));

  const remaining  = totalSecs - currentSecs;
  const playedBars = Math.floor((currentSecs / totalSecs) * waveform.length);
  const contentStyle = { opacity: contentFade, transform: [{ translateY: contentTranslate }] };

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Newest first';

  // ── Tab renderers ─────────────────────────────────────────────────────────
  const renderEpisodes = () => (
    <View>
      {/* Sort row */}
      <TouchableOpacity style={T.filterRow} onPress={() => setShowSortMenu(true)} activeOpacity={0.8}>
        <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.6)" />
        <Text style={T.filterText}>All episodes • {currentSortLabel}</Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.5)" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {sortedEpisodes.map((ep: Episode) => (
        <TouchableOpacity
          key={ep.id}
          style={styles.episodeItem}
          onPress={() => {
            const episodePodcastData = {
              id: ep.id,
              title: ep.title,
              creator: data.creator,
              image: ep.image,
              duration: ep.duration,
            };
            
            // Play in mini player
            // parseDuration returns minutes, multiply by 60 to get seconds
            const durationInSeconds = parseDuration(ep.duration) * 60;
            playPodcast(episodePodcastData, durationInSeconds);
            
            // Navigate to player
            router.push({ 
              pathname: '/podcasts/player', 
              params: { 
                podcastId: ep.id, 
                podcastTitle: ep.title, 
                podcastCreator: data.creator, 
                podcastImage: ep.image, 
                fromCountryId: fromCountryId || '', 
                fromCategoryId: fromCategoryId || '' 
              } 
            });
          }}
          activeOpacity={0.8}
        >
          <Image source={{ uri: ep.image }} style={styles.episodeThumbnail as any} resizeMode="cover" />
          <View style={styles.episodeDetails}>
            <Text style={styles.episodeItemTitle} numberOfLines={2}>{ep.title}</Text>
            <Text style={styles.episodeDescription} numberOfLines={2}>{ep.description}</Text>
            <Text style={T.episodeMeta}>{ep.plays} plays • {ep.date} • {ep.duration}</Text>
            <View style={T.episodeActions}>
              <TouchableOpacity onPress={() => handleAddEpisode(ep.id)}>
  <Ionicons
    name={addedEpisodes.has(ep.id) ? "checkmark-circle" : "add-circle-outline"}
    size={22}
    color={addedEpisodes.has(ep.id) ? "#CC2222" : "rgba(255,255,255,0.5)"}
  />
</TouchableOpacity>
              <Ionicons name="share-outline"       size={22} color="rgba(255,255,255,0.5)" />
              <Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.5)" />
              <TouchableOpacity 
                style={T.playCircle} 
                onPress={() => {
                  const episodePodcastData = {
                    id: ep.id,
                    title: ep.title,
                    creator: data.creator,
                    image: ep.image,
                    duration: ep.duration,
                  };
                  const durationInSeconds = parseDuration(ep.duration) * 60;
                  playPodcast(episodePodcastData, durationInSeconds);
                  router.push({ 
                    pathname: '/podcasts/player', 
                    params: { 
                      podcastId: ep.id, 
                      podcastTitle: ep.title, 
                      podcastCreator: data.creator, 
                      podcastImage: ep.image, 
                      fromCountryId: '', 
                      fromCategoryId: '' 
                    } 
                  });
                }}
              >
                <Ionicons name="play" size={16} color="#1A0505" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 30 }} />
    </View>
  );

  const renderAbout = () => (
    <View>
      <Text style={T.aboutText}>{data.about}</Text>
      <View style={T.aboutTags}>
        <View style={T.tag}>
          <Ionicons name="star-outline" size={13} color="rgba(255,255,255,0.7)" />
          <Text style={T.tagText}>{data.rating} ({data.ratingCount})</Text>
        </View>
        <View style={T.tagDot} />
        <View style={T.tag}>
          <Text style={T.tagText}>{data.category}</Text>
        </View>
      </View>
      <View style={{ height: 30 }} />
    </View>
  );

  const renderMoreLike = () => (
    <View>
      {data.moreLike.length === 0
        ? <Text style={T.aboutText}>No similar podcasts found.</Text>
        : data.moreLike.map((item: MoreLike) => (
          <TouchableOpacity
            key={item.id}
            style={T.moreLikeItem}
            activeOpacity={0.8}
            onPress={() => {
              const moreLikeData = {
                id: item.id,
                title: item.title,
                creator: item.category,
                image: item.image,
              };
              
              playPodcast(moreLikeData, DEFAULT_DURATION_SECONDS);
              
              router.push({ 
                pathname: '/podcasts/player', 
                params: { 
                  podcastId: item.id, 
                  podcastTitle: item.title, 
                  podcastCreator: item.category, 
                  podcastImage: item.image, 
                  fromCountryId: fromCountryId || '', 
                  fromCategoryId: fromCategoryId || '' 
                } 
              });
            }}
          >
            <Image source={{ uri: item.image }} style={T.moreLikeImage} resizeMode="cover" />
            <View style={T.moreLikeInfo}>
              <Text style={T.moreLikeCategory}>{item.category}</Text>
              <Text style={T.moreLikeTitle}>{item.title}</Text>
              <Text style={T.moreLikeDesc} numberOfLines={2}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))
      }
      <View style={{ height: 30 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#1A0505' }}>
      {/* Centered content column */}
      <View style={isDesktop ? { flex: 1, width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center' } : { flex: 1 }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={topBg} />

      {/* Single outer ScrollView — everything scrolls together, no trapped sub-sections */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
      {/* ── TOP SECTION ── */}
      <View style={[styles.topSection, { backgroundColor: topBg }]}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={contentStyle}>
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: topBtnBg }]} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={22} color={topIcon} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => toggleFavorite({ id: podcastId as string, title: data.title, subtitle: data.creator, image: data.image, type: 'podcast', rawData: data })} style={[styles.backButton, { backgroundColor: topBtnBg, marginLeft: 0 }]} activeOpacity={0.8}>
                  <Ionicons name={isFavorite(podcastId as string) ? "heart" : "heart-outline"} size={22} color={isFavorite(podcastId as string) ? "#EC4899" : topIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: topBtnBg, marginLeft: 0 }]} activeOpacity={0.8}>
                  <Ionicons name="share-outline" size={22} color={topIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[P.podcastHeaderRow, contentStyle]}>
            <Animated.View style={[styles.artworkWrapper, P.artworkLeft, { opacity: artworkOpacity, transform: [{ scale: artworkScale }] }]}>
              <Image source={{ uri: data.image }} style={styles.artworkGradient as any} resizeMode="cover" />
            </Animated.View>
            <View style={P.podcastMeta}>
              <Text style={[P.podcastTitle, { color: topTitle }]} numberOfLines={2}>{data.title}</Text>
              <Text style={[P.podcastCreator, { color: topSub }]}>{data.creator}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[P.actionsRow, contentStyle]}>
            <Animated.View style={{ transform: [{ scale: followScale }] }}>
              <TouchableOpacity
                style={[
                  P.followBtn,
                  { borderColor: topIcon },
                  isFollowing && P.followingBtn,
                  isFollowing && isDarkMode && { backgroundColor: '#FFFFFF' },
                ]}
                onPress={handleFollow}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    P.followText,
                    { color: topIcon },
                    isFollowing && P.followingText,
                    isFollowing && isDarkMode && { color: '#1A0505' },
                  ]}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Notification button with animation */}
            <Animated.View style={{ transform: [{ scale: notifyScale }] }}>
              <TouchableOpacity 
                style={[P.iconBtn, { backgroundColor: topBtnBg }, isNotified && P.notifyActive]} 
                onPress={handleNotify}
                activeOpacity={0.85}
              >
                <Ionicons 
                  name={isNotified ? "notifications" : "notifications-outline"} 
                  size={22} 
                  color={isNotified ? "#CC2222" : topIcon} 
                />
              </TouchableOpacity>
            </Animated.View>
            
            <TouchableOpacity style={[P.iconBtn, { backgroundColor: topBtnBg }]} activeOpacity={0.85}><Ionicons name="settings-outline" size={22} color={topIcon} /></TouchableOpacity>
            <TouchableOpacity
              style={[P.iconBtn, { backgroundColor: topBtnBg }]}
              activeOpacity={0.85}
              onPress={() => setShowPodcastMenu(true)}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={topIcon} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={contentStyle}>
            <View style={[styles.playerCard, { backgroundColor: cardBg, borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(200,50,50,0.08)' }]}>
              <View style={styles.waveformContainer}>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, { color: timeColor }]}>{formatTime(currentSecs)}</Text>
                  <Text style={[styles.timeText, { color: timeColor }]}>-{formatTime(remaining)}</Text>
                </View>
                <View style={styles.waveform}>
                  {waveform.map((barHeight, index) => {
                    // Determine if this bar should be active (played)
                    const isActive = index < playedBars;
                    
                    return (
                      <View 
                        key={index} 
                        style={[
                          styles.waveformBar, 
                          { 
                            height: barHeight,
                            backgroundColor: isActive ? '#CC2222' : inactiveWave
                          }
                        ]} 
                      />
                    );
                  })}
                </View>
              </View>
              <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}><Ionicons name="repeat" size={20} color={controlAccent} /></TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleBackward} activeOpacity={0.8}><Ionicons name="play-skip-back" size={22} color={topIcon} /></TouchableOpacity>
                <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
                  <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} activeOpacity={1}>
                    <LinearGradient colors={['#CC0000', '#8B0000']} style={styles.playButtonGradient}>
                      <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity style={styles.controlButton} onPress={handleForward} activeOpacity={0.8}><Ionicons name="play-skip-forward" size={22} color={topIcon} /></TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => setIsDarkMode(v => !v)} activeOpacity={0.8}>
                  <Ionicons name={isDarkMode ? "moon" : "moon-outline"} size={20} color={controlAccent} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>

      {/* ── BOTTOM SECTION ── */}
      <Animated.View style={[contentStyle]}>
        <View style={[styles.bottomSection, { paddingTop: 0 }]}>
          <View style={styles.handleBarContainer}><View style={styles.handleBar} /></View>

          <View style={T.tabBar}>
            {(['episodes', 'about', 'moreLike'] as TabType[]).map((tab, index) => {
              const label = tab === 'episodes' ? 'Episodes' : tab === 'about' ? 'About' : 'More like this';
              return (
                <TouchableOpacity key={tab} style={T.tabItem} onPress={() => handleTabPress(tab, index)} activeOpacity={0.8}>
                  <Text style={[T.tabLabel, activeTab === tab && T.tabLabelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={T.tabIndicatorTrack}>
            <Animated.View style={[T.tabIndicator, { width: TAB_WIDTH, transform: [{ translateX: tabIndicator }] }]} />
          </View>

          <View style={{ marginTop: 16, paddingBottom: 16 }}>
            {activeTab === 'episodes' && renderEpisodes()}
            {activeTab === 'about'    && renderAbout()}
            {activeTab === 'moreLike' && renderMoreLike()}
          </View>
        </View>
      </Animated.View>
      </ScrollView>
      </View>

      <Modal transparent animationType="fade" visible={showPodcastMenu} onRequestClose={() => setShowPodcastMenu(false)}>
        <TouchableOpacity style={M.overlay} activeOpacity={1} onPress={() => setShowPodcastMenu(false)}>
          <View style={M.sheet}>
            <TouchableOpacity
              style={M.sheetItem}
              activeOpacity={0.85}
              onPress={() => {
                setShowPodcastMenu(false);
                router.push({
                  pathname: '/podcasts/report',
                  params: { podcastName: data.title, returnHref },
                });
              }}
            >
              <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
              <Text style={M.sheetText}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── SORT MODAL ── */}
      <Modal transparent animationType="slide" visible={showSortMenu} onRequestClose={() => setShowSortMenu(false)}>
        <TouchableOpacity style={T.modalOverlay} activeOpacity={1} onPress={() => setShowSortMenu(false)}>
          <View style={T.sortSheet}>
            <View style={T.sortHandle} />
            <Text style={T.sortTitle}>Sort episodes</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={T.sortOption}
                onPress={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                activeOpacity={0.8}
              >
                <Text style={[T.sortOptionText, sortBy === opt.key && T.sortOptionActive]}>{opt.label}</Text>
                {sortBy === opt.key && <Ionicons name="checkmark-circle" size={20} color="#CC2222" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const P: Record<string, any> = {
  podcastHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12, gap: 16 },
  artworkLeft:      { width: 90, height: 90, borderRadius: 45, flexShrink: 0 },
  podcastMeta:      { flex: 1 },
  podcastTitle:     { fontSize: 18, fontWeight: '700', color: '#1A0505', marginBottom: 4, lineHeight: 23 },
  podcastCreator:   { fontSize: 13, color: '#8B3A3A', fontWeight: '500' },
  actionsRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  followBtn:        { paddingHorizontal: 22, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: '#1A0505', backgroundColor: 'transparent' },
  followingBtn:     { backgroundColor: '#1A0505' },
  followText:       { fontSize: 14, fontWeight: '700', color: '#1A0505' },
  followingText:    { color: '#FFFFFF' },
  iconBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.06)', justifyContent: 'center', alignItems: 'center' },
  notifyActive:     { backgroundColor: 'rgba(204, 34, 34, 0.1)' },
};

const T: Record<string, any> = {
  tabBar:            { flexDirection: 'row' },
  tabItem:           { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabLabel:          { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.4)' },
  tabLabelActive:    { color: '#FFFFFF', fontWeight: '700' },
  tabIndicatorTrack: { height: 2, backgroundColor: 'rgba(255,255,255,0.08)' },
  tabIndicator:      { height: 2, backgroundColor: '#CC2222', borderRadius: 1 },
  filterRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, alignSelf: 'flex-start' },
  filterText:        { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  episodeMeta:       { fontSize: 11, color: '#E05555', fontWeight: '600', marginBottom: 8, marginTop: 2 },
  episodeActions:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  playCircle:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
  aboutText:         { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginBottom: 20 },
  aboutTags:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag:               { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  tagText:           { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  tagDot:            { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  moreLikeItem:      { flexDirection: 'row', gap: 14, marginBottom: 20 },
  moreLikeImage:     { width: 110, height: 110, borderRadius: 12, backgroundColor: '#2A0808' },
  moreLikeInfo:      { flex: 1, justifyContent: 'center' },
  moreLikeCategory:  { fontSize: 11, color: '#E05555', fontWeight: '600', marginBottom: 4 },
  moreLikeTitle:     { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  moreLikeDesc:      { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 17 },
  // Sort modal
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sortSheet:         { backgroundColor: '#1A0505', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderTopWidth: 1, borderColor: 'rgba(220,60,60,0.3)' },
  sortHandle:        { width: 36, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sortTitle:         { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },
  sortOption:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  sortOptionText:    { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  sortOptionActive:  { color: '#FFFFFF', fontWeight: '700' },
};

const M: Record<string, any> = {
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1A0505', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1, borderColor: 'rgba(220,60,60,0.3)' },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  sheetText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
};
