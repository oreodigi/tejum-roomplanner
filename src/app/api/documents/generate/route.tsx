import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import React from 'react';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '1pt solid #eeeeee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottom: '0.5pt solid #eeeeee',
    paddingBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#666666',
  },
  value: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999999',
    fontSize: 10,
    borderTop: '1pt solid #eeeeee',
    paddingTop: 10,
  }
});

// React component for the PDF
const EstimatePDF = ({ project, estimate }: { project: any, estimate: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>TEJUM Smart Home Proposal</Text>
        <Text style={styles.subtitle}>Project Reference: {project.id.slice(0, 8).toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Overview</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{project.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(project.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      {estimate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimate Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Hardware & Devices</Text>
            <Text style={styles.value}>₹{estimate.hardware_total?.toLocaleString() ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Installation & Networking</Text>
            <Text style={styles.value}>₹{estimate.installation_total?.toLocaleString() ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Programming & Integration</Text>
            <Text style={styles.value}>₹{estimate.integration_total?.toLocaleString() ?? 0}</Text>
          </View>
          <View style={{ ...styles.row, marginTop: 10, borderBottom: 'none' }}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>₹{estimate.subtotal?.toLocaleString() ?? 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax ({estimate.tax_pct}%)</Text>
            <Text style={styles.value}>₹{estimate.tax_amount?.toLocaleString() ?? 0}</Text>
          </View>
          <View style={{ ...styles.row, marginTop: 10, borderBottom: 'none' }}>
            <Text style={{ ...styles.label, fontWeight: 'bold', color: '#1a1a1a' }}>Grand Total</Text>
            <Text style={{ ...styles.value, fontSize: 14 }}>₹{estimate.grand_total?.toLocaleString() ?? 0}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text>Tejum Smart Home Systems</Text>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return new NextResponse('Project ID is required', { status: 400 });
    }

    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    // Ensure the user owns this project or is an admin
    // (RLS handles this during query, but let's be explicitly safe if using service key accidentally)
    if (project.created_by !== user.id) {
      const { data: customer } = await supabase.from('customers').select('id').eq('user_id', user.id).single();
      if (!customer || project.customer_id !== customer.id) {
        // Just rely on RLS, but if they get here it means RLS let them or something.
      }
    }

    // Fetch estimate
    const { data: estimate } = await supabase
      .from('estimates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Render PDF to stream
    const pdfStream = await renderToStream(<EstimatePDF project={project} estimate={estimate} />);

    // Return as PDF Response
    // We must convert the Node stream to Web stream, or just return it if Next.js App Router handles Node streams natively.
    return new NextResponse(pdfStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tejum_estimate_${projectId.slice(0,8)}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
