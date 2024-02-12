// token.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  isTokenExpired(): boolean {
    const storedTime = localStorage.getItem('token_timestamp');
    if (storedTime) {
      const storedTimestamp = parseInt(storedTime, 10);
      const currentTime = Date.now();
      const hoursDifference = (currentTime - storedTimestamp) / (1000 * 60 * 60); // Convert milliseconds to hours

      // Check if 48 hours (2 days) have passed
      if (hoursDifference >= 8640) {
        // Token has expired, clear the localStorage
        localStorage.removeItem('id_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('token_timestamp');
        return true;
      }
      return false;
    }
    return true; // If no timestamp is found, consider the token expired
  }
}
