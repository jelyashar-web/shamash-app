import { ZmanimCalendar, GeoLocation } from 'kosher-zmanim';

interface SynagogueConfig {
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  candleLightingMinutes?: number;
}

// ברירת מחדל - ירושלים
export const DEFAULT_SYNAGOGUE: SynagogueConfig = {
  name: 'ירושלים',
  latitude: 31.7683,
  longitude: 35.2137,
  elevation: 754,
  timezone: 'Asia/Jerusalem',
  candleLightingMinutes: 18,
};

export interface ZmanimDay {
  date: Date;
  hebrewDate: string;
  parasha: string | null;
  isShabbat: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  candleLighting: Date | null;
  havdalah: Date | null;
  times: {
    alotHaShachar: Date;
    misheyakir: Date;
    sunrise: Date;
    sofZmanShma: Date;
    sofZmanTfilla: Date;
    chatzot: Date;
    minchaGedola: Date;
    minchaKtana: Date;
    plagHaMincha: Date;
    sunset: Date;
    tzeitHaKochavim: Date;
  };
}

/**
 * חישוב זמני היום לבית כנסת - גרסה סינכרונית ללקוח
 */
export function calculateZmanimForDate(
  date: Date = new Date(),
  config: SynagogueConfig = DEFAULT_SYNAGOGUE,
  hebrewDateStr: string = '',
  parasha: string | null = null,
  holidayName: string | null = null
): ZmanimDay {
  const location = new GeoLocation(
    config.name,
    config.latitude,
    config.longitude,
    config.elevation || 0,
    config.timezone
  );

  const zc = new ZmanimCalendar(location);
  zc.setDate(date);
  zc.setCandleLightingOffset(config.candleLightingMinutes || 18);

  const isShabbat = date.getDay() === 6;
  const isHoliday = !!holidayName;
  
  let candleLighting: Date | null = null;
  let havdalah: Date | null = null;
  
  if (isShabbat || isHoliday) {
    const friday = new Date(date);
    friday.setDate(friday.getDate() - (date.getDay() === 6 ? 1 : 0));
    
    const fridayZc = new ZmanimCalendar(location);
    fridayZc.setDate(friday);
    fridayZc.setCandleLightingOffset(config.candleLightingMinutes || 18);
    
    candleLighting = fridayZc.getCandleLighting() || null;
    
    const sunset = zc.getSunset();
    havdalah = sunset ? new Date(sunset.getTime() + 42 * 60 * 1000) : null;
  }

  const sunrise = zc.getSunrise();
  const misheyakir = sunrise ? new Date(sunrise.getTime() - 11 * 60 * 1000) : date;
  const chatzot = zc.getChatzos();
  const shaahZmanit = sunrise && chatzot ? (chatzot.getTime() - sunrise.getTime()) / 6 : 60 * 60 * 1000;
  const minchaGedola = chatzot ? new Date(chatzot.getTime() + 30 * 60 * 1000) : date;
  const minchaKtana = sunrise ? new Date(sunrise.getTime() + 9.5 * shaahZmanit) : date;
  const sunsetTime = zc.getSunset();
  const plagHaMincha = (zc as any).getPlagHamincha?.() || (sunsetTime ? new Date(sunsetTime.getTime() - 1.5 * 60 * 60 * 1000) : date);

  return {
    date,
    hebrewDate: hebrewDateStr,
    parasha,
    isShabbat,
    isHoliday,
    holidayName,
    candleLighting,
    havdalah,
    times: {
      alotHaShachar: zc.getAlosHashachar() || date,
      misheyakir,
      sunrise: sunrise || date,
      sofZmanShma: zc.getSofZmanShmaGRA() || date,
      sofZmanTfilla: zc.getSofZmanTfilaGRA() || date,
      chatzot: chatzot || date,
      minchaGedola,
      minchaKtana,
      plagHaMincha,
      sunset: sunsetTime || date,
      tzeitHaKochavim: zc.getTzais() || date,
    },
  };
}

/**
 * פורמט שעה בצורה קצרה
 */
export function formatTimeShort(date: Date): string {
  return date.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * פורמט זמן לתצוגה בעברית
 */
export function formatTimeHebrew(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
