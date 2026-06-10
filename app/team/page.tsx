"use client";

import { useProjectFlowData } from "@/hooks/useLocalStorage";
import { TeamMember } from "@/types";
import { Users, UserPlus, Trash2, Edit2, Search, X, Smartphone, Briefcase, User } from "lucide-react";
import { useState } from "react";

export default function TeamPage() {
  const { team, saveTeam, isLoaded } = useProjectFlowData();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-semibold">جاري تحميل صفحة الفريق...</p>
      </div>
    );
  }

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingMember(null);
    setName("");
    setSpecialization("");
    setPhone("");
    setError("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setSpecialization(member.specialization);
    setPhone(member.phone);
    setError("");
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !specialization.trim() || !phone.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    if (editingMember) {
      // Edit mode
      const updatedTeam = team.map(m => 
        m.id === editingMember.id 
          ? { ...m, name, specialization, phone } 
          : m
      );
      saveTeam(updatedTeam);
    } else {
      // Add mode
      const newMember: TeamMember = {
        id: "member-" + Date.now(),
        name,
        specialization,
        phone
      };
      saveTeam([...team, newMember]);
    }

    handleCloseModal();
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا العضو؟")) {
      const updatedTeam = team.filter(m => m.id !== id);
      saveTeam(updatedTeam);
    }
  };

  // Search filter
  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            <span>فريق العمل</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">إضافة، تعديل، وحذف أعضاء فريق العمل المتاحين لتخصيصهم للمشاريع.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-100 self-start sm:self-auto text-sm"
        >
          <UserPlus size={18} />
          <span>إضافة عضو جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-white rounded-xl shadow-sm border border-slate-200">
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="ابحث باسم العضو، التخصص، أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-11 pl-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent text-sm font-medium"
        />
      </div>

      {/* Members Grid */}
      {filteredTeam.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Users size={40} className="mx-auto text-slate-300" />
          <p className="font-bold text-base">لا يوجد أعضاء فريق تطابق بحثك</p>
          <p className="text-xs text-slate-400">اضغط على زر "إضافة عضو جديد" للبدء.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Member Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-100 shadow-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{member.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                      <Briefcase size={12} className="text-slate-400" />
                      <span>{member.specialization}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-sm py-2 px-3 bg-slate-50 rounded-xl">
                  <Smartphone size={14} className="text-blue-500" />
                  <span className="font-medium text-xs">{member.phone}</span>
                </div>
              </div>

              {/* Member Card Footer - Actions */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 size={13} />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 size={13} />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingMember ? "تعديل بيانات العضو" : "إضافة عضو فريق جديد"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-lg">
                  {error}
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">اسم العضو بالكامل *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد أحمد"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Specialization field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">التخصص / المسمى الوظيفي *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <Briefcase size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطور ويب، مصمم واجهات..."
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Phone field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">رقم الهاتف *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                    <Smartphone size={16} />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 01012345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
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
                  {editingMember ? "حفظ التغييرات" : "إضافة العضو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
