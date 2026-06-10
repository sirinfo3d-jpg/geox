export interface TeamMember {
  id: string;
  name: string;
  specialization: string; // التخصص/الوظيفة
  phone: string;
}

export type PricingMode = "fixed" | "task";

export type TaskStatus = "not_started" | "in_progress" | "completed";

export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  price: number; // تكلفة المهمة
  status: TaskStatus;
}

export type ProjectStatus = "not_started" | "in_progress" | "completed" | "cancelled";

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  googleDriveLink?: string;
  notes?: string;
  pricingMode: PricingMode;
  fixedPrice?: number;
  tasks: ProjectTask[];
  assignedMembers: string[]; // قائمة بمعرفات أعضاء الفريق (TeamMember.id)
}
