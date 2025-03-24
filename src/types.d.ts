// src/types.d.ts (create if not exists)
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
  }

  interface Session {
    user: User & {
      id: string;
    };
  }
}