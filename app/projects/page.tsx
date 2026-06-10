"use client";

import { useProjectFlowData } from "@/hooks/useLocalStorage";
import { Project, ProjectStatus, TeamMember, ProjectTask, PricingMode } from "@/types";
import { 
  FolderKanban, Plus, Search, Trash2, Edit2, X, Calendar, 
  DollarSign, Link as LinkIcon, FileText, CheckCircle2, 
  ChevronRight, Users, PlusCircle, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProjectsPage() {
  const { projects, saveProjects, team, isLoaded } = useProjectFlowData();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("not_started");
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [notes, setNotes] = useState("");
  const [pricingMode, setPricingMode] = useState<PricingMode>("fixed");
  
  // Fixed pricing field
  const [fixedPrice, setFixedPrice] = useState<number>(0);
  
  // Task pricing list (live state during form edit/creation)
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskPrice, setNewTaskPrice] = useState<number>(0);
  
  // Assigned Team Members IDs
  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);

  const [formError, setFormError] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-semibold">جاري تحميل صفحة المشاريع...</p>
      </div>
    );
  }

  // Cost calculator
  const getProjectCost = (project: Project) => {
    if (project.pricingMode === "fixed") {
      return project.fixedPrice || 0;
    }
    return project.tasks.reduce((sum, t) => sum + (t.price || 0), 0);
  };

  // Open add modal
  const handleOpenAdd = () => {
    setEditingProject(null);
    setName("");
    setClientName("");
    setClientPhone("");
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setDueDate("");
    
    setStatus("not_started");
    setGoogleDriveLink("");
    setNotes("");
    setPricingMode("fixed");
    setFixedPrice(0);
    setTasks([]);
    setAssignedMembers([]);
    setFormError("");
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setClientName(project.clientName);
    setClientPhone(project.clientPhone);
    setStartDate(project.startDate);
    setDueDate(project.dueDate);
    setStatus(project.status);
    setGoogleDriveLink(project.googleDriveLink || "");
    setNotes(project.notes || "");
    setPricingMode(project.pricingMode);
    setFixedPrice(project.fixedPrice || 0);
    setTasks(project.tasks || []);
    setAssignedMembers(project.assignedMembers || []);
    setFormError("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  // Add Task to dynamic list in Form
  const handleAddTask = () => {
    if (!newTaskName.trim()) {
      alert("يرجى إدخال اسم المهمة.");
      return;
    }
    const task: ProjectTask = {
      id: "task-" + Date.now() + Math.random().toString(36).substr(2, 4),
      name: newTaskName,
      price: newTaskPrice || 0,
      status: "not_started"
    };
    setTasks([...tasks, task]);
    setNewTaskName("");
    setNewTaskPrice(0);
  };

  // Remove Task from dynamic list in Form
  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Toggle assigned team member ID
  const handleToggleMember = (memberId: string) => {
    if (assignedMembers.includes(memberId)) {
      setAssignedMembers(assignedMembers.filter(id => id !== memberId));
    } else {
      setAssignedMembers([...assignedMembers, memberId]);
    }
  };

  // Save Project Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !clientName.trim() || !clientPhone.trim() || !startDate || !dueDate) {
      setFormError("يرجى تعبئة جميع الحقول الإلزامية المحددة بالنجمة (*).");
      return;
    }

    if (editingProject) {
      // Edit mode
      const updated = projects.map(p => 
        p.id === editingProject.id 
          ? {
              ...p,
              name,
              clientName,
              clientPhone,
              startDate,
              dueDate,
              status,
              googleDriveLink,
              notes,
              pricingMode,
              fixedPrice: pricingMode === "fixed" ? fixedPrice : 0,
              tasks: pricingMode === "task" ? tasks : [],
              assignedMembers
            }
          : p
      );
      saveProjects(updated);
    } else {
      // Add mode
      const newProj: Project = {
        id: "project-" + Date.now(),
        name,
        clientName,
        clientPhone,
        startDate,
        dueDate,
        status,
        googleDriveLink,
        notes,
        pricingMode,
        fixedPrice: pricingMode === "fixed" ? fixedPrice : 0,
        tasks: pricingMode === "task" ? tasks : [],
        assignedMembers
      };
      saveProjects([...projects, newProj]);
    }

    handleCloseModal();
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع المهام الفرعية الخاصة به أيضاً.")) {
      const updated = projects.filter(p => p.id !== id);
      saveProjects(updated);
    }
  };

  // Live total sum computed in project list or form
  const getTasksSumPrice = () => {
    return tasks.reduce((sum, t) => sum + (t.price || 0), 0);
  };

  // Search & Filter execution
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status badging configs
  const statusConfig = {
    not_started: { label: "لم يبدأ", bg: "bg-slate-100 text-slate-700 border-slate-200" },
    in_progress: { label: "قيد التنفيذ", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    completed: { label: "مكتمل", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "ملغي", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <FolderKanban className="text-blue-600" size={28} />
            <span>المشاريع</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">عرض وتعديل كافة المشاريع الحالية، التسعير، وإسناد المهام لأعضاء الفريق.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-100 self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          <span>إضافة مشروع جديد</span>
        </button>
      </div>

      {/* Filters & Search bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:max-w-md bg-white rounded-xl shadow-sm border border-slate-200">
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="ابحث باسم المشروع أو العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-11 pl-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-sm font-medium"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "الكل" },
            { id: "not_started", label: "لم يبدأ" },
            { id: "in_progress", label: "قيد التنفيذ" },
            { id: "completed", label: "مكتمل" },
            { id: "cancelled", label: "ملغي" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                statusFilter === f.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <FolderKanban size={48} className="mx-auto text-slate-300" />
            <p className="font-bold text-base">لا توجد مشاريع مسجلة حالياً</p>
            <p className="text-xs text-slate-400">قم بإضافة مشروعك الأول للبدء في إدارته وتتبعه.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-400 text-xs font-bold">
                  <th className="px-6 py-4">اسم المشروع</th>
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">التكلفة الإجمالية</th>
                  <th className="px-6 py-4">تاريخ التسليم</th>
                  <th className="px-6 py-4">حالة المشروع</th>
                  <th className="px-6 py-4">فريق العمل</th>
                  <th className="px-6 py-4 text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProjects.map((project) => {
                  const status = statusConfig[project.status] || { label: project.status, bg: "bg-slate-100 text-slate-700" };
                  const cost = getProjectCost(project);
                  
                  return (
                    <tr key={project.id} className="hover:bg-slate-50/40 transition group">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <Link href={`/projects/${project.id}`} className="hover:text-blue-600 block">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-700 block">{project.clientName}</span>
                          <span className="text-[10px] text-slate-400 font-medium block">{project.clientPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">${cost.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{project.dueDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${status.bg}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {project.assignedMembers.length === 0 ? (
                            <span className="text-[10px] text-slate-400 font-semibold">غير مخصص</span>
                          ) : (
                            <div className="flex -space-x-2 space-x-reverse">
                              {project.assignedMembers.slice(0, 3).map((mId) => {
                                const member = team.find(t => t.id === mId);
                                if (!member) return null;
                                return (
                                  <div
                                    key={mId}
                                    title={member.name}
                                    className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                                  >
                                    {member.name.charAt(0)}
                                  </div>
                                );
                              })}
                              {project.assignedMembers.length > 3 && (
                                <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 border-2 border-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                                  +{project.assignedMembers.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/projects/${project.id}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="التفاصيل والمهام"
                          >
                            <ChevronRight size={16} className="rotate-180" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(project)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="تعديل المشروع"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="حذف المشروع"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Project Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingProject ? `تعديل بيانات: ${editingProject.name}` : "إضافة مشروع جديد للعمل"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-150 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Basic details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اسم المشروع الجديد *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: متجر الهواتف الذكية"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">حالة المشروع الحالية *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
                  >
                    <option value="not_started">لم يبدأ</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* 2. Client Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الشخص أو الشركة العميلة"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رقم هاتف العميل للتواصل *</label>
                  <input
                    type="tel"
                    required
                    placeholder="رقم الهاتف للتواصل"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* 3. Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">تاريخ استلام المشروع *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">تاريخ التسليم المتوقع *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* 4. Pricing Option */}
              <div className="space-y-3 p-4 bg-blue-50/40 rounded-2xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 block">طريقة تسعير المشروع</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPricingMode("fixed")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                        pricingMode === "fixed"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      سعر ثابت (Fixed)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingMode("task")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                        pricingMode === "task"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      تسعير بالمهام (Task-based)
                    </button>
                  </div>
                </div>

                {pricingMode === "fixed" ? (
                  <div className="space-y-1 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="text-xs font-bold text-slate-600 block">قيمة العقد بالكامل ($) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                        <DollarSign size={16} />
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={fixedPrice}
                        onChange={(e) => setFixedPrice(Number(e.target.value))}
                        className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-slate-600">إضافة المهام لتسعير المشروع:</p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="اسم المهمة الفرعية (مثال: البرمجة)"
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                        />
                        <div className="relative w-full sm:w-36">
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                            <DollarSign size={12} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            placeholder="السعر"
                            value={newTaskPrice || ""}
                            onChange={(e) => setNewTaskPrice(Number(e.target.value))}
                            className="w-full pr-7 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddTask}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center justify-center gap-1.5 active:scale-95 transition"
                        >
                          <PlusCircle size={14} />
                          <span>إضافة</span>
                        </button>
                      </div>
                    </div>

                    {/* Task List */}
                    {tasks.length === 0 ? (
                      <p className="text-center py-4 text-xs font-semibold text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
                        لم يتم إضافة أي مهمة. قم بإدخال المهام في الحقل أعلاه لتسعير المشروع.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {tasks.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                              <span>{t.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-blue-600">${t.price}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTask(t.id)}
                                  className="text-rose-500 hover:text-rose-700 p-0.5 hover:bg-rose-50 rounded"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* live total sum */}
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-200/50 rounded-xl text-xs font-extrabold text-slate-700">
                          <span>المجموع التلقائي:</span>
                          <span className="text-slate-900 font-extrabold text-sm">${getTasksSumPrice().toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 5. Team Assignment */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">إسناد وتعيين الفريق للمشروع</label>
                {team.length === 0 ? (
                  <p className="text-xs font-semibold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>لا توجد أعضاء فريق مسجلين في النظام. يرجى إضافة أعضاء فريق أولاً من صفحة الفريق لتتمكن من إسنادهم.</span>
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    {team.map((member) => {
                      const isChecked = assignedMembers.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition select-none ${
                            isChecked
                              ? "bg-blue-50/50 border-blue-400 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled by div click
                            className="pointer-events-none rounded text-blue-600 border-slate-300"
                          />
                          <div className="truncate">
                            <p className="truncate block font-bold leading-none">{member.name}</p>
                            <span className="text-[9px] text-slate-400 font-medium block mt-0.5">{member.specialization}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. Drive Link & Notes */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">رابط Google Drive للمشروع (إن وجد)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
                      <LinkIcon size={16} />
                    </span>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={googleDriveLink}
                      onChange={(e) => setGoogleDriveLink(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">ملاحظات إضافية حول المشروع</label>
                  <textarea
                    rows={3}
                    placeholder="اكتب ملاحظات حول متطلبات العميل، المدفوعات، أو أي تفاصيل أخرى..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-100"
                >
                  {editingProject ? "حفظ التعديلات" : "إنشاء المشروع"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
