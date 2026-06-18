// Status is fully derived from progress — there is no independent status control.
export function deriveStatusFromProgress(progress) {
    if (progress <= 0) return "to do";
    if (progress >= 100) return "done";
    return "in progress";
}
