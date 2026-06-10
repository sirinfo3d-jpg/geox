"use client";

import { useProjectFlowData } from "@/hooks/useLocalStorage";
import { FolderKanban, Activity, CheckCircle2, DollarSign, Calendar, Users, ChevronRight, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { projects, team, isLoaded } = useProjectFlowData();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-semibold">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  // Calculate project cost helper
  const getProjectCost = (project: typeof projects[0]) => {
    if (project.pricingMode === "fixed") {
      return project.fixedPrice || 0;
    }
    return project.tasks.reduce((sum, task) => sum + (task.price || 0), 0);
  };

  // Metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(p => p.status === "in_progress").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const cancelledProjects = projects.filter(p => p.status === "cancelled").length;
  
  const totalRevenue = projects.reduce((sum, project) => sum + getProjectCost(project), 0);

  // Status mapping for badge colors
  const statusConfig = {
    not_started: { label: "لم يبدأ", bg: "bg-slate-100 text-slate-700 border-slate-200" },
    in_progress: { label: "قيد التنفيذ", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "مكتمل", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "ملغي", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">لوحة التحكم العامة</h2>
          <p className="text-slate-500 text-sm mt-1">نظرة عامة على مشاريعك الحالية، الإيرادات، وأداء فريق العمل.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold self-start md:self-auto shadow-sm">
          <Calendar size={15} className="text-blue-500" />
          <span>اليوم: {new Date().toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Projects */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-blue-300 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold block">إجمالي المشاريع</span>
            <span className="text-3xl font-extrabold text-slate-800 block">{totalProjects}</span>
            <span className="text-[10px] text-slate-400 font-medium block">جميع المشاريع المسجلة بالنظام</span>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl transition duration-300 group-hover:bg-blue-600 group-hover:text-white">
            <FolderKanban size={24} className="stroke-[2]" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-amber-300 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold block">مشاريع قيد التنفيذ</span>
            <span className="text-3xl font-extrabold text-slate-800 block">{inProgressProjects}</span>
            <span className="text-[10px] text-slate-400 font-medium block">تجري العمليات عليها الآن</span>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl transition duration-300 group-hover:bg-amber-500 group-hover:text-white">
            <Activity size={24} className="stroke-[2]" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold block">المشاريع المكتملة</span>
            <span className="text-3xl font-extrabold text-slate-800 block">{completedProjects}</span>
            <span className="text-[10px] text-slate-400 font-medium block">تم إنجازها وتسليمها بالكامل</span>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
            <CheckCircle2 size={24} className="stroke-[2]" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition duration-300">
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-semibold block">إجمالي الإيرادات</span>
            <span className="text-3xl font-extrabold text-indigo-700 block">${totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium block">القيمة الإجمالية للمبيعات والمشاريع</span>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl transition duration-300 group-hover:bg-indigo-600 group-hover:text-white">
            <DollarSign size={24} className="stroke-[2]" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600"></div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">أحدث المشاريع</h3>
              <p className="text-xs text-slate-400">آخر 5 مشاريع تم تسجيلها في النظام</p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              <span>عرض جميع المشاريع</span>
              <ChevronRight size={14} className="rotate-180" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {projects.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                لا توجد مشاريع مضافة حالياً.
              </div>
            ) : (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold">
                    <th className="pb-3 text-right">المشروع</th>
                    <th className="pb-3 text-right">العميل</th>
                    <th className="pb-3 text-right">تاريخ التسليم</th>
                    <th className="pb-3 text-right">التكلفة</th>
                    <th className="pb-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {projects.slice(0, 5).map((project) => {
                    const status = statusConfig[project.status] || { label: project.status, bg: "bg-slate-100 text-slate-700" };
                    return (
                      <tr key={project.id} className="hover:bg-slate-50/50 group transition duration-150">
                        <td className="py-4 font-bold text-slate-700 group-hover:text-blue-600">
                          <Link href={`/projects/${project.id}`} className="block">
                            {project.name}
                          </Link>
                        </td>
                        <td className="py-4 text-slate-500 font-medium">{project.clientName}</td>
                        <td className="py-4 text-slate-500 text-xs">{project.dueDate}</td>
                        <td className="py-4 font-semibold text-slate-800">${getProjectCost(project).toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Team Activity and Sidebar Info */}
        <div className="space-y-6">
          {/* Team Quick Info */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">أعضاء الفريق</h3>
                <p className="text-xs text-slate-400">فريق عمل المشروع النشط ({team.length} أعضاء)</p>
              </div>
              <Link
                href="/team"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
              >
                <span>إدارة الفريق</span>
                <ChevronRight size={14} className="rotate-180" />
              </Link>
            </div>

            <div className="space-y-4">
              {team.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  لم يتم إضافة أعضاء فريق بعد.
                </div>
              ) : (
                team.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition duration-150">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-100 shadow-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 text-sm block">{member.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">{member.specialization}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{member.phone}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg p-6 space-y-4 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -left-10 -top-10 w-28 h-28 bg-white/5 rounded-full blur-lg"></div>

            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-100 stroke-[2.5]" />
              <h4 className="font-extrabold text-sm tracking-wide">ملخص الأداء المالي</h4>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-blue-100 font-semibold">متوسط تكلفة المشاريع المضافة</p>
              <h3 className="text-3xl font-extrabold">
                ${totalProjects > 0 ? Math.round(totalRevenue / totalProjects).toLocaleString() : 0}
              </h3>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between text-xs font-medium text-blue-100">
              <span>المشاريع الملغاة: {cancelledProjects}</span>
              <span>نسبة الإكمال: {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
