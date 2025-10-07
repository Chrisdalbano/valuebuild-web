import { ref } from 'vue'

// Curated selection of champion splash arts
const championSplashes = [
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Shen_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Gangplank_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Vayne_0.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Thresh_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ezreal_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Shen_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jhin_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Akali_1.jpg',
  'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Sylas_1.jpg',
]

// Session-persistent splash (one per session)
let sessionSplash = null

export function useChampionSplash() {
  const splash = ref('')

  // Get or set session splash
  if (!sessionSplash) {
    const randomIndex = Math.floor(Math.random() * championSplashes.length)
    sessionSplash = championSplashes[randomIndex]
  }
  
  splash.value = sessionSplash

  return {
    splash
  }
}

