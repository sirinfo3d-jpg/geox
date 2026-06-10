"use client";

import { useState, useEffect } from "react";
import { TeamMember, Project } from "@/types";

const DEFAULT_TEAM: TeamMember[] = [
  { id: "member-1", name: "أحمد محمد", specialization: "مدير مشاريع", phone: "01012345678" },
  { id: "member-2", name: "سارة علي", specialization: "مصممة واجهات UI/UX", phone: "01112223334" },
  { id: "member-3", name: "خالد عبد الله", specialization: "مطور واجهات فرونت إند", phone: "01223334445" },
  { id: "member-4", name: "منى حسن", specialization: "مطور باك إند", phone: "01556667778" }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "موقع الشركة العقارية",
    clientName: "شركة النور العقارية",
    clientPhone: "01098765432",
    startDate: "2026-06-01",
    dueDate: "2026-06-30",
    status: "in_progress",
    pricingMode: "fixed",
    fixedPrice: 1500,
    tasks: [],
    assignedMembers: ["member-2", "member-3"],
    googleDriveLink: "https://drive.google.com/drive/folders/1abc",
    notes: "المشروع يسير حسب الجدول الزمني. تم إنجاز مرحلة التصميم."
  },
  {
    id: "project-2",
    name: "تطبيق توصيل الطلبات للمطاعم",
    clientName: "شركة جود للمأكولات",
    clientPhone: "01122334455",
    startDate: "2026-06-05",
    dueDate: "2026-07-25",
    status: "not_started",
    pricingMode: "task",
    fixedPrice: 0,
    tasks: [
      { id: "task-1", name: "تصميم واجهات تجربة المستخدم", description: "رسم الواجهات الأولية وتأكيدها من العميل", price: 800, status: "completed" },
      { id: "task-2", name: "تطوير لوحة تحكم الإدارة", description: "ربط الباك إند بلوحة التحكم", price: 1200, status: "in_progress" },
      { id: "task-3", name: "بناء تطبيق الموبايل للعملاء", description: "تطوير التطبيق ورفعه للمتاجر التجريبية", price: 2000, status: "not_started" }
    ],
    assignedMembers: ["member-1", "member-4"],
    googleDriveLink: "https://drive.google.com/drive/folders/2xyz",
    notes: "تم الاتفاق على نظام التسعير بناءً على إنجاز المهام."
  },
  {
    id: "project-3",
    name: "إنشاء متجر إلكتروني للملابس",
    clientName: "الفارس للتجارة",
    clientPhone: "01222446688",
    startDate: "2026-05-10",
    dueDate: "2026-06-15",
    status: "completed",
    pricingMode: "fixed",
    fixedPrice: 2200,
    tasks: [
      { id: "task-4", name: "إعداد المتجر والمنتجات", price: 1000, status: "completed" },
      { id: "task-5", name: "ربط بوابة الدفع الإلكتروني", price: 1200, status: "completed" }
    ],
    assignedMembers: ["member-3", "member-4"],
    googleDriveLink: "https://drive.google.com/drive/folders/3mno",
    notes: "تم تسليم المتجر بنجاح وتفعيل نظام الدفع والفيزا."
  }
];

export function useProjectFlowData() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from LocalStorage
    const storedTeam = localStorage.getItem("pf_team");
    const storedProjects = localStorage.getItem("pf_projects");

    if (storedTeam) {
      setTeam(JSON.parse(storedTeam));
    } else {
      setTeam(DEFAULT_TEAM);
      localStorage.setItem("pf_team", JSON.stringify(DEFAULT_TEAM));
    }

    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      setProjects(DEFAULT_PROJECTS);
      localStorage.setItem("pf_projects", JSON.stringify(DEFAULT_PROJECTS));
    }

    setIsLoaded(true);
  }, []);

  const saveTeam = (newTeam: TeamMember[]) => {
    setTeam(newTeam);
    localStorage.setItem("pf_team", JSON.stringify(newTeam));
  };

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem("pf_projects", JSON.stringify(newProjects));
  };

  return {
    team,
    projects,
    isLoaded,
    saveTeam,
    saveProjects,
  };
}
