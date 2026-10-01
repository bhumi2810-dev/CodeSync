import api from "./api";

export interface ExecutionResponse {
  success: boolean;
  data: {
    output: string;
    error?: string;
    timedOut: boolean;
    exitCode?: number | null;
  };
  output: string;
  error?: string;
  timedOut: boolean;
}

export const executionService = {
  async executeCode(language: string, code: string): Promise<ExecutionResponse> {
    const res = await api.post("/api/execute", { language, code });
    return res.data;
  },
};
