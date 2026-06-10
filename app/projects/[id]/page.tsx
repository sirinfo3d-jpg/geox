"use client";

import React, { use, useState } from "react";
import { useProjectFlowData } from "@/hooks/useLocalStorage";
import { Project, ProjectStatus, TeamMember, ProjectTask, TaskStatus } from "@/types";
import { 
  FolderKanban, ArrowRight, Calendar, DollarSign, 
  ExternalLink, FileText, Smartphone, Users, PlusCircle, 
  Trash2, CheckCircle2, Circle, Clock, CheckSquare, Sparkles,
  PhoneCall
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailsPage(props: PageProps) {
  const params = use(props.params);
  const router = useRouter();
  const { projects, saveProjects, team, isLoaded } = useProjectFlowData();

  // Find current project
  const project = projects.find(p => p.id === params.id);

  // States for adding tasks in details page
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPrice, setNewTaskPrice] = useState<number>(0);
  const [newTaskDescription, setNewTaskDescription] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-semibold">جاري تحميل تفاصيل المشروع...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-rose-500 text-5xl">⚠️</div>
        <h3 className="font-extrabold text-xl text-slate-800">المشروع غير موجود!</h3>
        <p className="text-slate-500 text-xs">ربما تم حذفه أو أن الرابط غير صحيح.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700">
          <ArrowRight size={14} className="rotate-180" />
          <span>العودة لصفحة المشاريع</span>
        </Link>
      </div>
    );
  }

  // Calculate project cost helper
  const getProjectCost = (p: Project) => {
    if (p.pricingMode === "fixed") {
      return p.fixedPrice || 0;
    }
    return p.tasks.reduce((sum, t) => sum + (t.price || 0), 0);
  };

  // Status mapping
  const statusConfig = {
    not_started: { label: "لم يبدأ", bg: "bg-slate-100 text-slate-700 border-slate-200" },
    in_progress: { label: "قيد التنفيذ", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "مكتمل", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "ملغي", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  // Tasks Progress Calculation
  const totalTasksCount = project.tasks.length;
  const completedTasksCount = project.tasks.filter(t => t.status === "completed").length;
  
  let progressPercentage = 0;
  if (totalTasksCount > 0) {
    progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);
  } else {
    // If no tasks, deduce from project status
    if (project.status === "completed") progressPercentage = 100;
    else if (project.status === "in_progress") progressPercentage = 50;
    else progressPercentage = 0;
  }

  // Update Project Status
  const handleUpdateStatus = (newStatus: ProjectStatus) => {
    const updated = projects.map(p => 
      p.id === project.id ? { ...p, status: newStatus } : p
    );
    saveProjects(updated);
  };

  // Add a task directly to the project tasks array
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      alert("يرجى إدخال اسم المهمة.");
      return;
    }

    const newTask: ProjectTask = {
      id: "task-" + Date.now(),
      name: newTaskName.trim(),
      description: newTaskDescription.trim() || undefined,
      price: newTaskPrice || 0,
      status: "not_started"
    };

    const updatedProject = {
      ...project,
      tasks: [...project.tasks, newTask]
    };

    // Update status to in_progress if it was not started and tasks are added
    if (project.status === "not_started") {
      updatedProject.status = "in_progress";
    }

    const updatedProjectsList = projects.map(p => p.id === project.id ? updatedProject : p);
    saveProjects(updatedProjectsList);

    // Reset inputs
    setNewTaskName("");
    setNewTaskPrice(0);
    setNewTaskDescription("");
  };

  // Delete task from project
  const handleDeleteTask = (taskId: string) => {
    if (confirm("هل تريد حذف هذه المهمة؟")) {
      const updatedProject = {
        ...project,
        tasks: project.tasks.filter(t => t.id !== taskId)
      };
      const updatedProjectsList = projects.map(p => p.id === project.id ? updatedProject : p);
      saveProjects(updatedProjectsList);
    }
  };

  // Toggle Task Status (cycle through status: not_started -> in_progress -> completed)
  const handleToggleTaskStatus = (taskId: string, currentStatus: TaskStatus) => {
    let nextStatus: TaskStatus = "not_started";
    if (currentStatus === "not_started") nextStatus = "in_progress";
    else if (currentStatus === "in_progress") nextStatus = "completed";
    else nextStatus = "not_started";

    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, status: nextStatus } : t
    );

    const updatedProject = {
      ...project,
      tasks: updatedTasks
    };

    // Auto-complete project if all tasks are complete
    const totalCount = updatedTasks.length;
    const completedCount = updatedTasks.filter(t => t.status === "completed").length;
    if (totalCount > 0 && completedCount === totalCount) {
      updatedProject.status = "completed";
    }

    const updatedProjectsList = projects.map(p => p.id === project.id ? updatedProject : p);
    saveProjects(updatedProjectsList);
  };

  // Delete project
  const handleDeleteProject = () => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المشروع بالكامل بشكل نهائي؟")) {
      const updated = projects.filter(p => p.id !== project.id);
      saveProjects(updated);
      router.push("/projects");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-2">
          <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition">
            <ArrowRight size={14} />
            <span>العودة إلى المشاريع</span>
          </Link>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">{project.name}</h2>
          <p className="text-slate-400 text-xs font-medium">الرمز التعريفي: {project.id}</p>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
            <span className="text-slate-500">الحالة:</span>
            <select
              value={project.status}
              onChange={(e) => handleUpdateStatus(e.target.value as ProjectStatus)}
              className="focus:outline-none bg-transparent text-blue-600 font-extrabold cursor-pointer"
            >
              <option value="not_started">لم يبدأ</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <button
            onClick={handleDeleteProject}
            className="flex items-center justify-center p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition border border-rose-150"
            title="حذف المشروع بالكامل"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar & Summary Stats Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              <span>معدل إنجاز المشروع</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {totalTasksCount > 0 
                ? `تم إنجاز ${completedTasksCount} مهمة من أصل ${totalTasksCount}`
                : "يتم احتساب النسبة بناءً على حالة المشروع الحالية"
              }
            </p>
          </div>
          <span className="text-2xl font-extrabold text-blue-600 self-start sm:self-auto">{progressPercentage}%</span>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Grid: Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Client Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Smartphone className="text-blue-500" size={16} />
            <span>بيانات العميل</span>
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">الاسم</span>
              <span className="font-bold text-slate-700 text-sm block">{project.clientName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">رقم الهاتف</span>
              <a 
                href={`tel:${project.clientPhone}`} 
                className="font-bold text-blue-600 hover:underline text-sm flex items-center gap-1.5 w-fit mt-0.5"
              >
                <PhoneCall size={12} />
                <span>{project.clientPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Pricing details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <DollarSign className="text-blue-500" size={16} />
            <span>الملخص المالي والتسعير</span>
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">نوع التسعير</span>
              <span className="font-bold text-slate-700 text-sm block">
                {project.pricingMode === "fixed" ? "سعر ثابت للمشروع" : "تسعير تراكمي بالمهام"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">التكلفة الإجمالية للمشروع</span>
              <span className="text-lg font-extrabold text-emerald-600 block">
                ${getProjectCost(project).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Google Drive & Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Calendar className="text-blue-500" size={16} />
            <span>الجدول الزمني وروابط الملفات</span>
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">البداية</span>
                <span className="font-bold text-slate-700 text-xs block">{project.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">التسليم</span>
                <span className="font-bold text-slate-700 text-xs block">{project.dueDate}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block mb-1">رابط Google Drive</span>
              {project.googleDriveLink ? (
                <a
                  href={project.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                >
                  <ExternalLink size={12} />
                  <span>فتح المجلد المشترك</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 font-semibold italic block">لا يتوفر رابط</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Team Assignment & Project Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Team Members */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Users className="text-blue-500" size={16} />
            <span>الفريق المخصص للمشروع ({project.assignedMembers.length})</span>
          </h4>
          
          {project.assignedMembers.length === 0 ? (
            <p className="text-xs text-slate-400 italic font-medium">لم يتم إسناد أي عضو لهذا المشروع.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {project.assignedMembers.map((mId) => {
                const member = team.find(t => t.id === mId);
                if (!member) return null;
                return (
                  <div key={mId} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs border border-blue-100">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">{member.name}</span>
                      <span className="text-[9px] text-slate-400 font-medium block">{member.specialization}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Project Notes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <h4 className="font-extrabold text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <FileText className="text-blue-500" size={16} />
            <span>ملاحظات المشروع</span>
          </h4>
          {project.notes ? (
            <p className="text-sm font-semibold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
              {project.notes}
            </p>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">لا توجد ملاحظات مسجلة للمشروع.</p>
          )}
        </div>
      </div>

      {/* Tasks Manager Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h4 className="font-extrabold text-lg text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <CheckSquare className="text-blue-600" size={20} />
          <span>إدارة مهام المشروع</span>
        </h4>

        {/* Task lists & Action toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* List of Tasks */}
          <div className="lg:col-span-2 space-y-3">
            {project.tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm space-y-2 border border-dashed border-slate-200 rounded-2xl">
                <CheckSquare size={32} className="mx-auto text-slate-300" />
                <p className="font-bold">لم تضاف أي مهام بعد في هذا المشروع</p>
                <p className="text-xs text-slate-400">يمكنك استخدام النموذج لإضافة مهمتك الأولى والبدء في تعقبها.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task) => {
                  let statusLabel = "لم تبدأ";
                  let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
                  let Icon = Circle;

                  if (task.status === "in_progress") {
                    statusLabel = "جاري التنفيذ";
                    statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                    Icon = Clock;
                  } else if (task.status === "completed") {
                    statusLabel = "مكتملة";
                    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    Icon = CheckCircle2;
                  }

                  return (
                    <div 
                      key={task.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-350 transition duration-150 gap-4 ${
                        task.status === "completed" ? "bg-slate-50/40" : ""
                      }`}
                    >
                      {/* Left: Check Status & Task details */}
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`mt-1 p-0.5 rounded-full transition ${
                            task.status === "completed" ? "text-emerald-500 hover:text-slate-400" : "text-slate-400 hover:text-blue-500"
                          }`}
                          title="تغيير حالة المهمة"
                        >
                          <Icon size={18} className="stroke-[2.5]" />
                        </button>
                        <div className="space-y-1">
                          <span className={`font-bold text-sm block ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                            {task.name}
                          </span>
                          {task.description && (
                            <span className="text-[10px] text-slate-400 font-medium block leading-normal">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Cost, Status Badge & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                        {project.pricingMode === "task" && (
                          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                            ${task.price}
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border cursor-pointer hover:shadow-sm ${statusColor}`}
                        >
                          {statusLabel}
                        </button>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition"
                          title="حذف المهمة"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Task Form */}
          <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4">
            <h5 className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
              <PlusCircle size={15} className="text-blue-600" />
              <span>إضافة مهمة جديدة</span>
            </h5>

            <form onSubmit={handleAddTask} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">اسم المهمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تصميم الشعار"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              {project.pricingMode === "task" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">تكلفة المهمة ($) *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs">
                      <DollarSign size={13} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="السعر"
                      value={newTaskPrice || ""}
                      onChange={(e) => setNewTaskPrice(Number(e.target.value))}
                      className="w-full pr-7 pl-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block">وصف المهمة (اختياري)</label>
                <textarea
                  rows={2}
                  placeholder="وصف تفصيلي مبسط للمهمة..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                إضافة المهمة
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
