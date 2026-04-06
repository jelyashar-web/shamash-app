'use client';

import { useState } from 'react';
import { MemberAvatar } from './MemberAvatar';
import { ChevronDown, ChevronUp, Phone, Mail, Calendar, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getHebrewRole, formatPhone, cn } from '@/lib/utils';

interface Member {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'kohen' | 'levi' | 'yisrael';
  yahrzeitDate: string | null;
  notes: string | null;
  photo: string | null;
  createdAt: string;
}

interface ExpandableMemberCardProps {
  member: Member;
  onDelete: (member: Member) => void;
}

const roleBadge = (role: string) => {
  if (role === 'kohen') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
  if (role === 'levi')  return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export function ExpandableMemberCard({ member, onDelete }: ExpandableMemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 transition-all duration-300 ease-in-out hover:shadow-md">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-right"
      >
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar name={member.name} photo={member.photo} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {member.name}
            </p>
            <span className={cn('inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium', roleBadge(member.role))}>
              {getHebrewRole(member.role)}
            </span>
          </div>
        </div>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-300",
            isExpanded && "rotate-180"
          )} 
        />
      </button>

      {/* Expanded content */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
          {/* Contact info */}
          <div className="space-y-2">
            {member.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4 shrink-0 text-primary-500" />
                <a href={`tel:${member.phone}`} className="hover:underline hover:text-primary-600">
                  {formatPhone(member.phone)}
                </a>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4 shrink-0 text-primary-500" />
                <span>{member.email}</span>
              </div>
            )}
            {member.yahrzeitDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4 shrink-0 text-primary-500" />
                <span>יארצייט: {member.yahrzeitDate}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">הערות:</p>
              {member.notes}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Link
              href={`/members/${member.id}/edit`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Edit className="h-4 w-4" />
              עריכה
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(member);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              מחיקה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
