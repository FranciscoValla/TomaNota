import { HttpInterceptorFn } from "@angular/common/http";
import { environments } from "../environments/environment";

export const SupabaseInterceptor: HttpInterceptorFn = (req, next) => {
  const isPrescription = req.url.includes('/rest/v1/prescriptions');

  const anonKey = environments.superbaseAnonKey;
  if (!isPrescription ) {
    return next(req);
  }

  const inectKey= req.clone({
    url: req.url,
    setHeaders: {
      'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
    }
  });

  return next(inectKey);
}
