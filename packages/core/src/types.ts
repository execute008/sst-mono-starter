export interface User {
  id: string;
  provider: string;
  contact?: {
    email?: string;
    tel?: string;
  };
}
