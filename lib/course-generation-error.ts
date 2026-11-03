export function describeGenerationError(error?: string): string {
  if (!error) {
    return "Something went wrong while building the course. Your outline is unchanged.";
  }
  if (
    error === "Unauthorized" ||
    /clerk|auth\(\)|middleware|prisma|econn|invocation|unhandled|stack/i.test(
      error
    )
  ) {
    return "Your session ended before the build finished. Sign in again, then rebuild from this outline.";
  }
  if (error.length > 240) {
    return "Something went wrong while building the course. Your outline is unchanged.";
  }
  return error;
}
