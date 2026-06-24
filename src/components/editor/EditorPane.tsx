import type { ReactNode } from "react";
import { useResume } from "../../store/resumeStore";
import { normalizeSectionOrder, type SectionKey } from "../../types";
import { ReorderArrows } from "../common/ui";
import { HeaderSection } from "./HeaderSection";
import { StyleSection } from "./StyleSection";
import { SummarySection } from "./SummarySection";
import { WorkSection } from "./WorkSection";
import { EducationSection } from "./EducationSection";
import { CertificationsSection } from "./CertificationsSection";
import { FooterSection } from "./FooterSection";

const SECTION_COMPONENTS: Record<SectionKey, ReactNode> = {
  summary: <SummarySection />,
  work: <WorkSection />,
  education: <EducationSection />,
  certifications: <CertificationsSection />,
  footer: <FooterSection />,
};

export function EditorPane() {
  const sectionOrder = useResume((s) => s.resume.sectionOrder);
  const reorderSections = useResume((s) => s.reorderSections);
  const order = normalizeSectionOrder(sectionOrder);

  return (
    <div className="scroll-thin h-full overflow-y-auto px-5 py-5">
      <div className="mx-auto max-w-xl space-y-4 pb-16">
        {/* Fixed top sections (matching left gutter keeps edges aligned). */}
        <Row>
          <HeaderSection />
        </Row>
        <Row>
          <StyleSection />
        </Row>

        {/* Reorderable document sections — click arrows to move. */}
        {order.map((key, i) => (
          <Row
            key={key}
            controls={
              <ReorderArrows
                index={i}
                count={order.length}
                onMove={reorderSections}
                className="mt-3"
              />
            }
          >
            {SECTION_COMPONENTS[key]}
          </Row>
        ))}
      </div>
    </div>
  );
}

/** A section row with a fixed-width left gutter (arrows for reorderable ones). */
function Row({ children, controls }: { children: ReactNode; controls?: ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <div className="w-5 shrink-0">{controls}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
