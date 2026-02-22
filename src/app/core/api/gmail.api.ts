import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export type GmailListResponse = {
    messages?: { id: string; threadId: string }[];
    nextPageToken?: string;
    resultSizeEstimate?: number;
};

@Injectable({ providedIn: 'root' })
export class GmailApi {
    private base = 'https://gmail.googleapis.com/gmail/v1/users/me';

    constructor(private http: HttpClient) { }

    listMessages(q: string, maxResults = 20, pageToken?: string) {
        // q は Gmail 検索クエリ（from:xxx など）
        // messages.list の q パラメータは公式にある :contentReference[oaicite:4]{index=4}
        let params = new HttpParams().set('q', q).set('maxResults', String(maxResults));
        if (pageToken) params = params.set('pageToken', pageToken);

        return this.http.get<GmailListResponse>(`${this.base}/messages`, { params });
    }

    getMessage(id: string, format: 'metadata' | 'full' = 'metadata') {
        const params = new HttpParams().set('format', format);
        return this.http.get<any>(`${this.base}/messages/${id}`, { params });
    }
    getMessageMetadata(id: string) {
        const params = new HttpParams()
            .set('format', 'metadata')
            .set('metadataHeaders', 'From')
            .set('metadataHeaders', 'List-Unsubscribe')
            .set('metadataHeaders', 'Subject')
            .set('metadataHeaders', 'Date');

        return this.http.get<any>(`${this.base}/messages/${id}`, { params });
    }

}
