export interface JwtPayload {
  email: string;
  given_name: string;
  exp: number;
  iat?: number;
  sub?: string;
  aud?: string;
  iss?: string;
  jti?: string;
}