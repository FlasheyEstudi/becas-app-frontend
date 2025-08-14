// Interfaces para autenticación
export interface DecodedToken {
  username: string;
  sub: number;
  role: string;
  exp: number;
  iat: number;
}