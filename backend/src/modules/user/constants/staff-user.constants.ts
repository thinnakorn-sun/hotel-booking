export const STAFF_ROLES = ['STAFF', 'MANAGER', 'ADMIN'] as const;

export const STAFF_USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export type StaffUserStatus = (typeof STAFF_USER_STATUSES)[number];
