'use client';

import React from 'react';
import { Milestone } from '@/app/types';
import { Calendar, CheckCircle2, Clock, Play, HelpCircle } from 'lucide-react';

interface GanttViewProps {
  milestones: Milestone[];
  currentMilestoneIndex: number;
}

export default function GanttView({ milestones, currentMilestoneIndex }: GanttViewProps) {
  // If no milestones are provided, show an empty helper state
  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-3">
        <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto" />
        <p className="text-zinc-500 text-xs">No milestones loaded for Gantt schedule tracking.</p>
      </div>
    );
  }

  // Calculate timeline slots dynamically so they expand with milestones
  const milestoneCount = milestones.length;
  const slotsPerMilestone = 1.5;
  const totalSlots = Math.max(6, Math.ceil(milestoneCount * slotsPerMilestone + 1));
  const timeLabels = Array.from({ length: totalSlots }, (_, i) => `W${i + 1}`);

  // Dynamic helper for milestone sequence positioning
  const getMilestoneLayout = (idx: number) => {
    const duration = 2; // each milestone spans 2 columns
    const start = idx * slotsPerMilestone;
    
    const colorGradients = [
      'from-emerald-500 to-teal-500',
      'from-indigo-650 to-violet-500',
      'from-sky-500 to-blue-500',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-500',
      'from-purple-500 to-fuchsia-500'
    ];
    const color = colorGradients[idx % colorGradients.length];
    return { start, duration, color };
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm overflow-hidden text-xs transition-colors">
      
      {/* Title block with indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            Project Schedule & Gantt Timeline
          </h4>
          <p className="text-zinc-500 text-[10px] mt-0.5">Track deliverables cascade, payments, and development phases.</p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex flex-wrap gap-3 text-[9px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span>Settled / Paid</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-zinc-900 dark:bg-zinc-300 rounded-full"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full"></span>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[650px] space-y-3">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
            <div className="col-span-5">Milestone Stage</div>
            <div className="col-span-7 grid" style={{ gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))` }}>
              {timeLabels.map((week, idx) => (
                <div key={idx} className="border-l border-zinc-200 dark:border-zinc-800/60 first:border-l-0 text-center py-0.5 font-mono text-[9px]">
                  {week}
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Lanes */}
          {milestones.map((mil, idx) => {
            const { start, duration, color } = getMilestoneLayout(idx);
            
            let statusText = 'Pending';
            let statusBadge = 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800';
            let icon = <Clock className="w-3 h-3" />;
            let isCurrent = idx === currentMilestoneIndex;

            if (mil.status === 'Approved') {
              statusText = 'Approved & Paid';
              statusBadge = 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
              icon = <CheckCircle2 className="w-3 h-3" />;
            } else if (mil.status === 'Awaiting Approval') {
              statusText = 'Review Required';
              statusBadge = 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-550/10 dark:border-amber-500/20';
              icon = <Play className="w-3 h-3 animate-pulse" />;
            } else if (isCurrent) {
              statusText = 'Active Phase';
              statusBadge = 'text-zinc-900 bg-zinc-100 border-zinc-300 dark:text-white dark:bg-zinc-800 dark:border-zinc-700';
              icon = <Play className="w-3 h-3" />;
            }

            return (
              <div 
                key={mil.id} 
                className={`grid grid-cols-12 items-center py-2.5 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 shadow-sm p-1.5' 
                    : 'bg-transparent border-transparent'
                }`}
              >
                
                {/* Milestone text details */}
                <div className="col-span-5 space-y-0.5 pr-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-zinc-950 dark:text-white truncate max-w-[160px]" title={mil.title}>
                      {mil.title}
                    </span>
                    <span className={`px-1.5 py-0.5 border rounded text-[8px] font-black uppercase flex items-center gap-0.5 ${statusBadge}`}>
                      {icon}
                      {statusText}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Due: {mil.dueDate}</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-400">
                      {mil.cost.toLocaleString()} BDT ({mil.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Horizontal lane timeline */}
                <div 
                  className="col-span-7 h-6 relative bg-zinc-100 dark:bg-zinc-950/20 rounded border border-zinc-200 dark:border-zinc-800/40"
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${totalSlots}, minmax(0, 1fr))` }}
                >
                  
                  {/* Vertical Guideline borders */}
                  {Array.from({ length: totalSlots - 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-zinc-200 dark:border-zinc-800/20"
                      style={{ left: `${((i + 1) / totalSlots) * 100}%` }}
                    />
                  ))}

                  {/* Colored Timeline Bar */}
                  <div
                    className={`absolute top-1 bottom-1 rounded bg-gradient-to-r ${color} shadow-sm opacity-85 transition-all`}
                    style={{
                      left: `${(start / totalSlots) * 100}%`,
                      width: `${(duration / totalSlots) * 100}%`
                    }}
                  >
                    {/* Inner completion overlay */}
                    <div
                      className={`h-full rounded flex items-center justify-end pr-2 text-[8px] font-black text-white ${
                        mil.status === 'Approved' ? 'bg-emerald-600' : 'bg-white/10'
                      }`}
                      style={{
                        width: `${mil.status === 'Approved' ? 100 : (isCurrent ? 50 : 0)}%`
                      }}
                    >
                      {mil.status === 'Approved' ? '100%' : (isCurrent ? '50%' : '')}
                    </div>
                  </div>
                  
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
