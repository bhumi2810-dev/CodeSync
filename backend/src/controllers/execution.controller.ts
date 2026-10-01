import { Request, Response } from "express";
import { executeCodeSchema } from "../validators/execution.validator";
import { runCode } from "../execution/execution.service";

export async function execute(req: Request, res: Response) {
  try {
    const parsed = executeCodeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { language, code } = parsed.data;
    const result = await runCode(language, code);

    return res.status(200).json({
      success: true,
      data: result,
      output: result.output,
      error: result.error,
      timedOut: result.timedOut,
    });
  } catch (error) {
    console.error("Execution error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during code execution",
    });
  }
}
