export type UserRole = 'customer' | 'admin';

export type LeaseStatus = 'pending' | 'approved' | 'rejected';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Lease {
  id: number;
  assetName: string;
  leaseAmount: number | string;
  termMonths: number;
  startDate: string;
  status: LeaseStatus;
  createdAt: string;
  userId: number;
}

export interface CreateLeaseInput {
  assetName: string;
  leaseAmount: number;
  termMonths: number;
  startDate: string;
}
