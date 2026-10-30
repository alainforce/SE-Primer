export type UserLevel = 'beginner' | 'experienced';
export type UserRole = 'backend' | 'devops' | 'frontend';
export type UserGoal = 'uptime' | 'compliance' | 'learning';

export interface UserProfile {
  level: UserLevel;
  role: UserRole;
  goal: UserGoal;
}

