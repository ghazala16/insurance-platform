// ---- Auth Models ----
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
}

// ---- Policy Models ----
export type PolicyType = 'LIFE' | 'HEALTH' | 'PROPERTY' | 'CASUALTY' | 'LIABILITY' | 'MARINE' | 'AVIATION';
export type PolicyStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface Policy {
  id: string;
  policyNumber: string;
  title: string;
  description?: string;
  type: PolicyType;
  status: PolicyStatus;
  holderName: string;
  holderEmail: string;
  premium: number;
  coverageAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  riskLevel?: RiskLevel;
  riskNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyRequest {
  title: string;
  description?: string;
  type: PolicyType;
  holderName: string;
  holderEmail: string;
  premium: number;
  coverageAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export interface UpdatePolicyRequest {
  title?: string;
  description?: string;
  status?: PolicyStatus;
  premium?: number;
  coverageAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ---- Dashboard Models ----
export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  pendingPolicies: number;
  expiredPolicies: number;
  totalPremium: number;
  totalCoverage: number;
  policiesByType: Record<string, number>;
  policiesByRisk: Record<string, number>;
}

// ---- API Error ----
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
  errors?: Record<string, string>;
}
