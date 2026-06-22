import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Resume } from "../types";
import { fontFamilyFor, visibleContacts, dateRange, shade, workLocation, metrics } from "./shared";

export default function Modern({ resume }: { resume: Resume }) {
  const family = fontFamilyFor(resume);
  const accent = resume.meta.accentColor;
  const contacts = visibleContacts(resume);
  const { fs, sp, lineHeight, letterSpacing } = metrics(resume);

  const s = StyleSheet.create({
    page: {
      fontFamily: family,
      fontSize: fs(10),
      color: "#222",
      lineHeight,
      letterSpacing,
    },
    band: {
      backgroundColor: accent,
      paddingVertical: sp(26),
      paddingHorizontal: sp(46),
    },
    name: { fontSize: fs(26), fontWeight: 700, color: "#fff", letterSpacing: letterSpacing + 0.5 },
    headline: { fontSize: fs(11), color: shade(accent, 0.42), marginTop: sp(2), fontWeight: 700 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", marginTop: sp(9), gap: sp(10) },
    contact: { fontSize: fs(9), color: "#fdf6ee" },
    body: { paddingVertical: sp(24), paddingHorizontal: sp(46) },
    section: { marginBottom: sp(15) },
    sectionTitle: {
      fontSize: fs(12),
      fontWeight: 700,
      color: accent,
      letterSpacing: letterSpacing + 0.6,
      marginBottom: sp(7),
    },
    accentBar: {
      width: 26,
      height: 2.5,
      backgroundColor: accent,
      marginBottom: sp(8),
      marginTop: -3,
    },
    summary: { fontSize: fs(10), color: "#333", textAlign: "justify" },
    entry: { marginBottom: sp(10) },
    entryHeader: { flexDirection: "row", justifyContent: "space-between" },
    role: { fontSize: fs(11.5), fontWeight: 700, color: "#1a1a1a" },
    org: { fontSize: fs(10), color: accent, fontWeight: 700, marginTop: sp(1) },
    meta: { fontSize: fs(9), color: "#777" },
    bulletRow: { flexDirection: "row", marginTop: sp(2.5) },
    bulletDot: { width: fs(11), fontSize: fs(9), color: accent },
    bulletText: { flex: 1, fontSize: fs(9.5), color: "#2b2b2b" },
    footerText: { fontSize: fs(9.5), color: "#333" },
  });

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={s.section} wrap={false}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.accentBar} />
      {children}
    </View>
  );

  return (
    <Document title={resume.name || "Resume"} author={resume.name}>
      <Page size={resume.meta.pageSize} style={s.page}>
        <View style={s.band}>
          <Text style={s.name}>{resume.name || "Your Name"}</Text>
          {resume.headline ? <Text style={s.headline}>{resume.headline}</Text> : null}
          {contacts.length > 0 && (
            <View style={s.contactRow}>
              {contacts.map((c) => (
                <Text key={c.id} style={s.contact}>
                  {c.value}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={s.body}>
          {resume.summary?.trim() ? (
            <Section title="Summary">
              <Text style={s.summary}>{resume.summary}</Text>
            </Section>
          ) : null}

          {resume.work.length > 0 && (
            <Section title="Experience">
              {resume.work.map((w) => (
                <View key={w.id} style={s.entry}>
                  <View style={s.entryHeader}>
                    <Text style={s.role}>{w.title || "Role"}</Text>
                    <Text style={s.meta}>{dateRange(w.startDate, w.endDate, w.current)}</Text>
                  </View>
                  <Text style={s.org}>
                    {w.company}
                    {workLocation(w) ? `  ·  ${workLocation(w)}` : ""}
                  </Text>
                  {w.bullets
                    .filter((b) => b.trim())
                    .map((b, i) => (
                      <View key={i} style={s.bulletRow}>
                        <Text style={s.bulletDot}>▪</Text>
                        <Text style={s.bulletText}>{b}</Text>
                      </View>
                    ))}
                </View>
              ))}
            </Section>
          )}

          {resume.education.length > 0 && (
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
                </View>
              ))}
            </Section>
          )}

          {resume.certifications.length > 0 && (
            <Section title="Certifications">
              {resume.certifications.map((c) => (
                <View key={c.id} style={s.entryHeader}>
                  <Text style={s.bulletText}>
                    {c.name}
                    {c.issuer ? ` — ${c.issuer}` : ""}
                  </Text>
                  <Text style={s.meta}>{c.date}</Text>
                </View>
              ))}
            </Section>
          )}

          {resume.footer.enabled && resume.footer.content.trim() ? (
            <Section title={resume.footer.title || "Interests"}>
              <Text style={s.footerText}>{resume.footer.content}</Text>
            </Section>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
