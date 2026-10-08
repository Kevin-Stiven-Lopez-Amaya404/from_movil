export type HomeRole = "OWNER" | "MEMBER" | "GUEST";

export type HomeMemberStatus =
  | "PENDING"
  | "ACTIVE"
  | "REVOKED"
  | "LEFT";

export type SmartHomePlace = {
  id: string;
  name: string;
  location: string;
  favorite: boolean;
  homeRole?: HomeRole;
};

export type HomeMember = {
  id: string;
  homeId: string;
  userId: string;
  role: HomeRole;
  status: HomeMemberStatus | string;
  invitedBy: string | null;
  invitedAt: string;
  acceptedAt?: string | null;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type HomeInvitation = {
  id: string;
  homeId?: string;
  homeName?: string;
  memberId?: string;
  userId?: string;
  role: HomeRole;
  status?: HomeMemberStatus | string;
  invitedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};