'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTimeShort } from '@/lib/zmanim';
import { Sunrise, Sunset, Clock, Flame, Moon, Star } from 'lucide-react';

import type { ZmanimDayApi } from '@/hooks/useZmanim';

interface ZmanimCardProps {
  zmanim?: ZmanimDayApi;
  isLoading?: boolean;
}

export function ZmanimCard({ zmanim, isLoading }: ZmanimCardProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!zmanim) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">זמני היום</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">אין נתונים זמינים</p>
        </CardContent>
      </Card>
    );
  }

  const timeItems = [
    { label: 'עלות השחר', time: zmanim.times.alotHaShachar, icon: Star },
    { label: 'משיכיר', time: zmanim.times.misheyakir, icon: Clock },
    { label: 'הנץ החמה', time: zmanim.times.sunrise, icon: Sunrise },
    { label: 'סוף זמן ק"ש', time: zmanim.times.sofZmanShma, icon: Clock },
    { label: 'סוף זמן תפילה', time: zmanim.times.sofZmanTfilla, icon: Clock },
    { label: 'חצות היום', time: zmanim.times.chatzot, icon: Clock },
    { label: 'מנחה גדולה', time: zmanim.times.minchaGedola, icon: Clock },
    { label: 'מנחה קטנה', time: zmanim.times.minchaKtana, icon: Clock },
    { label: 'פלג המנחה', time: zmanim.times.plagHaMincha, icon: Clock },
    { label: 'שקיעה', time: zmanim.times.sunset, icon: Sunset },
    { label: 'צאת הכוכבים', time: zmanim.times.tzeitHaKochavim, icon: Moon },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-l from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              זמני היום
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {zmanim.hebrewDate}
            </p>
          </div>
          <div className="text-left">
            {zmanim.parasha && (
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                פרשת {zmanim.parasha}
              </div>
            )}
          </div>
        </div>
        
        {/* תגיות שבת/חג */}
        {(zmanim.isShabbat || zmanim.isHoliday) && (
          <div className="flex gap-2 mt-3">
            {zmanim.isShabbat && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                שבת
              </span>
            )}
            {zmanim.holidayName && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
                {zmanim.holidayName}
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        {/* הדלקת נרות / הבדלה */}
        {(zmanim.candleLighting || zmanim.havdalah) && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-900 dark:text-amber-100">זמני כניסת שבת/חג</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {zmanim.candleLighting && (
                <div>
                  <span className="text-xs text-gray-500 block">הדלקת נרות</span>
                  <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                    {formatTimeShort(zmanim.candleLighting)}
                  </span>
                </div>
              )}
              {zmanim.havdalah && (
                <div>
                  <span className="text-xs text-gray-500 block">צאת השבת</span>
                  <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    {formatTimeShort(zmanim.havdalah)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* זמנים עיקריים */}
        <div className="grid grid-cols-2 gap-3">
          {timeItems.slice(0, 6).map((item) => (
            <div 
              key={item.label}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <item.icon className="w-3 h-3" />
                {item.label}
              </span>
              <span className="font-mono font-medium">
                {formatTimeShort(item.time)}
              </span>
            </div>
          ))}
        </div>
        
        {/* כפתור להצגת כל הזמנים */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 text-center py-2">
            הצג עוד זמנים
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
            {timeItems.slice(6).map((item) => (
              <div 
                key={item.label}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
                <span className="font-mono font-medium">
                  {formatTimeShort(item.time)}
                </span>
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
