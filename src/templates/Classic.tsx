import { Fragment, type ReactNode } from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Resume, SectionKey } from "../types";
import { footerItems, orderedSections } from "../types";
import { fontFamilyFor, visibleContacts, dateRange, workLocation, metrics, certificationLabel } from "./shared";
import { formatResumeDate } from "../lib/date";

// Classic is intentionally monochrome: all text is black and every dot marker
// (contact separators and list bullets) shares one uniform style.
const INK = "#1c1c1c";
const DOT_SIZE = 9;

export default function Classic({ resume }: { resume: Resume }) {
  const family = fontFamilyFor(resume);
  const contacts = visibleContacts(resume);
  const { fs, sp, lineHeight, letterSpacing } = metrics(resume);

  const s = StyleSheet.create({
    page: {
      fontFamily: family,
      fontSize: fs(10),
      color: INK,
      paddingVertical: sp(42),
      paddingHorizontal: sp(50),
      lineHeight,
      letterSpacing,
    },
    name: {
      fontSize: fs(22),
      fontWeight: 700,
      textAlign: "center",
      letterSpacing: letterSpacing + 0.5,
      lineHeight: 1.15,
      marginBottom: sp(4),
    },
    headline: {
      fontSize: fs(11),
      textAlign: "center",
      color: INK,
      marginTop: sp(2),
      fontWeight: 700,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: sp(7),
      gap: sp(4),
    },
    contact: { fontSize: fs(9), color: INK },
    sep: { fontSize: fs(DOT_SIZE), color: INK },
    section: { marginTop: sp(16) },
    sectionTitle: {
      fontSize: fs(11),
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: letterSpacing + 1.2,
      borderBottomWidth: 1,
      borderBottomColor: INK,
      paddingBottom: sp(3),
      marginBottom: sp(7),
    },
    summary: { fontSize: fs(10), color: INK, marginTop: sp(10), textAlign: "justify" },
    entry: { marginBottom: sp(9) },
    entryHeader: { flexDirection: "row", justifyContent: "space-between" },
    role: { fontSize: fs(11), fontWeight: 700 },
    org: { fontSize: fs(10), fontStyle: "italic", color: INK },
    meta: { fontSize: fs(9), color: INK },
    bulletRow: { flexDirection: "row", marginTop: sp(2), paddingLeft: sp(4) },
    bulletDot: { width: fs(10), fontSize: fs(DOT_SIZE), color: INK },
    bulletText: { flex: 1, fontSize: fs(9.5), color: INK },
    footerText: { fontSize: fs(9.5), color: INK, marginTop: sp(2) },
  });

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={s.section} wrap={false}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderers: Record<SectionKey, ReactNode> = {
    summary: resume.summary?.trim() ? (
      <Section title="Summary">
        <Text style={s.summary}>{resume.summary}</Text>
      </Section>
    ) : null,
    work:
      resume.work.length > 0 ? (
        <Section title="Experience">
          {resume.work.map((w) => (
            <View key={w.id} style={s.entry}>
              <View style={s.entryHeader}>
                <Text style={s.role}>{w.title || "Role"}</Text>
                <Text style={s.meta}>{dateRange(w.startDate, w.endDate, w.current)}</Text>
              </View>
              <View style={s.entryHeader}>
                <Text style={s.org}>
                  {w.company}
                  {workLocation(w) ? `  ·  ${workLocation(w)}` : ""}
                </Text>
              </View>
              {w.bullets
                .filter((b) => b.trim())
                .map((b, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
            </View>
          ))}
        </Section>
      ) : null,
    education:
      resume.education.length > 0 ? (
        <Section title="Education">
          {resume.education.map((e) => (
            <View key={e.id} style={s.entry}>
              <View style={s.entryHeader}>
                <Text style={s.role}>{e.school || "School"}</Text>
                <Text style={s.meta}>{dateRange(e.startDate, e.endDate)}</Text>
              </View>
              <Text style={s.org}>
                {[e.degree, e.field].filter(Boolean).join(", ")}
                {e.gpa ? `  ·  GPA ${e.gpa}` : ""}
              </Text>
              {e.details
                .filter((d) => d.trim())
                .map((d, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{d}</Text>
                  </View>
                ))}
            </View>
          ))}
        </Section>
      ) : null,
    certifications:
      resume.certifications.length > 0 ? (
        <Section title="Certifications">
          {resume.certifications.map((c) => (
            <View key={c.id} style={s.entryHeader}>
              <Text style={s.bulletText}>{certificationLabel(c)}</Text>
              <Text style={s.meta}>{formatResumeDate(c.date)}</Text>
            </View>
          ))}
        </Section>
      ) : null,
    footer:
      resume.footer.enabled && resume.footer.content.trim() ? (
        <Section title={resume.footer.title || "Interests"}>
          {resume.footer.style === "list" ? (
            footerItems(resume.footer).map((it, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{it}</Text>
              </View>
            ))
          ) : (
            <Text style={s.footerText}>{resume.footer.content}</Text>
          )}
        </Section>
      ) : null,
  };

  return (
    <Document title={resume.name || "Resume"} author={resume.name}>
      <Page size={resume.meta.pageSize} style={s.page}>
        <Text style={s.name}>{resume.name || "Your Name"}</Text>
        {resume.headline ? <Text style={s.headline}>{resume.headline}</Text> : null}

        {contacts.length > 0 && (
          <View style={s.contactRow}>
            {contacts.map((c, i) => (
              <View key={c.id} style={{ flexDirection: "row", gap: 4 }}>
                {i > 0 && <Text style={s.sep}>•</Text>}
                <Text style={s.contact}>{c.value}</Text>
              </View>
            ))}
          </View>
        )}

        {orderedSections(resume).map((k) => (
          <Fragment key={k}>{renderers[k]}</Fragment>
        ))}
      </Page>
    </Document>
  );
}
