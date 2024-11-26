import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private apiUrl = 'http://localhost:8000/seller'; // URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer tous les vendeurs
  getAllSellers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Créer un nouveau vendeur
  createSeller(sellerData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, sellerData);
  }
}
