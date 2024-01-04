import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AbortControllerService {
  private abortController: AbortController | null = null;

  constructor() {}

  createAbortController(): AbortController {
    this.abortController = new AbortController();
    return this.abortController;
  }

  abortExistingRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  resetAbortController(): void {
    this.abortController = null;
  }
}
