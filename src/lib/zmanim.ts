import SunCalc from 'suncalc';

interface ZmanimConfig {
  latitude: number;
  longitude: number;
  timezone: string;
}

interface Zmanim {
  dawn: Date;
  sunrise: Date;
  sunset: Date;
  dusk: Date;
  noon: Date;
  night: Date;
}

// Default config (Jerusalem)
const DEFAULT_CONFIG: ZmanimConfig = {
  latitude: 31.7683,
  longitude: 35.2137,
  timezone: 'Asia/Jerusalem',
};

export function calculateZmanim(date: Date, config: ZmanimConfig = DEFAULT_CONFIG): Zmanim {
  const times = SunCalc.getTimes(date, config.latitude, config.longitude);

  return {
    dawn: times.dawn,
    sunrise: times.sunrise,
    sunset: times.sunset,
    dusk: times.dusk,
    noon: times.solarNoon,
    night: times.night,
  };
}

export function getCandleLightingTime(date: Date, config: ZmanimConfig = DEFAULT_CONFIG): Date {
  const zmanim = calculateZmanim(date, config);
  // Candle lighting is 18 minutes before sunset
  const candleLighting = new Date(zmanim.sunset.getTime() - 18 * 60 * 1000);
  return candleLighting;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getParashaName(date: Date): string {
  // Simplified - in production, use @hebcal/core
  const weeks = Math.floor(date.getTime() / (1000 * 60 * 60 * 24 * 7));
  const parshiyot = [
    'בראשית', 'נח', 'לך לך', 'וירא', 'חיי שרה', 'תולדות', 'ויצא', 'וישלח',
    'וישב', 'מקץ', 'ויגש', 'ויחי', 'שמות', 'וארא', 'בא', 'בשלח', 'יתרו',
    'משפטים', 'תרומה', 'תצוה', 'כי תשא', 'ויקהל', 'פקודי', 'ויקרא', 'צו',
    'שמיני', 'תזריע', 'מצורע', 'אחרי מות', 'קדושים', 'אמור', 'בהר',
    'בחקתי', 'במדבר', 'נשא', 'בהעלותך', 'שלח לך', 'קרח', 'חקת', 'בלק',
    'פינחס', 'מטות', 'מסעי', 'דברים', 'ואתחנן', 'עקב', 'ראה', 'שופטים',
    'כי תצא', 'כי תבוא', 'נצבים', 'וילך', 'האזינו', 'וזאת הברכה'
  ];
  return parshiyot[weeks % parshiyot.length];
}
