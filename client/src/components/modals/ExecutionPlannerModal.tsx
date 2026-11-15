import React, { useState } from 'react';
import { X, CalendarCheck, Plus, CheckCircle2, Circle, Clock, Check } from 'lucide-react';
import { updateExecutionPlanner } from '../../services/api';
import { ExecutionPlanner, ExecutionTask } from '../../types';

interface ExecutionPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  planner: ExecutionPlanner;
  onPlannerUpdate: (planner: ExecutionPlanner) => void;
}

export const ExecutionPlannerModal: React.FC<ExecutionPlannerModalProps> = ({
  isOpen,
  onClose,
  planner,
  onPlannerUpdate
}) => {
  const [activePriority, setActivePriority] = useState<'must' | 'should' | 'optional'>('must');
  const [taskTitle, setTaskTitle] = useState('');
  const [timeEst, setTimeEst] = useState(25);
  const [category, setCategory] = useState('Skill Development');

  if (!isOpen) return null;

  const toggleTask = async (listKey: keyof ExecutionPlanner, taskId: string) => {
    const updated = {
      ...planner,
      [listKey]: planner[listKey].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    };
    onPlannerUpdate(updated);
    await updateExecutionPlanner(updated);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: ExecutionTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      timeEst,
      completed: false,
      category
    };

    let targetKey: keyof ExecutionPlanner = 'todayMustDo';
    if (activePriority === 'should') targetKey = 'todayShouldDo';
    if (activePriority === 'optional') targetKey = 'todayOptional';

    const updated = {
      ...planner,
      [targetKey]: [...planner[targetKey], newTask]
    };

    onPlannerUpdate(updated);
    setTaskTitle('');
    await updateExecutionPlanner(updated);
  };

  const totalEstimatedMinutes = [
    ...planner.todayMustDo,
    ...planner.todayShouldDo,
    ...planner.todayOptional
  ].reduce((acc, curr) => acc + (curr.completed ? 0 : curr.timeEst), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-canvas-card border border-canvas-border w-full max-w-xl rounded-2xl shadow-warm-xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-canvas-border flex items-center justify-between bg-canvas-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-50 border border-forest-200 text-forest-700">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm md:text-base">
                Personal Execution Planner
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Lightweight priority alignment • ~{totalEstimatedMinutes} mins pending today
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-charcoal-400 hover:text-charcoal-700 rounded-lg hover:bg-canvas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Priority Tiers */}
          <div className="space-y-4">
            {/* Must Do */}
            <div className="bg-canvas-subtle/70 rounded-xl p-3 border border-canvas-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                  Must Do (Non-Negotiable)
                </span>
                <span className="text-[10px] text-charcoal-400 font-semibold">
                  {planner.todayMustDo.filter(t => t.completed).length}/{planner.todayMustDo.length} Done
                </span>
              </div>
              <div className="space-y-1.5">
                {planner.todayMustDo.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask('todayMustDo', task.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-canvas-card border border-canvas-border hover:border-canvas-border-strong cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-charcoal-300 shrink-0" />
                      )}
                      <span className={`truncate ${task.completed ? 'line-through text-charcoal-400' : 'text-charcoal-900 font-medium'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-charcoal-400 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {task.timeEst}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Should Do */}
            <div className="bg-canvas-subtle/70 rounded-xl p-3 border border-canvas-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ochre-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ochre-500" />
                  Should Do (Important Momentum)
                </span>
                <span className="text-[10px] text-charcoal-400 font-semibold">
                  {planner.todayShouldDo.filter(t => t.completed).length}/{planner.todayShouldDo.length} Done
                </span>
              </div>
              <div className="space-y-1.5">
                {planner.todayShouldDo.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask('todayShouldDo', task.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-canvas-card border border-canvas-border hover:border-canvas-border-strong cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-charcoal-300 shrink-0" />
                      )}
                      <span className={`truncate ${task.completed ? 'line-through text-charcoal-400' : 'text-charcoal-900 font-medium'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-charcoal-400 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {task.timeEst}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional */}
            <div className="bg-canvas-subtle/70 rounded-xl p-3 border border-canvas-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-charcoal-400" />
                  Optional (Bonus Energy)
                </span>
                <span className="text-[10px] text-charcoal-400 font-semibold">
                  {planner.todayOptional.filter(t => t.completed).length}/{planner.todayOptional.length} Done
                </span>
              </div>
              <div className="space-y-1.5">
                {planner.todayOptional.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask('todayOptional', task.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-canvas-card border border-canvas-border hover:border-canvas-border-strong cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-charcoal-300 shrink-0" />
                      )}
                      <span className={`truncate ${task.completed ? 'line-through text-charcoal-400' : 'text-charcoal-900 font-medium'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-charcoal-400 shrink-0 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {task.timeEst}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddTask} className="p-3 bg-canvas-card rounded-xl border border-canvas-border space-y-2.5">
            <span className="text-xs font-bold text-charcoal-800 block">Add Quick Task</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task description..."
                className="flex-1 bg-canvas-subtle border border-canvas-border rounded-lg px-2.5 py-1.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
              />
              <select
                value={activePriority}
                onChange={(e) => setActivePriority(e.target.value as any)}
                className="bg-canvas-subtle border border-canvas-border rounded-lg px-2 py-1.5 text-xs text-charcoal-800"
              >
                <option value="must">Must</option>
                <option value="should">Should</option>
                <option value="optional">Optional</option>
              </select>
              <input
                type="number"
                value={timeEst}
                onChange={(e) => setTimeEst(parseInt(e.target.value, 10) || 15)}
                className="w-16 bg-canvas-subtle border border-canvas-border rounded-lg px-2 py-1.5 text-xs text-charcoal-900 font-mono"
                title="Estimated minutes"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-xs font-bold transition-all"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
