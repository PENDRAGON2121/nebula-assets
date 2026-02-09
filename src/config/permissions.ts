export const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
  },
  ASSETS: {
    READ: 'assets:read',
    WRITE: 'assets:write',
    DELETE: 'assets:delete',
  },
  PEOPLE: {
    READ: 'people:read',
    WRITE: 'people:write',
    DELETE: 'people:delete',
  },
  MAINTENANCE: {
    READ: 'maintenance:read',
    WRITE: 'maintenance:write',
  },
  ASSIGNMENTS: {
    READ: 'assignments:read',
    WRITE: 'assignments:write',
  },
  LICENSES: {
    READ: 'licenses:read',
    WRITE: 'licenses:write',
    DELETE: 'licenses:delete',
  }
} as const;

export const ALL_PERMISSIONS = [
  ...Object.values(PERMISSIONS.USERS),
  ...Object.values(PERMISSIONS.ASSETS),
  ...Object.values(PERMISSIONS.PEOPLE),
  ...Object.values(PERMISSIONS.MAINTENANCE),
  ...Object.values(PERMISSIONS.ASSIGNMENTS),
  ...Object.values(PERMISSIONS.LICENSES),
];
