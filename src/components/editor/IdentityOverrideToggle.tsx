import { useResume } from "../../store/resumeStore";
import { useGlobalProfile } from "../../store/globalProfileStore";
import { Toggle } from "../common/ui";

/**
 * Shared control for HeaderSection and ContactSection — both edit the same
 * `resume.identityOverride` flag, so flipping it in either place affects both.
 */
export function IdentityOverrideToggle() {
  const override = useResume((s) => s.resume.identityOverride ?? false);
  const setIdentityOverride = useResume((s) => s.setIdentityOverride);
  const profile = useGlobalProfile((s) => s.profile);

  return (
    <Toggle
      checked={override}
      onChange={(v) => setIdentityOverride(v, v ? profile : undefined)}
      label="Custom"
    />
  );
}
