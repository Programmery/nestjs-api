export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  enabled: boolean;
  token?: string;
}
