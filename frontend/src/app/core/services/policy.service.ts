import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Policy,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PagedResponse,
  PolicyStatus,
} from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private readonly base = `${environment.apiUrl}/policies`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<PagedResponse<Policy>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PagedResponse<Policy>>(this.base, { params });
  }

  getById(id: string): Observable<Policy> {
    return this.http.get<Policy>(`${this.base}/${id}`);
  }

  getByNumber(policyNumber: string): Observable<Policy> {
    return this.http.get<Policy>(`${this.base}/number/${policyNumber}`);
  }

  getByStatus(status: PolicyStatus, page = 0, size = 10): Observable<PagedResponse<Policy>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Policy>>(`${this.base}/status/${status}`, { params });
  }

  search(q: string, page = 0, size = 10): Observable<PagedResponse<Policy>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<PagedResponse<Policy>>(`${this.base}/search`, { params });
  }

  create(request: CreatePolicyRequest): Observable<Policy> {
    return this.http.post<Policy>(this.base, request);
  }

  update(id: string, request: UpdatePolicyRequest): Observable<Policy> {
    return this.http.put<Policy>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
