// Shared user roles storage
// In production, this should be replaced with a database

import fs from 'fs';
import path from 'path';

// File-based storage for persistence across server restarts
const ROLES_FILE = path.join(process.cwd(), '.user-roles.json');

// Initialize userRoles Map from file if it exists
export const userRoles = new Map();

// Load existing roles from file on startup
function loadRolesFromFile() {
  try {
    if (fs.existsSync(ROLES_FILE)) {
      const data = fs.readFileSync(ROLES_FILE, 'utf8');
      const rolesData = JSON.parse(data);
      Object.entries(rolesData).forEach(([email, userData]) => {
        userRoles.set(email, userData);
      });
      console.log(`📁 Loaded ${userRoles.size} user roles from file`);
    }
  } catch (error) {
    console.error('Error loading roles from file:', error);
  }
}

// Save roles to file
function saveRolesToFile() {
  try {
    const rolesData = Object.fromEntries(userRoles);
    fs.writeFileSync(ROLES_FILE, JSON.stringify(rolesData, null, 2));
  } catch (error) {
    console.error('Error saving roles to file:', error);
  }
}

// Load roles on module initialization
loadRolesFromFile();

// Helper functions for role management
export function setUserRole(email, role, updatedBy = 'system') {
  userRoles.set(email, {
    role,
    updatedAt: new Date().toISOString(),
    updatedBy
  });

  // Save to file for persistence
  saveRolesToFile();

  console.log(`✅ Role set for ${email}: ${role} (saved to file)`);
}

export function getUserRole(email) {
  const userData = userRoles.get(email);
  const role = userData ? userData.role : null;

  // Debug logging to understand what's happening
  if (role) {
    console.log(`🔍 getUserRole: Found stored role for ${email}: ${role}`);
  } else {
    console.log(`❌ getUserRole: No stored role found for ${email}. Available roles:`,
      Array.from(userRoles.keys()));
  }

  return role;
}

export function getAllUserRoles() {
  return Array.from(userRoles.entries()).map(([email, data]) => ({
    email,
    ...data
  }));
}

export function deleteUserRole(email) {
  const deleted = userRoles.delete(email);
  if (deleted) {
    // Save to file after deletion
    saveRolesToFile();
    console.log(`🗑️ Role deleted for ${email} (saved to file)`);
  }
  return deleted;
}

// Valid roles
export const VALID_ROLES = ['faculty', 'hod', 'security', 'security_head'];

export function isValidRole(role) {
  return VALID_ROLES.includes(role);
}
