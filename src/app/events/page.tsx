'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { toast } from '@/components/toaster';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon, ChevronRight, ChevronLeft, Clock, MapPin, X, Edit, Trash2 } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { he } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Hebrew localization for calendar
const locales = { 'he': he };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  id: number;
  title: string;
  date: string;
  description: string | null;
  type: 'service' | 'holiday' | 'meeting' | 'general';
}

const eventTypeColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  service: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', label: 'תפילה' },
  holiday: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', label: 'חג' },
  meeting: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', label: 'ישיבה' },
  general: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', label: 'כללי' },
};

// Hebrew month names
const hebrewMonths = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

// Hebrew day names
const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const fetchEvents = useCallback(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch('/api/events', { credentials: 'include', signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setEvents(d.data || []))
      .catch((e) => { if (e?.name !== 'AbortError') toast('שגיאה בטעינת האירועים', 'error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  useEffect(() => { return fetchEvents(); }, [fetchEvents]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/events/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        toast('האירוע נמחק', 'success');
      } else toast('שגיאה במחיקה', 'error');
    } catch { toast('שגיאה במחיקה', 'error'); }
    finally { setDeleteTarget(null); }
  }, [deleteTarget]);

  // Convert events to calendar format
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.date),
      end: new Date(event.date),
      resource: event,
    }));
  }, [events]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [events, selectedDate]);

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('PREV')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronRight className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold min-w-[150px] text-center">
          {label}
        </h2>
        <button onClick={() => onNavigate('NEXT')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('TODAY')} className="px-3 py-1.5 text-sm rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 transition-colors">
          היום
        </button>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                view === v
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              )}
            >
              {v === 'month' ? 'חודש' : v === 'week' ? 'שבוע' : 'יום'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Custom event component
  const CustomEvent = ({ event }: any) => {
    const ev = event.resource as Event;
    const colors = eventTypeColors[ev.type] || eventTypeColors.general;
    return (
      <div className={cn('text-xs rounded px-2 py-1 truncate font-medium', colors.bg, colors.text)}>
        {ev.title}
      </div>
    );
  };

  // Custom date cell
  const CustomDateCell = ({ value, children }: any) => {
    const isToday = value.toDateString() === new Date().toDateString();
    const hasEvents = events.some(e => new Date(e.date).toDateString() === value.toDateString());
    
    return (
      <div 
        className={cn(
          'h-full min-h-[80px] p-1 transition-all duration-200 cursor-pointer',
          isToday && 'bg-primary-50 dark:bg-primary-900/20'
        )}
        onClick={() => setSelectedDate(value)}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={cn(
            'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
            isToday ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300',
            selectedDate.toDateString() === value.toDateString() && !isToday && 'bg-gray-200 dark:bg-gray-600'
          )}>
            {value.getDate()}
          </span>
          {hasEvents && (
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          )}
        </div>
        {children}
      </div>
    );
  };

  const monthName = hebrewMonths[selectedDate.getMonth()];
  const dayName = hebrewDays[selectedDate.getDay()];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">יומן אירועים</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{events.length} אירועים</p>
          </div>
          <Link 
            href="/events/new" 
            className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">הוסף אירוע</span>
            <span className="sm:hidden">הוסף</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={(v) => setView(v as any)}
                date={selectedDate}
                onNavigate={(date) => setSelectedDate(date)}
                culture='he'
                components={{
                  toolbar: CustomToolbar,
                  event: CustomEvent,
                  dateCellWrapper: CustomDateCell,
                }}
                className="min-h-[500px]"
                onSelectEvent={(event) => setSelectedEvent(event.resource)}
                eventPropGetter={(event) => ({
                  className: 'transition-transform hover:scale-105',
                })}
              />
            </div>
          </div>

          {/* Side panel - Selected date events */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dayName}, {selectedDate.getDate()} {monthName}
                </h2>
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>אין אירועים ביום זה</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => {
                    const colors = eventTypeColors[event.type] || eventTypeColors.general;
                    return (
                      <div 
                        key={event.id}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md',
                          colors.bg,
                          colors.border
                        )}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full bg-white/60', colors.text)}>
                              {colors.label}
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white mt-2">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">סוגי אירועים</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(eventTypeColors).map(([key, colors]) => (
                    <span 
                      key={key}
                      className={cn('text-xs px-2 py-1 rounded-full', colors.bg, colors.text)}
                    >
                      {colors.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-backdrop"
            onClick={() => setSelectedEvent(null)}
          >
            <div 
              className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xl animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  eventTypeColors[selectedEvent.type]?.bg,
                  eventTypeColors[selectedEvent.type]?.text
                )}>
                  {eventTypeColors[selectedEvent.type]?.label}
                </span>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedEvent.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(selectedEvent.date)}
              </div>
              
              {selectedEvent.description && (
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}
              
              <div className="flex justify-end gap-3">
                <Link
                  href={`/events/${selectedEvent.id}/edit`}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  עריכה
                </Link>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setDeleteTarget(selectedEvent);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  מחיקה
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-fade-backdrop">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 animate-fade-up">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">אישור מחיקה</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">האם אתה בטוח שברצונך למחוק את האירוע "{deleteTarget.title}"?</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteTarget(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">ביטול</button>
                <button onClick={handleDelete} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">מחק</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
