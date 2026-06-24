import { Fragment, type ReactNode } from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Resume, SectionKey } from "../types";
import { CONTACT_META, footerItems, orderedSections } from "../types";
import { fontFamilyFor, visibleContacts, dateRange, shade, workLocation, metrics } from "./shared";

export default function TwoColumn({ resume }: { resume: Resume }) {
  const family = fontFamilyFor(resume);
  const accent = resume.meta.accentColor;
  const contacts = visibleContacts(resume);
  const sidebarBg = shade(accent, 0.34);
  const { fs, sp, lineHeight, letterSpacing } = metrics(resume);

  const s = StyleSheet.create({
    page: { fontFamily: family, fontSize: fs(10), color: "#222", flexDirection: "row", letterSpacing },
    sidebar: {
      width: "33%",
      backgroundColor: sidebarBg,
      paddingVertical: sp(34),
      paddingHorizontal: sp(20),
      lineHeight,
    },
    main: { width: "67%", paddingVertical: sp(34), paddingHorizontal: sp(26), lineHeight },
    name: { fontSize: fs(20), fontWeight: 700, color: "#1c1c1c" },
    headline: { fontSize: fs(10), color: accent, fontWeight: 700, marginTop: sp(2), marginBottom: sp(4) },
    sideTitle: {
      fontSize: fs(10),
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: letterSpacing + 1,
      color: accent,
      marginTop: sp(16),
      marginBottom: sp(5),
    },
    sideLabel: { fontSize: fs(8), color: "#666", marginTop: sp(5) },
    sideValue: { fontSize: fs(9), color: "#222" },
    mainTitle: {
      fontSize: fs(12),
      fontWeight: 700,
      color: "#1a1a1a",
      letterSpacing: letterSpacing + 0.4,
      borderBottomWidth: 1.5,
      borderBottomColor: accent,
      paddingBottom: sp(3),
      marginBottom: sp(8),
      marginTop: sp(4),
    },
    section: { marginBottom: sp(14) },
    summary: { fontSize: fs(9.5), color: "#333", textAlign: "justify" },
    entry: { marginBottom: sp(9) },
    entryHeader: { flexDirection: "row", justifyContent: "space-between" },
    role: { fontSize: fs(11), fontWeight: 700 },
    org: { fontSize: fs(9.5), fontStyle: "italic", color: "#444" },
    meta: { fontSize: fs(8.5), color: "#777" },
    bulletRow: { flexDirection: "row", marginTop: sp(2) },
    bulletDot: { width: fs(9), fontSize: fs(9), color: accent },
    bulletText: { flex: 1, fontSize: fs(9), color: "#2b2b2b" },
  });

  // Two-column layout: sidebar holds education/certs/footer, main holds
  // summary/experience. Each column honors the user's section order, filtered
  // to the sections that live in that column.
  const order = orderedSections(resume);
  const sidebarKeys: SectionKey[] = ["education", "certifications", "footer"];
  const mainKeys: SectionKey[] = ["summary", "work"];

  const renderers: Partial<Record<SectionKey, ReactNode>> = {
    education:
      resume.education.length > 0 ? (
        <View>
          <Text style={s.sideTitle}>Education</Text>
          {resume.education.map((e) => (
            <View key={e.id} style={{ marginTop: 5 }}>
              <Text style={s.sideValue}>{e.school}</Text>
              <Text style={s.sideLabel}>{[e.degree, e.field].filter(Boolean).join(", ")}</Text>
              <Text style={s.sideLabel}>{dateRange(e.startDate, e.endDate)}</Text>
            </View>
          ))}
        </View>
      ) : null,
    certifications:
      resume.certifications.length > 0 ? (
        <View>
          <Text style={s.sideTitle}>Certifications</Text>
          {resume.certifications.map((c) => (
            <View key={c.id} style={{ marginTop: 4 }}>
              <Text style={s.sideValue}>{c.name}</Text>
              {c.issuer ? <Text style={s.sideLabel}>{c.issuer}</Text> : null}
              {c.credentialId?.trim() ? (
                <Text style={s.sideLabel}>ID: {c.credentialId.trim()}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null,
    footer:
      resume.footer.enabled && resume.footer.content.trim() ? (
        <View>
          <Text style={s.sideTitle}>{resume.footer.title || "Interests"}</Text>
          {resume.footer.style === "list" ? (
            footerItems(resume.footer).map((it, i) => (
              <Text key={i} style={s.sideValue}>
                • {it}
              </Text>
            ))
          ) : (
            <Text style={s.sideValue}>{resume.footer.content}</Text>
          )}
        </View>
      ) : null,
    summary: resume.summary?.trim() ? (
      <View style={s.section}>
        <Text style={s.mainTitle}>Profile</Text>
        <Text style={s.summary}>{resume.summary}</Text>
      </View>
    ) : null,
    work:
      resume.work.length > 0 ? (
        <View style={s.section}>
          <Text style={s.mainTitle}>Experience</Text>
          {resume.work.map((w) => (
            <View key={w.id} style={s.entry} wrap={false}>
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
                    <Text style={s.bulletDot}>•</Text>
                    <Text style={s.bulletText}>{b}</Text>
                  </View>
                ))}
            </View>
          ))}
        </View>
      ) : null,
  };

  return (
    <Document title={resume.name || "Resume"} author={resume.name}>
      <Page size={resume.meta.pageSize} style={s.page}>
        {/* Sidebar */}
        <View style={s.sidebar}>
          <Text style={s.name}>{resume.name || "Your Name"}</Text>
          {resume.headline ? <Text style={s.headline}>{resume.headline}</Text> : null}

          {contacts.length > 0 && (
            <View>
              <Text style={s.sideTitle}>Contact</Text>
              {contacts.map((c) => (
                <View key={c.id}>
                  <Text style={s.sideLabel}>
                    {c.type === "custom" ? c.label || "Info" : CONTACT_META[c.type].label}
                  </Text>
                  <Text style={s.sideValue}>{c.value}</Text>
                </View>
              ))}
            </View>
          )}

          {order
            .filter((k) => sidebarKeys.includes(k))
            .map((k) => (
              <Fragment key={k}>{renderers[k]}</Fragment>
            ))}
        </View>

        {/* Main column */}
        <View style={s.main}>
          {order
            .filter((k) => mainKeys.includes(k))
            .map((k) => (
              <Fragment key={k}>{renderers[k]}</Fragment>
            ))}
        </View>
      </Page>
    </Document>
  );
}
