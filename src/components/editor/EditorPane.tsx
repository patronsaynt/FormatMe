import { HeaderSection } from "./HeaderSection";
import { FormattingSection } from "./FormattingSection";
import { ContactSection } from "./ContactSection";
import { WorkSection } from "./WorkSection";
import { EducationSection } from "./EducationSection";
import { CertificationsSection } from "./CertificationsSection";
import { FooterSection } from "./FooterSection";

export function EditorPane() {
  return (
    <div className="scroll-thin h-full overflow-y-auto px-5 py-5">
      <div className="mx-auto max-w-xl space-y-4 pb-16">
        <HeaderSection />
        <FormattingSection />
        <ContactSection />
        <WorkSection />
        <EducationSection />
        <CertificationsSection />
        <FooterSection />
      </div>
    </div>
  );
}
