
export interface ApiResponse<T> {
  result: T | null;
  code: number;
  message: string;
}

export interface ApiResponseBlank {
  code: number;
  message: string;
  result?: any; 
  user?: any;   
}

